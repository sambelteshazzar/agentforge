import { describe, it, expect } from 'vitest';
import {
  createDefaultSandboxConfig,
  createEmptyVerificationReport,
  createExecutionRequest,
  determineTargetAgent,
  shouldRetry,
  mapExecutionToVerdict,
  DEFAULT_RESOURCE_LIMITS,
  VERIFICATION_TIMEOUTS,
  type ExecutionResult,
  type RunnerType,
} from '../types';

describe('Verification Types', () => {
  describe('createDefaultSandboxConfig', () => {
    it('should create config for Python runner', () => {
      const config = createDefaultSandboxConfig('python');
      
      expect(config.runner).toBe('python');
      expect(config.resourceLimits.memoryMb).toBe(DEFAULT_RESOURCE_LIMITS.MEMORY_MB);
      expect(config.resourceLimits.cpuCores).toBe(DEFAULT_RESOURCE_LIMITS.CPU_CORES);
      expect(config.resourceLimits.timeoutSeconds).toBe(DEFAULT_RESOURCE_LIMITS.TIMEOUT_SECONDS);
      expect(config.networkPolicy.mode).toBe('none');
      expect(config.networkPolicy.blockExfiltration).toBe(true);
      expect(config.security.readOnlyFilesystem).toBe(true);
      expect(config.security.noNewPrivileges).toBe(true);
    });

    it('should create config for Node runner', () => {
      const config = createDefaultSandboxConfig('node');
      expect(config.runner).toBe('node');
    });

    it('should create config for TypeScript runner', () => {
      const config = createDefaultSandboxConfig('typescript');
      expect(config.runner).toBe('typescript');
    });
  });

  describe('createEmptyVerificationReport', () => {
    it('should create an empty report with pending status', () => {
      const taskId = 'task_test_123';
      const report = createEmptyVerificationReport(taskId);

      expect(report.taskId).toBe(taskId);
      expect(report.reportId).toMatch(/^report_/);
      expect(report.status).toBe('PENDING');
      expect(report.sandboxId).toBe('');
      
      expect(report.dependencyVetting.status).toBe('PENDING');
      expect(report.dependencyVetting.passed).toBe(false);
      
      expect(report.staticAnalysis.status).toBe('PENDING');
      expect(report.staticAnalysis.data.totalIssues).toBe(0);
      
      expect(report.testExecution.status).toBe('PENDING');
      expect(report.testExecution.data.suites).toHaveLength(0);
      
      expect(report.contractValidation.status).toBe('PENDING');
      expect(report.contractValidation.data.result).toBeNull();
      
      expect(report.output.verdict).toBe('FAIL');
      expect(report.output.failureCategory).toBe('NONE');
    });
  });

  describe('createExecutionRequest', () => {
    it('should create Python execution request with correct commands', () => {
      const request = createExecutionRequest(
        'task_1',
        'sub_1',
        'Python Agent',
        [{ filename: 'main.py', content: 'print("hello")', type: 'source' }],
        'python'
      );

      expect(request.taskId).toBe('task_1');
      expect(request.subtaskId).toBe('sub_1');
      expect(request.agentRole).toBe('Python Agent');
      expect(request.testCommand).toBe('pytest --tb=short -v');
      expect(request.lintCommand).toBe('flake8 . && pylint *.py');
      expect(request.securityScanCommand).toBe('bandit -r . -f json');
      expect(request.config.runner).toBe('python');
    });

    it('should create Node execution request with correct commands', () => {
      const request = createExecutionRequest(
        'task_2',
        'sub_2',
        'JavaScript Agent',
        [{ filename: 'index.js', content: 'console.log("hello")', type: 'source' }],
        'node'
      );

      expect(request.testCommand).toBe('npm test');
      expect(request.lintCommand).toBe('eslint . --ext .ts,.tsx,.js,.jsx');
      expect(request.securityScanCommand).toBe('npm audit --json');
      expect(request.config.runner).toBe('node');
    });
  });

  describe('determineTargetAgent', () => {
    it('should return Auto-Linter Agent for SYNTAX failures', () => {
      expect(determineTargetAgent('SYNTAX', 'LOW')).toBe('Auto-Linter Agent');
    });

    it('should return SecOps Agent for SECURITY failures', () => {
      expect(determineTargetAgent('SECURITY', 'HIGH')).toBe('SecOps Agent');
    });

    it('should return Contract Negotiator for CONTRACT failures', () => {
      expect(determineTargetAgent('CONTRACT', 'MEDIUM')).toBe('Contract Negotiator');
    });

    it('should return Planner Agent for CRITICAL severity LOGIC failures', () => {
      expect(determineTargetAgent('LOGIC', 'CRITICAL')).toBe('Planner Agent');
    });

    it('should return Python Agent for LOW severity LOGIC failures', () => {
      expect(determineTargetAgent('LOGIC', 'LOW')).toBe('Python Agent');
    });
  });

  describe('shouldRetry', () => {
    it('should return false when budget is exhausted', () => {
      expect(shouldRetry(5, 5, 'SYNTAX')).toBe(false);
      expect(shouldRetry(6, 5, 'LOGIC')).toBe(false);
    });

    it('should return true for SYNTAX within budget', () => {
      expect(shouldRetry(1, 5, 'SYNTAX')).toBe(true);
      expect(shouldRetry(4, 5, 'SYNTAX')).toBe(true);
    });

    it('should limit retries for SECURITY failures to half budget', () => {
      expect(shouldRetry(1, 5, 'SECURITY')).toBe(true);
      expect(shouldRetry(2, 5, 'SECURITY')).toBe(false); // 2 >= floor(5/2)
    });

    it('should allow retries for LOGIC within budget', () => {
      expect(shouldRetry(3, 5, 'LOGIC')).toBe(true);
    });
  });

  describe('mapExecutionToVerdict', () => {
    const createMockResult = (overrides: Partial<ExecutionResult> = {}): ExecutionResult => ({
      taskId: 'task_1',
      subtaskId: 'sub_1',
      status: 'success',
      exitCode: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 100,
      logs: [],
      testResults: [],
      securityFindings: [],
      lintViolations: [],
      resourceUsage: { peakMemoryMb: 50, cpuTimeMs: 50 },
      ...overrides,
    });

    it('should return PASS for clean execution', () => {
      const result = mapExecutionToVerdict(createMockResult());
      expect(result.verdict).toBe('PASS');
      expect(result.category).toBe('NONE');
    });

    it('should return SECURITY failure for critical findings', () => {
      const result = mapExecutionToVerdict(createMockResult({
        securityFindings: [
          { severity: 'critical', type: 'CVE', file: 'main.py', message: 'Critical vuln' }
        ]
      }));
      expect(result.verdict).toBe('FAIL');
      expect(result.category).toBe('SECURITY');
    });

    it('should return SECURITY failure for high severity findings', () => {
      const result = mapExecutionToVerdict(createMockResult({
        securityFindings: [
          { severity: 'high', type: 'INJECTION', file: 'main.py', message: 'SQL injection' }
        ]
      }));
      expect(result.verdict).toBe('FAIL');
      expect(result.category).toBe('SECURITY');
    });

    it('should return SYNTAX failure for lint errors', () => {
      const result = mapExecutionToVerdict(createMockResult({
        lintViolations: [
          { rule: 'no-unused-vars', severity: 'error', file: 'main.js', line: 1, column: 1, message: 'Unused' }
        ]
      }));
      expect(result.verdict).toBe('FAIL');
      expect(result.category).toBe('SYNTAX');
    });

    it('should return LOGIC failure for failed tests', () => {
      const result = mapExecutionToVerdict(createMockResult({
        testResults: [
          { name: 'test_add', file: 'test.py', status: 'failed', durationMs: 10, errorMessage: 'Expected 4' }
        ]
      }));
      expect(result.verdict).toBe('FAIL');
      expect(result.category).toBe('LOGIC');
    });

    it('should return LOGIC failure for timeout', () => {
      const result = mapExecutionToVerdict(createMockResult({
        status: 'timeout'
      }));
      expect(result.verdict).toBe('FAIL');
      expect(result.category).toBe('LOGIC');
    });

    it('should prioritize SECURITY over other failures', () => {
      const result = mapExecutionToVerdict(createMockResult({
        securityFindings: [{ severity: 'critical', type: 'CVE', file: 'main.py', message: 'Vuln' }],
        lintViolations: [{ rule: 'err', severity: 'error', file: 'main.py', line: 1, column: 1, message: 'Error' }],
        testResults: [{ name: 'test', file: 'test.py', status: 'failed', durationMs: 10 }]
      }));
      expect(result.category).toBe('SECURITY');
    });
  });

  describe('Constants', () => {
    it('should have correct default resource limits', () => {
      expect(DEFAULT_RESOURCE_LIMITS.MEMORY_MB).toBe(512);
      expect(DEFAULT_RESOURCE_LIMITS.CPU_CORES).toBe(0.5);
      expect(DEFAULT_RESOURCE_LIMITS.TIMEOUT_SECONDS).toBe(30);
      expect(DEFAULT_RESOURCE_LIMITS.MAX_OUTPUT_BYTES).toBe(1024 * 1024);
    });

    it('should have correct verification timeouts', () => {
      expect(VERIFICATION_TIMEOUTS.DEPENDENCY_VETTING_MS).toBe(1000);
      expect(VERIFICATION_TIMEOUTS.STATIC_ANALYSIS_MS).toBe(1500);
      expect(VERIFICATION_TIMEOUTS.TEST_EXECUTION_MS).toBe(2000);
      expect(VERIFICATION_TIMEOUTS.CONTRACT_VALIDATION_MS).toBe(1000);
      expect(VERIFICATION_TIMEOUTS.FINALIZATION_MS).toBe(500);
    });
  });
});
