// Unified Task Schema v2 - Contract-First Multi-Agent Architecture
// Based on the advanced architecture with Memory Context and API Contract layers

export type TaskStatus = 
  | "PLANNING" 
  | "CONTRACT_NEGOTIATION" 
  | "IMPLEMENTING" 
  | "VERIFYING" 
  | "REPAIRING" 
  | "COMPLETED" 
  | "FAILED";

export type SubtaskStatus = 
  | "PENDING" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "FAILED" 
  | "BLOCKED";

export type ContractStatus = "DRAFT" | "NEGOTIATING" | "LOCKED" | "VIOLATED";

export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AgentRole = 
  | "Python Agent"
  | "JavaScript Agent"
  | "TypeScript Agent"
  | "DevOps Agent"
  | "SecOps Agent"
  | "Verifier Agent"
  | "Planner Agent"
  | "Memory Agent"
  | "Contract Negotiator"
  | "Integrator Agent"
  | "Orchestrator Agent"
  | "Schema Registry"
  | "Sandbox Agent"
  | "Auto-Linter Agent";

// Task Metadata
export interface TaskMeta {
  task_id: string;
  project_id: string;
  iteration: number;
  max_repair_budget: number;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  estimated_cost?: number;
  actual_cost?: number;
}

// Memory Context (RAG Layer)
export interface MemoryContext {
  description: string;
  architectural_style: "Microservices" | "Monolithic" | "Serverless" | "Event-Driven" | "Hybrid";
  coding_standards: string[];
  previous_decisions: string[];
  error_patterns?: ErrorPattern[];
  successful_patterns?: string[];
}

export interface ErrorPattern {
  pattern: string;
  resolution: string;
  occurrences: number;
}

// Shared Contract (Contract-First Layer)
export interface DataModel {
  name: string;
  fields: string[];
  description?: string;
}

export interface SharedContract {
  description: string;
  format: "OpenAPI 3.1" | "GraphQL" | "gRPC" | "JSON Schema";
  status: ContractStatus;
  spec_url: string;
  version: string;
  data_models: DataModel[];
  endpoints?: APIEndpoint[];
}

export interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  request_schema?: string;
  response_schema?: string;
}

// Security Constraints (SecOps Layer)
export interface SecurityConstraints {
  description: string;
  allowed_dependencies: string[];
  banned_patterns: string[];
  scanning_required: boolean;
  vulnerability_threshold?: SeverityLevel;
  compliance_requirements?: string[];
}

// Subtask Definition
export interface Subtask {
  id: string;
  agent_role: AgentRole;
  intent: string;
  status: SubtaskStatus;
  input_files: string[];
  expected_outputs: string[];
  actual_outputs?: string[];
  dependencies?: string[];
  iteration_count: number;
  logs: SubtaskLog[];
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface SubtaskLog {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  agent: string;
}

// Verification Criteria
export interface VerificationCriteria {
  description: string;
  contract_tests: string;
  coverage_threshold: number;
  linting_strictness: "low" | "medium" | "high";
  required_checks: string[];
  custom_validators?: string[];
}

// Verification Result
export interface VerificationResult {
  passed: boolean;
  severity: SeverityLevel;
  error_type?: "SYNTAX" | "LOGIC" | "CONTRACT_VIOLATION" | "SECURITY";
  message: string;
  suggested_fix?: string;
  target_agent?: AgentRole;
}

// Complete Unified Task Schema
export interface UnifiedTaskSchema {
  meta: TaskMeta;
  memory_context: MemoryContext;
  shared_contract: SharedContract;
  security_constraints: SecurityConstraints;
  subtasks: Subtask[];
  verification_criteria: VerificationCriteria;
  verification_results?: VerificationResult[];
}

// Helper functions for task schema management
export const createEmptyTaskSchema = (taskId: string, projectId: string): UnifiedTaskSchema => ({
  meta: {
    task_id: taskId,
    project_id: projectId,
    iteration: 1,
    max_repair_budget: 5,
    status: "PLANNING",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  memory_context: {
    description: "RAG-retrieved constraints and style guides.",
    architectural_style: "Microservices",
    coding_standards: [],
    previous_decisions: [],
    error_patterns: [],
    successful_patterns: [],
  },
  shared_contract: {
    description: "The negotiated interface between agents.",
    format: "OpenAPI 3.1",
    status: "DRAFT",
    spec_url: "",
    version: "1.0.0",
    data_models: [],
    endpoints: [],
  },
  security_constraints: {
    description: "Security directives for SecOps Agent.",
    allowed_dependencies: [],
    banned_patterns: ["eval()", "hardcoded_secrets"],
    scanning_required: true,
    vulnerability_threshold: "MEDIUM",
    compliance_requirements: [],
  },
  subtasks: [],
  verification_criteria: {
    description: "Instructions for the Verifier Agent.",
    contract_tests: "",
    coverage_threshold: 85,
    linting_strictness: "high",
    required_checks: ["lint", "test", "security-scan"],
  },
});

export const generateTaskId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `task_${timestamp}_${random}`;
};

export const generateSubtaskId = (taskId: string, agentRole: string): string => {
  const agentPrefix = agentRole.toLowerCase().split(" ")[0].substring(0, 2);
  const count = Math.random().toString(36).substring(2, 4);
  return `sub_${agentPrefix}_${count}`;
};

export const calculateTaskProgress = (task: UnifiedTaskSchema): number => {
  if (task.subtasks.length === 0) return 0;
  
  const completedWeight = task.subtasks.filter(s => s.status === "COMPLETED").length;
  const inProgressWeight = task.subtasks.filter(s => s.status === "IN_PROGRESS").length * 0.5;
  
  return Math.round(((completedWeight + inProgressWeight) / task.subtasks.length) * 100);
};

export const getNextStatus = (currentStatus: TaskStatus, success: boolean): TaskStatus => {
  const statusFlow: Record<TaskStatus, { success: TaskStatus; failure: TaskStatus }> = {
    PLANNING: { success: "CONTRACT_NEGOTIATION", failure: "PLANNING" },
    CONTRACT_NEGOTIATION: { success: "IMPLEMENTING", failure: "PLANNING" },
    IMPLEMENTING: { success: "VERIFYING", failure: "REPAIRING" },
    VERIFYING: { success: "COMPLETED", failure: "REPAIRING" },
    REPAIRING: { success: "VERIFYING", failure: "FAILED" },
    COMPLETED: { success: "COMPLETED", failure: "COMPLETED" },
    FAILED: { success: "PLANNING", failure: "FAILED" },
  };
  
  return statusFlow[currentStatus][success ? "success" : "failure"];
};

// Example task schema for demo purposes
export const exampleTaskSchema: UnifiedTaskSchema = {
  meta: {
    task_id: "task_1024_auth_service",
    project_id: "proj_fintech_alpha",
    iteration: 1,
    max_repair_budget: 5,
    status: "IMPLEMENTING",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T14:30:00Z",
    estimated_cost: 0.45,
    actual_cost: 0.12,
  },
  memory_context: {
    description: "RAG-retrieved constraints and style guides.",
    architectural_style: "Microservices",
    coding_standards: [
      "Use Snake Case for Python variables",
      "All endpoints must return standard JSON envelope",
      "React components must be functional with Hooks",
    ],
    previous_decisions: [
      "Auth provider is Auth0",
      "Database is PostgreSQL 14",
    ],
    error_patterns: [
      { pattern: "Missing JWT validation", resolution: "Add auth middleware", occurrences: 3 },
    ],
    successful_patterns: [
      "Use Pydantic for request/response validation",
    ],
  },
  shared_contract: {
    description: "The negotiated interface between agents (Contract-First approach).",
    format: "OpenAPI 3.1",
    status: "LOCKED",
    spec_url: "./contracts/auth_service_v1.yaml",
    version: "1.0.0",
    data_models: [
      { name: "User", fields: ["id: uuid", "email: string", "role: enum"] },
      { name: "LoginRequest", fields: ["email: string", "password: string"] },
      { name: "TokenResponse", fields: ["access_token: string", "refresh_token: string", "expires_in: number"] },
    ],
    endpoints: [
      { path: "/auth/login", method: "POST", description: "User login endpoint", request_schema: "LoginRequest", response_schema: "TokenResponse" },
      { path: "/auth/refresh", method: "POST", description: "Refresh access token" },
      { path: "/auth/logout", method: "POST", description: "User logout endpoint" },
    ],
  },
  security_constraints: {
    description: "Directives for the SecOps Agent.",
    allowed_dependencies: ["pydantic>=2.0", "fastapi>=0.95", "python-jose>=3.3"],
    banned_patterns: ["eval()", "hardcoded_secrets", "exec()", "pickle.loads()"],
    scanning_required: true,
    vulnerability_threshold: "MEDIUM",
    compliance_requirements: ["OWASP Top 10", "PCI-DSS"],
  },
  subtasks: [
    {
      id: "sub_py_01",
      agent_role: "Python Agent",
      intent: "Implement the User Login Endpoint defined in shared_contract.",
      status: "COMPLETED",
      input_files: ["./contracts/auth_service_v1.yaml"],
      expected_outputs: ["src/auth/router.py", "tests/unit/test_auth.py", "requirements.txt"],
      actual_outputs: ["src/auth/router.py", "tests/unit/test_auth.py", "requirements.txt"],
      iteration_count: 1,
      started_at: "2024-01-15T10:15:00Z",
      completed_at: "2024-01-15T11:00:00Z",
      logs: [
        { timestamp: "2024-01-15T10:15:00Z", level: "INFO", message: "Starting implementation", agent: "Python Agent" },
        { timestamp: "2024-01-15T10:45:00Z", level: "INFO", message: "Generated router.py with 3 endpoints", agent: "Python Agent" },
        { timestamp: "2024-01-15T11:00:00Z", level: "INFO", message: "All tests passing", agent: "Python Agent" },
      ],
    },
    {
      id: "sub_js_01",
      agent_role: "JavaScript Agent",
      intent: "Generate React Login Form consuming the User Login Endpoint.",
      status: "IN_PROGRESS",
      input_files: ["./contracts/auth_service_v1.yaml"],
      expected_outputs: ["src/components/LoginForm.tsx", "src/api/authClient.ts", "package.json"],
      dependencies: ["sub_py_01"],
      iteration_count: 1,
      started_at: "2024-01-15T11:05:00Z",
      logs: [
        { timestamp: "2024-01-15T11:05:00Z", level: "INFO", message: "Generating TypeScript client from OpenAPI spec", agent: "JavaScript Agent" },
        { timestamp: "2024-01-15T11:20:00Z", level: "INFO", message: "Creating LoginForm component", agent: "JavaScript Agent" },
      ],
    },
    {
      id: "sub_sec_01",
      agent_role: "SecOps Agent",
      intent: "Audit dependencies and scan for security vulnerabilities.",
      status: "PENDING",
      input_files: ["requirements.txt", "package.json"],
      expected_outputs: ["security_report.json"],
      dependencies: ["sub_py_01", "sub_js_01"],
      iteration_count: 0,
      logs: [],
    },
  ],
  verification_criteria: {
    description: "Instructions for the Verifier Agent.",
    contract_tests: "Run Dredd or Schemathesis against the OpenAPI spec.",
    coverage_threshold: 85,
    linting_strictness: "high",
    required_checks: ["lint", "test", "security-scan", "contract-validation"],
  },
};
