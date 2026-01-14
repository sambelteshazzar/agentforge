// Sandbox Types for the Verifier Agent's Execution Environment
// These types define the interface between the Verifier and the Docker sandbox

export type RunnerType = 'python' | 'node' | 'typescript';
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failure' | 'timeout' | 'error';

export interface ResourceLimits {
  memoryMb: number;
  cpuCores: number;
  timeoutSeconds: number;
  maxOutputBytes: number;
}

export interface NetworkPolicy {
  mode: 'none' | 'restricted' | 'build-only';
  allowedHosts?: string[];
  blockExfiltration: boolean;
}

export interface SecurityConfig {
  readOnlyFilesystem: boolean;
  noNewPrivileges: boolean;
  dropCapabilities: string[];
  seccompProfile: 'default' | 'strict';
}

export interface SandboxConfig {
  runner: RunnerType;
  resourceLimits: ResourceLimits;
  networkPolicy: NetworkPolicy;
  security: SecurityConfig;
  environment: Record<string, string>;
}

export interface CodeArtifact {
  filename: string;
  content: string;
  type: 'source' | 'test' | 'config' | 'requirements';
}

export interface ExecutionRequest {
  taskId: string;
  subtaskId: string;
  agentRole: string;
  artifacts: CodeArtifact[];
  testCommand: string;
  lintCommand?: string;
  securityScanCommand?: string;
  config: SandboxConfig;
}

export interface ExecutionLog {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  content: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  file: string;
  line?: number;
  message: string;
  cwe?: string;
}

export interface LintViolation {
  rule: string;
  severity: 'warning' | 'error';
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface ExecutionResult {
  taskId: string;
  subtaskId: string;
  status: ExecutionStatus;
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

// Factory functions
export function createDefaultSandboxConfig(runner: RunnerType): SandboxConfig {
  return {
    runner,
    resourceLimits: {
      memoryMb: 512,
      cpuCores: 0.5,
      timeoutSeconds: 30,
      maxOutputBytes: 1024 * 1024, // 1MB
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
  };
}

export function createExecutionRequest(
  taskId: string,
  subtaskId: string,
  agentRole: string,
  artifacts: CodeArtifact[],
  runner: RunnerType
): ExecutionRequest {
  const config = createDefaultSandboxConfig(runner);
  
  const testCommand = runner === 'python' 
    ? 'pytest --tb=short -v'
    : 'npm test';
    
  const lintCommand = runner === 'python'
    ? 'flake8 . && pylint *.py'
    : 'eslint . --ext .ts,.tsx,.js,.jsx';
    
  const securityScanCommand = runner === 'python'
    ? 'bandit -r . -f json'
    : 'npm audit --json';

  return {
    taskId,
    subtaskId,
    agentRole,
    artifacts,
    testCommand,
    lintCommand,
    securityScanCommand,
    config,
  };
}

// Utility to map execution result to verifier verdict
export function mapExecutionToVerdict(result: ExecutionResult): {
  verdict: 'PASS' | 'FAIL';
  category: 'SYNTAX' | 'LOGIC' | 'SECURITY' | 'CONTRACT' | 'NONE';
} {
  // Check for security issues first (highest priority)
  const criticalSecurity = result.securityFindings.filter(
    f => f.severity === 'critical' || f.severity === 'high'
  );
  if (criticalSecurity.length > 0) {
    return { verdict: 'FAIL', category: 'SECURITY' };
  }

  // Check for lint errors (syntax issues)
  const lintErrors = result.lintViolations.filter(v => v.severity === 'error');
  if (lintErrors.length > 0) {
    return { verdict: 'FAIL', category: 'SYNTAX' };
  }

  // Check for test failures (logic issues)
  const failedTests = result.testResults.filter(
    t => t.status === 'failed' || t.status === 'error'
  );
  if (failedTests.length > 0) {
    return { verdict: 'FAIL', category: 'LOGIC' };
  }

  // Check for timeout or execution errors
  if (result.status === 'timeout' || result.status === 'error') {
    return { verdict: 'FAIL', category: 'LOGIC' };
  }

  return { verdict: 'PASS', category: 'NONE' };
}
