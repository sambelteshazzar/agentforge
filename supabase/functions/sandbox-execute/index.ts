import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CodeArtifact {
  filename: string;
  content: string;
  type: 'source' | 'test' | 'config' | 'requirements';
}

interface ResourceLimits {
  memoryMb: number;
  cpuCores: number;
  timeoutSeconds: number;
  maxOutputBytes: number;
}

interface SandboxConfig {
  runner: 'python' | 'node' | 'typescript';
  resourceLimits: ResourceLimits;
}

interface ExecutionRequest {
  taskId: string;
  subtaskId: string;
  agentRole: string;
  artifacts: CodeArtifact[];
  testCommand: string;
  lintCommand?: string;
  securityScanCommand?: string;
  config: SandboxConfig;
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

// Simulated sandbox execution - in production, this would call Docker API
async function executeInSandbox(request: ExecutionRequest): Promise<{
  status: 'success' | 'failure' | 'timeout' | 'error';
  exitCode: number;
  logs: { timestamp: string; stream: string; content: string }[];
  testResults: TestResult[];
  securityFindings: SecurityFinding[];
  lintViolations: LintViolation[];
  durationMs: number;
  resourceUsage: { peakMemoryMb: number; cpuTimeMs: number };
}> {
  const startTime = Date.now();
  const logs: { timestamp: string; stream: string; content: string }[] = [];
  const testResults: TestResult[] = [];
  const securityFindings: SecurityFinding[] = [];
  const lintViolations: LintViolation[] = [];

  // Log sandbox initialization
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: `[sandbox] Initializing ${request.config.runner} runner...`
  });

  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: `[sandbox] Resource limits: ${request.config.resourceLimits.memoryMb}MB RAM, ${request.config.resourceLimits.cpuCores} CPU, ${request.config.resourceLimits.timeoutSeconds}s timeout`
  });

  // Simulate dependency vetting
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: '[vetting] Scanning dependencies for vulnerabilities...'
  });

  // Check for requirements/package.json
  const requirementsFile = request.artifacts.find(a => 
    a.filename === 'requirements.txt' || a.filename === 'package.json'
  );

  if (requirementsFile) {
    logs.push({
      timestamp: new Date().toISOString(),
      stream: 'stdout',
      content: `[vetting] Found ${requirementsFile.filename}, checking versions...`
    });

    // Simulate finding unpinned versions
    if (requirementsFile.content.includes('>=') || requirementsFile.content.includes('^')) {
      securityFindings.push({
        severity: 'low',
        type: 'UNPINNED_DEPENDENCY',
        file: requirementsFile.filename,
        message: 'Found unpinned dependency versions. Consider pinning for reproducibility.'
      });
    }
  }

  // Simulate static analysis
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: '[lint] Running static analysis...'
  });

  // Check source files for common issues
  const sourceFiles = request.artifacts.filter(a => a.type === 'source');
  for (const file of sourceFiles) {
    // Check for banned patterns
    if (file.content.includes('eval(')) {
      securityFindings.push({
        severity: 'high',
        type: 'DANGEROUS_FUNCTION',
        file: file.filename,
        message: 'Use of eval() detected - potential code injection vulnerability',
        line: file.content.split('\n').findIndex(l => l.includes('eval(')) + 1
      });
    }

    if (file.content.includes('os.system(') || file.content.includes('subprocess.call(')) {
      securityFindings.push({
        severity: 'medium',
        type: 'SHELL_INJECTION',
        file: file.filename,
        message: 'Shell command execution detected - validate inputs carefully'
      });
    }

    // Check for hardcoded secrets patterns
    const secretPatterns = [/api_key\s*=\s*['"][^'"]+['"]/, /password\s*=\s*['"][^'"]+['"]/];
    for (const pattern of secretPatterns) {
      if (pattern.test(file.content)) {
        securityFindings.push({
          severity: 'critical',
          type: 'HARDCODED_SECRET',
          file: file.filename,
          message: 'Potential hardcoded secret detected'
        });
      }
    }

    // Simulate lint violations
    const lines = file.content.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 120) {
        lintViolations.push({
          rule: 'max-line-length',
          severity: 'warning',
          file: file.filename,
          line: index + 1,
          column: 121,
          message: 'Line exceeds maximum length of 120 characters'
        });
      }
    });
  }

  // Simulate security scanning
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: `[security] Running ${request.config.runner === 'python' ? 'bandit' : 'snyk'} scan...`
  });

  // Simulate test execution
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: `[test] Executing: ${request.testCommand}`
  });

  const testFiles = request.artifacts.filter(a => a.type === 'test');
  
  if (testFiles.length === 0) {
    logs.push({
      timestamp: new Date().toISOString(),
      stream: 'stderr',
      content: '[test] Warning: No test files provided'
    });
  } else {
    // Simulate running tests
    for (const testFile of testFiles) {
      // Parse test functions from content (simplified)
      const testFunctions = testFile.content.match(/(?:def test_|it\(['"]|test\(['"])([^('"]+)/g) || [];
      
      for (const testMatch of testFunctions) {
        const testName = testMatch.replace(/(?:def test_|it\(['"]|test\(['")])/, '');
        
        // Randomly determine test outcome (in real implementation, this runs actual tests)
        const passed = Math.random() > 0.2; // 80% pass rate simulation
        
        testResults.push({
          name: testName,
          status: passed ? 'passed' : 'failed',
          duration: Math.floor(Math.random() * 500) + 50,
          errorMessage: passed ? undefined : 'Assertion failed: expected values do not match'
        });

        logs.push({
          timestamp: new Date().toISOString(),
          stream: 'stdout',
          content: `[test] ${passed ? '✓' : '✗'} ${testName} (${testResults[testResults.length - 1].duration}ms)`
        });
      }
    }

    // If no test functions found but test files exist
    if (testResults.length === 0) {
      testResults.push({
        name: 'placeholder_test',
        status: 'passed',
        duration: 10
      });
      logs.push({
        timestamp: new Date().toISOString(),
        stream: 'stdout',
        content: '[test] ✓ placeholder_test (10ms)'
      });
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Determine overall status
  const hasFailedTests = testResults.some(t => t.status === 'failed' || t.status === 'error');
  const hasCriticalSecurity = securityFindings.some(f => f.severity === 'critical' || f.severity === 'high');
  const hasLintErrors = lintViolations.some(v => v.severity === 'error');

  let status: 'success' | 'failure' | 'timeout' | 'error' = 'success';
  let exitCode = 0;

  if (hasCriticalSecurity || hasFailedTests || hasLintErrors) {
    status = 'failure';
    exitCode = 1;
  }

  // Final summary log
  logs.push({
    timestamp: new Date().toISOString(),
    stream: 'stdout',
    content: `[sandbox] Execution complete in ${durationMs}ms - ${status.toUpperCase()}`
  });

  return {
    status,
    exitCode,
    logs,
    testResults,
    securityFindings,
    lintViolations,
    durationMs,
    resourceUsage: {
      peakMemoryMb: Math.floor(Math.random() * 200) + 50,
      cpuTimeMs: Math.floor(durationMs * 0.7)
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ExecutionRequest = await req.json();
    
    console.log(`[sandbox-execute] Starting execution for task ${request.taskId}, subtask ${request.subtaskId}`);
    console.log(`[sandbox-execute] Runner: ${request.config.runner}, Artifacts: ${request.artifacts.length}`);

    const startTime = new Date().toISOString();
    const result = await executeInSandbox(request);
    const endTime = new Date().toISOString();

    const response = {
      taskId: request.taskId,
      subtaskId: request.subtaskId,
      status: result.status,
      exitCode: result.exitCode,
      startTime,
      endTime,
      durationMs: result.durationMs,
      logs: result.logs,
      testResults: result.testResults,
      securityFindings: result.securityFindings,
      lintViolations: result.lintViolations,
      resourceUsage: result.resourceUsage
    };

    console.log(`[sandbox-execute] Completed: ${result.status}, Tests: ${result.testResults.length}, Security: ${result.securityFindings.length}, Lint: ${result.lintViolations.length}`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[sandbox-execute] Error:', errorMessage);
    
    return new Response(JSON.stringify({
      status: 'error',
      exitCode: -1,
      logs: [{
        timestamp: new Date().toISOString(),
        stream: 'stderr',
        content: `Sandbox execution error: ${errorMessage}`
      }],
      testResults: [],
      securityFindings: [],
      lintViolations: [],
      durationMs: 0,
      resourceUsage: { peakMemoryMb: 0, cpuTimeMs: 0 }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
