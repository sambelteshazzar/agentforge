// Mock data fixtures for verification demos
// Extracted from components for cleaner separation of concerns

import type {
  DependencyVet,
  LintViolation,
  SecurityFinding,
  TestResult,
  ContractViolation,
} from './types';

export const mockDependencies: DependencyVet[] = [
  { 
    name: 'fastapi', 
    version: '0.95.2', 
    status: 'APPROVED', 
    sourceFile: 'requirements.txt' 
  },
  { 
    name: 'pydantic', 
    version: '2.0.3', 
    status: 'APPROVED', 
    sourceFile: 'requirements.txt' 
  },
  { 
    name: 'python-jose', 
    version: '3.3.0', 
    status: 'APPROVED', 
    sourceFile: 'requirements.txt' 
  },
  { 
    name: 'requests', 
    version: '*', 
    status: 'UNPINNED', 
    sourceFile: 'requirements.txt', 
    reason: 'Version not pinned - security risk' 
  },
  { 
    name: 'pickle', 
    version: 'any', 
    status: 'BANNED', 
    sourceFile: 'requirements.txt', 
    reason: 'Banned: arbitrary code execution risk' 
  },
];

export const mockLintViolations: LintViolation[] = [
  { 
    rule: 'E501',
    severity: 'warning',
    file: 'src/auth/router.py', 
    line: 45, 
    column: 1, 
    message: 'Line too long (89 > 88 characters)',
    fixAvailable: true,
  },
  { 
    rule: 'react-hooks/exhaustive-deps',
    severity: 'warning',
    file: 'src/components/LoginForm.tsx', 
    line: 23, 
    column: 5, 
    message: "Missing dependency 'onSubmit' in useEffect",
    fixAvailable: true,
  },
];

export const mockSecurityFindings: SecurityFinding[] = [
  { 
    severity: 'high',
    type: 'banned_pattern',
    file: 'src/auth/utils.py', 
    line: 12, 
    message: 'Use of eval() detected',
    remediation: 'Replace eval() with ast.literal_eval() or proper parsing',
  },
  { 
    severity: 'medium',
    type: 'vulnerability',
    file: 'requirements.txt', 
    message: 'CVE-2023-XXXXX in requests<2.31.0',
    cveId: 'CVE-2023-32681',
    remediation: 'Upgrade requests to >=2.31.0',
  },
];

export const mockTestResults: TestResult[] = [
  { 
    name: 'test_login_success', 
    file: 'tests/unit/test_auth.py', 
    status: 'passed', 
    durationMs: 45 
  },
  { 
    name: 'test_login_invalid_email', 
    file: 'tests/unit/test_auth.py', 
    status: 'passed', 
    durationMs: 32 
  },
  { 
    name: 'test_login_wrong_password', 
    file: 'tests/unit/test_auth.py', 
    status: 'failed', 
    durationMs: 28, 
    errorMessage: 'Expected 401, got 500',
    stackTrace: 'AssertionError at test_auth.py:67',
  },
  { 
    name: 'test_token_refresh', 
    file: 'tests/unit/test_auth.py', 
    status: 'passed', 
    durationMs: 51 
  },
  { 
    name: 'test_logout', 
    file: 'tests/unit/test_auth.py', 
    status: 'skipped', 
    durationMs: 0 
  },
];

export const mockContractViolations: ContractViolation[] = [
  { 
    endpoint: '/auth/login', 
    method: 'POST', 
    violationType: 'schema_mismatch', 
    expected: 'TokenResponse with expires_in: number', 
    actual: 'expires_in: string', 
    severity: 'HIGH' 
  },
];

// Helper to generate test suite from test results
export function createMockTestSuite(testResults: TestResult[] = mockTestResults) {
  const passed = testResults.filter(t => t.status === 'passed').length;
  const failed = testResults.filter(t => t.status === 'failed').length;
  const skipped = testResults.filter(t => t.status === 'skipped').length;
  const errors = testResults.filter(t => t.status === 'error').length;
  const totalDuration = testResults.reduce((sum, t) => sum + t.durationMs, 0);

  return {
    framework: 'pytest',
    totalTests: testResults.length,
    passed,
    failed,
    skipped,
    errors,
    durationMs: totalDuration,
    coveragePercentage: 78,
    testResults,
  };
}
