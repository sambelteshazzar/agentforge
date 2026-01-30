import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { 
  ExecutionRequest, 
  CodeArtifact, 
  RunnerType 
} from '@/lib/verification/types';

interface ExecutionLog {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  content: string;
}

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  errorMessage?: string;
}

interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  file: string;
  line?: number;
  message: string;
}

interface LintViolation {
  rule: string;
  severity: 'warning' | 'error';
  file: string;
  line: number;
  column: number;
  message: string;
}

interface SandboxExecutionResult {
  taskId: string;
  subtaskId: string;
  status: 'success' | 'failure' | 'timeout' | 'error';
  exitCode: number;
  startTime: string;
  endTime: string;
  durationMs: number;
  logs: ExecutionLog[];
  testResults: TestResult[];
  securityFindings: SecurityFinding[];
  lintViolations: LintViolation[];
  resourceUsage: {
    peakMemoryMb: number;
    cpuTimeMs: number;
  };
}

interface UseSandboxExecutionReturn {
  execute: (code: string, language: string, testCode?: string) => Promise<SandboxExecutionResult | null>;
  isExecuting: boolean;
  lastResult: SandboxExecutionResult | null;
  error: string | null;
}

export function useSandboxExecution(): UseSandboxExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<SandboxExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mapLanguageToRunner = (language: string): RunnerType => {
    const pythonLangs = ['python', 'py'];
    const nodeLangs = ['javascript', 'js', 'jsx'];
    const tsLangs = ['typescript', 'ts', 'tsx'];

    if (pythonLangs.includes(language.toLowerCase())) return 'python';
    if (tsLangs.includes(language.toLowerCase())) return 'typescript';
    if (nodeLangs.includes(language.toLowerCase())) return 'node';
    
    return 'node'; // Default to node
  };

  const getFileExtension = (runner: RunnerType): string => {
    switch (runner) {
      case 'python': return '.py';
      case 'typescript': return '.ts';
      case 'node': return '.js';
    }
  };

  const execute = async (
    code: string, 
    language: string, 
    testCode?: string
  ): Promise<SandboxExecutionResult | null> => {
    setIsExecuting(true);
    setError(null);

    try {
      const runner = mapLanguageToRunner(language);
      const ext = getFileExtension(runner);
      const taskId = `task_${Date.now().toString(36)}`;
      const subtaskId = `sub_${Date.now().toString(36)}`;

      const artifacts: CodeArtifact[] = [
        {
          filename: `main${ext}`,
          content: code,
          type: 'source',
        },
      ];

      if (testCode) {
        artifacts.push({
          filename: `test_main${ext}`,
          content: testCode,
          type: 'test',
        });
      }

      const request: ExecutionRequest = {
        taskId,
        subtaskId,
        agentRole: `${language.charAt(0).toUpperCase() + language.slice(1)} Agent`,
        artifacts,
        testCommand: runner === 'python' ? 'pytest --tb=short -v' : 'npm test',
        lintCommand: runner === 'python' ? 'flake8 . && pylint *.py' : 'eslint . --ext .ts,.tsx,.js,.jsx',
        securityScanCommand: runner === 'python' ? 'bandit -r . -f json' : 'npm audit --json',
        config: {
          runner,
          resourceLimits: {
            memoryMb: 512,
            cpuCores: 0.5,
            timeoutSeconds: 30,
            maxOutputBytes: 1024 * 1024,
          },
          networkPolicy: {
            mode: 'none',
            blockExfiltration: true,
          },
          security: {
            readOnlyFilesystem: true,
            noNewPrivileges: true,
            dropCapabilities: ['ALL'],
            seccompProfile: 'strict',
          },
          environment: {},
        },
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sandbox-execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sandbox execution failed');
      }

      const result: SandboxExecutionResult = await response.json();
      setLastResult(result);

      // Show toast based on result
      if (result.status === 'success') {
        toast({
          title: 'Execution Complete',
          description: `All checks passed in ${result.durationMs}ms`,
        });
      } else {
        const issues = [
          result.testResults.filter(t => t.status === 'failed').length + ' failed tests',
          result.securityFindings.length + ' security findings',
          result.lintViolations.filter(v => v.severity === 'error').length + ' lint errors',
        ].filter(s => !s.startsWith('0 ')).join(', ');

        toast({
          variant: 'destructive',
          title: 'Execution Failed',
          description: issues || 'Check the logs for details',
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Execution Error',
        description: errorMessage,
      });
      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    execute,
    isExecuting,
    lastResult,
    error,
  };
}
