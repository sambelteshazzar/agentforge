// Verifier Agent Types - Sandboxed Execution & Evaluation
// Based on the advanced multi-agent architecture

import { AgentRole, SeverityLevel, UnifiedTaskSchema } from "./taskSchema";

// Verdict Types
export type VerifierVerdict = "PASS" | "FAIL";
export type FailureCategory = "SYNTAX" | "LOGIC" | "SECURITY" | "CONTRACT" | "NONE";
export type DependencyStatus = "APPROVED" | "BANNED" | "UNPINNED" | "OUTDATED";
export type ScanStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

// Sandbox Configuration
export interface SandboxConfig {
  id: string;
  container_image: string;
  resource_limits: {
    cpu_limit: string;
    memory_limit: string;
    timeout_seconds: number;
    network_access: boolean;
  };
  ephemeral: boolean;
  created_at: string;
}

// Dependency Vetting
export interface DependencyVet {
  name: string;
  version: string;
  status: DependencyStatus;
  source_file: "requirements.txt" | "package.json" | "Cargo.toml" | "go.mod";
  vulnerability?: VulnerabilityInfo;
  reason?: string;
}

export interface VulnerabilityInfo {
  cve_id: string;
  severity: SeverityLevel;
  description: string;
  fix_version?: string;
  cvss_score?: number;
}

// Static Analysis Results
export interface StaticAnalysisResult {
  linter: string;
  file_path: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: "error" | "warning" | "info";
  fix_available: boolean;
  suggested_fix?: string;
}

export interface SecurityScanResult {
  scanner: string;
  finding_type: "vulnerability" | "code_smell" | "secret_exposure" | "banned_pattern";
  file_path: string;
  line?: number;
  severity: SeverityLevel;
  description: string;
  cve_id?: string;
  remediation?: string;
}

// Test Execution
export interface TestResult {
  test_name: string;
  file_path: string;
  status: "passed" | "failed" | "skipped" | "error";
  duration_ms: number;
  assertion_message?: string;
  stack_trace?: string;
  coverage_percentage?: number;
}

export interface TestSuiteResult {
  framework: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  errors: number;
  duration_ms: number;
  coverage_percentage: number;
  test_results: TestResult[];
}

// Contract Validation
export interface ContractViolation {
  endpoint: string;
  method: string;
  violation_type: "missing_endpoint" | "schema_mismatch" | "wrong_status_code" | "missing_field";
  expected: string;
  actual: string;
  severity: SeverityLevel;
}

export interface ContractValidationResult {
  validator: string;
  spec_url: string;
  total_endpoints: number;
  validated: number;
  violations: ContractViolation[];
  passed: boolean;
}

// Execution Logs
export interface ExecutionLogs {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
}

// Main Verifier Output
export interface VerifierOutput {
  verdict: VerifierVerdict;
  failure_category: FailureCategory;
  logs: ExecutionLogs;
  feedback_to_agent: string;
  repair_suggestion: string;
  retry_recommended: boolean;
  target_agent?: AgentRole;
  iteration_count: number;
  budget_remaining: number;
}

// Complete Verification Report
export interface VerificationReport {
  report_id: string;
  task_id: string;
  sandbox_id: string;
  started_at: string;
  completed_at: string;
  status: ScanStatus;
  
  // Phase Results
  dependency_vetting: {
    status: ScanStatus;
    dependencies: DependencyVet[];
    banned_found: number;
    unpinned_found: number;
    passed: boolean;
  };
  
  static_analysis: {
    status: ScanStatus;
    linting_results: StaticAnalysisResult[];
    security_scans: SecurityScanResult[];
    total_issues: number;
    critical_issues: number;
    passed: boolean;
  };
  
  test_execution: {
    status: ScanStatus;
    suites: TestSuiteResult[];
    overall_coverage: number;
    passed: boolean;
  };
  
  contract_validation: {
    status: ScanStatus;
    result: ContractValidationResult | null;
    passed: boolean;
  };
  
  // Final Output
  output: VerifierOutput;
}

// Sandbox Execution Request
export interface SandboxExecutionRequest {
  task_schema: UnifiedTaskSchema;
  agent_outputs: {
    code_files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    test_files: Array<{
      path: string;
      content: string;
    }>;
    dependency_files: Array<{
      path: string;
      content: string;
      type: "requirements.txt" | "package.json" | "Cargo.toml" | "go.mod";
    }>;
  };
  config?: Partial<SandboxConfig>;
}

// Helper functions
export const createEmptySandboxConfig = (): SandboxConfig => ({
  id: `sandbox_${Date.now().toString(36)}`,
  container_image: "verifier:latest",
  resource_limits: {
    cpu_limit: "1.0",
    memory_limit: "512Mi",
    timeout_seconds: 300,
    network_access: false,
  },
  ephemeral: true,
  created_at: new Date().toISOString(),
});

export const createEmptyVerificationReport = (taskId: string): VerificationReport => ({
  report_id: `report_${Date.now().toString(36)}`,
  task_id: taskId,
  sandbox_id: "",
  started_at: new Date().toISOString(),
  completed_at: "",
  status: "PENDING",
  
  dependency_vetting: {
    status: "PENDING",
    dependencies: [],
    banned_found: 0,
    unpinned_found: 0,
    passed: false,
  },
  
  static_analysis: {
    status: "PENDING",
    linting_results: [],
    security_scans: [],
    total_issues: 0,
    critical_issues: 0,
    passed: false,
  },
  
  test_execution: {
    status: "PENDING",
    suites: [],
    overall_coverage: 0,
    passed: false,
  },
  
  contract_validation: {
    status: "PENDING",
    result: null,
    passed: false,
  },
  
  output: {
    verdict: "FAIL",
    failure_category: "NONE",
    logs: { stdout: "", stderr: "", exit_code: -1, execution_time_ms: 0 },
    feedback_to_agent: "",
    repair_suggestion: "",
    retry_recommended: false,
    iteration_count: 0,
    budget_remaining: 0,
  },
});

export const determineTargetAgent = (
  failureCategory: FailureCategory,
  severity: SeverityLevel
): AgentRole => {
  // Routing based on failure category and severity
  if (failureCategory === "SYNTAX") {
    return "Auto-Linter Agent";
  }
  if (failureCategory === "SECURITY") {
    return "SecOps Agent";
  }
  if (failureCategory === "CONTRACT") {
    return "Contract Negotiator";
  }
  if (severity === "CRITICAL" || severity === "HIGH") {
    return "Planner Agent";
  }
  // Default to language agent for logic errors
  return "Python Agent";
};

export const shouldRetry = (
  iterationCount: number,
  maxBudget: number,
  failureCategory: FailureCategory
): boolean => {
  if (iterationCount >= maxBudget) {
    return false;
  }
  // Don't retry critical security issues
  if (failureCategory === "SECURITY") {
    return iterationCount < Math.floor(maxBudget / 2);
  }
  return true;
};
