// Unified Verification Types - Single source of truth
// Consolidates sandboxTypes.ts and verifierTypes.ts

import { AgentRole, SeverityLevel, UnifiedTaskSchema } from "../taskSchema";

// ============= Core Enums & Literals =============

export type RunnerType = 'python' | 'node' | 'typescript';
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failure' | 'timeout' | 'error';
export type VerifierVerdict = 'PASS' | 'FAIL';
export type FailureCategory = 'SYNTAX' | 'LOGIC' | 'SECURITY' | 'CONTRACT' | 'NONE';
export type DependencyStatus = 'APPROVED' | 'BANNED' | 'UNPINNED' | 'OUTDATED';
export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type NetworkMode = 'none' | 'restricted' | 'build-only';
export type SeccompProfile = 'default' | 'strict';

// ============= Constants =============

export const VERIFICATION_TIMEOUTS = {
  DEPENDENCY_VETTING_MS: 1000,
  STATIC_ANALYSIS_MS: 1500,
  TEST_EXECUTION_MS: 2000,
  CONTRACT_VALIDATION_MS: 1000,
  FINALIZATION_MS: 500,
} as const;

export const DEFAULT_RESOURCE_LIMITS = {
  MEMORY_MB: 512,
  CPU_CORES: 0.5,
  TIMEOUT_SECONDS: 30,
  MAX_OUTPUT_BYTES: 1024 * 1024, // 1MB
} as const;

// ============= Resource & Security Configuration =============

export interface ResourceLimits {
  memoryMb: number;
  cpuCores: number;
  timeoutSeconds: number;
  maxOutputBytes: number;
}

export interface NetworkPolicy {
  mode: NetworkMode;
  allowedHosts?: string[];
  blockExfiltration: boolean;
}

export interface SecurityConfig {
  readOnlyFilesystem: boolean;
  noNewPrivileges: boolean;
  dropCapabilities: string[];
  seccompProfile: SeccompProfile;
}

export interface SandboxConfig {
  runner: RunnerType;
  resourceLimits: ResourceLimits;
  networkPolicy: NetworkPolicy;
  security: SecurityConfig;
  environment: Record<string, string>;
}

// ============= Code Artifacts =============

export interface CodeArtifact {
  filename: string;
  content: string;
  type: 'source' | 'test' | 'config' | 'requirements';
}

// ============= Execution Request/Response =============

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

// ============= Analysis Results =============

export interface DependencyVet {
  name: string;
  version: string;
  status: DependencyStatus;
  sourceFile: 'requirements.txt' | 'package.json' | 'Cargo.toml' | 'go.mod';
  vulnerability?: VulnerabilityInfo;
  reason?: string;
}

export interface VulnerabilityInfo {
  cveId: string;
  severity: SeverityLevel;
  description: string;
  fixVersion?: string;
  cvssScore?: number;
}

export interface LintViolation {
  rule: string;
  severity: 'warning' | 'error';
  file: string;
  line: number;
  column: number;
  message: string;
  fixAvailable?: boolean;
  suggestedFix?: string;
}

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  file: string;
  line?: number;
  message: string;
  cwe?: string;
  cveId?: string;
  remediation?: string;
}

export interface TestResult {
  name: string;
  file: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  coveragePercentage?: number;
}

export interface TestSuiteResult {
  framework: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  durationMs: number;
  coveragePercentage: number;
  testResults: TestResult[];
}

export interface ContractViolation {
  endpoint: string;
  method: string;
  violationType: 'missing_endpoint' | 'schema_mismatch' | 'wrong_status_code' | 'missing_field';
  expected: string;
  actual: string;
  severity: SeverityLevel;
}

export interface ContractValidationResult {
  validator: string;
  specUrl: string;
  totalEndpoints: number;
  validated: number;
  violations: ContractViolation[];
  passed: boolean;
}

// ============= Verifier Output =============

export interface ExecutionLogs {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

export interface VerifierOutput {
  verdict: VerifierVerdict;
  failureCategory: FailureCategory;
  logs: ExecutionLogs;
  feedbackToAgent: string;
  repairSuggestion: string;
  retryRecommended: boolean;
  targetAgent?: AgentRole;
  iterationCount: number;
  budgetRemaining: number;
}

// ============= Complete Verification Report =============

export interface VerificationPhaseResult<T> {
  status: ScanStatus;
  passed: boolean;
  data: T;
}

export interface DependencyVettingData {
  dependencies: DependencyVet[];
  bannedFound: number;
  unpinnedFound: number;
}

export interface StaticAnalysisData {
  lintingResults: LintViolation[];
  securityScans: SecurityFinding[];
  totalIssues: number;
  criticalIssues: number;
}

export interface TestExecutionData {
  suites: TestSuiteResult[];
  overallCoverage: number;
}

export interface ContractValidationData {
  result: ContractValidationResult | null;
}

export interface VerificationReport {
  reportId: string;
  taskId: string;
  sandboxId: string;
  startedAt: string;
  completedAt: string;
  status: ScanStatus;
  
  dependencyVetting: VerificationPhaseResult<DependencyVettingData>;
  staticAnalysis: VerificationPhaseResult<StaticAnalysisData>;
  testExecution: VerificationPhaseResult<TestExecutionData>;
  contractValidation: VerificationPhaseResult<ContractValidationData>;
  
  output: VerifierOutput;
}

// ============= Factory Functions =============

export function createDefaultSandboxConfig(runner: RunnerType): SandboxConfig {
  return {
    runner,
    resourceLimits: {
      memoryMb: DEFAULT_RESOURCE_LIMITS.MEMORY_MB,
      cpuCores: DEFAULT_RESOURCE_LIMITS.CPU_CORES,
      timeoutSeconds: DEFAULT_RESOURCE_LIMITS.TIMEOUT_SECONDS,
      maxOutputBytes: DEFAULT_RESOURCE_LIMITS.MAX_OUTPUT_BYTES,
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

export function createEmptyVerificationReport(taskId: string): VerificationReport {
  const now = new Date().toISOString();
  return {
    reportId: `report_${Date.now().toString(36)}`,
    taskId,
    sandboxId: '',
    startedAt: now,
    completedAt: '',
    status: 'PENDING',
    
    dependencyVetting: {
      status: 'PENDING',
      passed: false,
      data: { dependencies: [], bannedFound: 0, unpinnedFound: 0 },
    },
    
    staticAnalysis: {
      status: 'PENDING',
      passed: false,
      data: { lintingResults: [], securityScans: [], totalIssues: 0, criticalIssues: 0 },
    },
    
    testExecution: {
      status: 'PENDING',
      passed: false,
      data: { suites: [], overallCoverage: 0 },
    },
    
    contractValidation: {
      status: 'PENDING',
      passed: false,
      data: { result: null },
    },
    
    output: {
      verdict: 'FAIL',
      failureCategory: 'NONE',
      logs: { stdout: '', stderr: '', exitCode: -1, executionTimeMs: 0 },
      feedbackToAgent: '',
      repairSuggestion: '',
      retryRecommended: false,
      iterationCount: 0,
      budgetRemaining: 0,
    },
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

// ============= Helper Functions =============

export function determineTargetAgent(
  failureCategory: FailureCategory,
  severity: SeverityLevel
): AgentRole {
  if (failureCategory === 'SYNTAX') return 'Auto-Linter Agent';
  if (failureCategory === 'SECURITY') return 'SecOps Agent';
  if (failureCategory === 'CONTRACT') return 'Contract Negotiator';
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'Planner Agent';
  return 'Python Agent';
}

export function shouldRetry(
  iterationCount: number,
  maxBudget: number,
  failureCategory: FailureCategory
): boolean {
  if (iterationCount >= maxBudget) return false;
  if (failureCategory === 'SECURITY') {
    return iterationCount < Math.floor(maxBudget / 2);
  }
  return true;
}

export function mapExecutionToVerdict(result: ExecutionResult): {
  verdict: VerifierVerdict;
  category: FailureCategory;
} {
  const criticalSecurity = result.securityFindings.filter(
    f => f.severity === 'critical' || f.severity === 'high'
  );
  if (criticalSecurity.length > 0) {
    return { verdict: 'FAIL', category: 'SECURITY' };
  }

  const lintErrors = result.lintViolations.filter(v => v.severity === 'error');
  if (lintErrors.length > 0) {
    return { verdict: 'FAIL', category: 'SYNTAX' };
  }

  const failedTests = result.testResults.filter(
    t => t.status === 'failed' || t.status === 'error'
  );
  if (failedTests.length > 0) {
    return { verdict: 'FAIL', category: 'LOGIC' };
  }

  if (result.status === 'timeout' || result.status === 'error') {
    return { verdict: 'FAIL', category: 'LOGIC' };
  }

  return { verdict: 'PASS', category: 'NONE' };
}
