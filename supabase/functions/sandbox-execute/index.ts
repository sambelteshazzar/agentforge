import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============= Input Validation =============

type RunnerType = 'python' | 'node' | 'typescript';
type ArtifactType = 'source' | 'test' | 'config' | 'requirements';

interface ValidationError {
  field: string;
  message: string;
}

function validateExecutionRequest(data: unknown): { 
  valid: boolean; 
  errors: ValidationError[]; 
  request?: ExecutionRequest 
} {
  const errors: ValidationError[] = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }

  const body = data as Record<string, unknown>;

  // Validate taskId
  if (!body.taskId || typeof body.taskId !== 'string') {
    errors.push({ field: 'taskId', message: 'taskId is required and must be a string' });
  } else if (body.taskId.length > 100) {
    errors.push({ field: 'taskId', message: 'taskId must be less than 100 characters' });
  }

  // Validate subtaskId
  if (!body.subtaskId || typeof body.subtaskId !== 'string') {
    errors.push({ field: 'subtaskId', message: 'subtaskId is required and must be a string' });
  } else if (body.subtaskId.length > 100) {
    errors.push({ field: 'subtaskId', message: 'subtaskId must be less than 100 characters' });
  }

  // Validate agentRole
  if (!body.agentRole || typeof body.agentRole !== 'string') {
    errors.push({ field: 'agentRole', message: 'agentRole is required and must be a string' });
  } else if (body.agentRole.length > 50) {
    errors.push({ field: 'agentRole', message: 'agentRole must be less than 50 characters' });
  }

  // Validate artifacts
  if (!body.artifacts || !Array.isArray(body.artifacts)) {
    errors.push({ field: 'artifacts', message: 'artifacts is required and must be an array' });
  } else if (body.artifacts.length > 50) {
    errors.push({ field: 'artifacts', message: 'Cannot process more than 50 artifacts' });
  } else {
    body.artifacts.forEach((artifact: unknown, index: number) => {
      if (!artifact || typeof artifact !== 'object') {
        errors.push({ field: `artifacts[${index}]`, message: 'Each artifact must be an object' });
        return;
      }
      const art = artifact as Record<string, unknown>;
      if (!art.filename || typeof art.filename !== 'string') {
        errors.push({ field: `artifacts[${index}].filename`, message: 'filename is required' });
      }
      if (!art.content || typeof art.content !== 'string') {
        errors.push({ field: `artifacts[${index}].content`, message: 'content is required' });
      } else if (art.content.length > 1000000) { // 1MB limit per file
        errors.push({ field: `artifacts[${index}].content`, message: 'content exceeds 1MB limit' });
      }
      const validTypes: ArtifactType[] = ['source', 'test', 'config', 'requirements'];
      if (!art.type || !validTypes.includes(art.type as ArtifactType)) {
        errors.push({ field: `artifacts[${index}].type`, message: `type must be one of: ${validTypes.join(', ')}` });
      }
    });
  }

  // Validate testCommand
  if (!body.testCommand || typeof body.testCommand !== 'string') {
    errors.push({ field: 'testCommand', message: 'testCommand is required and must be a string' });
  } else if (body.testCommand.length > 500) {
    errors.push({ field: 'testCommand', message: 'testCommand must be less than 500 characters' });
  }

  // Validate config
  if (!body.config || typeof body.config !== 'object') {
    errors.push({ field: 'config', message: 'config is required and must be an object' });
  } else {
    const config = body.config as Record<string, unknown>;
    const validRunners: RunnerType[] = ['python', 'node', 'typescript'];
    if (!config.runner || !validRunners.includes(config.runner as RunnerType)) {
      errors.push({ field: 'config.runner', message: `runner must be one of: ${validRunners.join(', ')}` });
    }
    
    if (config.resourceLimits && typeof config.resourceLimits === 'object') {
      const limits = config.resourceLimits as Record<string, unknown>;
      if (typeof limits.memoryMb === 'number' && (limits.memoryMb < 64 || limits.memoryMb > 4096)) {
        errors.push({ field: 'config.resourceLimits.memoryMb', message: 'memoryMb must be between 64 and 4096' });
      }
      if (typeof limits.cpuCores === 'number' && (limits.cpuCores < 0.1 || limits.cpuCores > 4)) {
        errors.push({ field: 'config.resourceLimits.cpuCores', message: 'cpuCores must be between 0.1 and 4' });
      }
      if (typeof limits.timeoutSeconds === 'number' && (limits.timeoutSeconds < 5 || limits.timeoutSeconds > 300)) {
        errors.push({ field: 'config.resourceLimits.timeoutSeconds', message: 'timeoutSeconds must be between 5 and 300' });
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { 
    valid: true, 
    errors: [], 
    request: body as unknown as ExecutionRequest 
  };
}

// ============= Types =============

interface CodeArtifact {
  filename: string;
  content: string;
  type: ArtifactType;
}

interface ResourceLimits {
  memoryMb: number;
  cpuCores: number;
  timeoutSeconds: number;
  maxOutputBytes: number;
}

interface SandboxConfig {
  runner: RunnerType;
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

interface ExecutionLog {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  content: string;
}

// ============= Sandbox Execution (Simulated) =============
// NOTE: This is a simulation. In production, this would call Docker API or Kubernetes Jobs.

async function executeInSandbox(request: ExecutionRequest): Promise<{
  status: 'success' | 'failure' | 'timeout' | 'error';
  exitCode: number;
  logs: ExecutionLog[];
  testResults: TestResult[];
  securityFindings: SecurityFinding[];
  lintViolations: LintViolation[];
  durationMs: number;
  resourceUsage: { peakMemoryMb: number; cpuTimeMs: number };
}> {
  const startTime = Date.now();
  const logs: ExecutionLog[] = [];
  const testResults: TestResult[] = [];
  const securityFindings: SecurityFinding[] = [];
  const lintViolations: LintViolation[] = [];

  const log = (stream: 'stdout' | 'stderr', content: string) => {
    logs.push({ timestamp: new Date().toISOString(), stream, content });
  };

  // Log sandbox initialization
  log('stdout', `[sandbox] Initializing ${request.config.runner} runner...`);
  log('stdout', `[sandbox] Resource limits: ${request.config.resourceLimits.memoryMb}MB RAM, ${request.config.resourceLimits.cpuCores} CPU, ${request.config.resourceLimits.timeoutSeconds}s timeout`);

  // Phase 1: Dependency vetting
  log('stdout', '[vetting] Scanning dependencies for vulnerabilities...');
  
  const requirementsFile = request.artifacts.find(a => 
    a.filename === 'requirements.txt' || a.filename === 'package.json'
  );

  if (requirementsFile) {
    log('stdout', `[vetting] Found ${requirementsFile.filename}, checking versions...`);
    
    // Detect unpinned versions
    if (requirementsFile.content.includes('>=') || requirementsFile.content.includes('^') || requirementsFile.content.includes('*')) {
      securityFindings.push({
        severity: 'low',
        type: 'UNPINNED_DEPENDENCY',
        file: requirementsFile.filename,
        message: 'Found unpinned dependency versions. Consider pinning for reproducibility.'
      });
    }
  }

  // Phase 2: Static analysis
  log('stdout', '[lint] Running static analysis...');
  
  const sourceFiles = request.artifacts.filter(a => a.type === 'source');
  for (const file of sourceFiles) {
    // Check for banned patterns (deterministic, not random)
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

    // Check for hardcoded secrets
    const secretPatterns = [/api_key\s*=\s*['"][^'"]+['"]/, /password\s*=\s*['"][^'"]+['"]/i, /secret\s*=\s*['"][^'"]+['"]/i];
    for (const pattern of secretPatterns) {
      if (pattern.test(file.content)) {
        securityFindings.push({
          severity: 'critical',
          type: 'HARDCODED_SECRET',
          file: file.filename,
          message: 'Potential hardcoded secret detected'
        });
        break;
      }
    }

    // Line length checks
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

  // Phase 3: Security scanning
  log('stdout', `[security] Running ${request.config.runner === 'python' ? 'bandit' : 'snyk'} scan...`);

  // Phase 4: Test execution
  log('stdout', `[test] Executing: ${request.testCommand}`);
  
  const testFiles = request.artifacts.filter(a => a.type === 'test');
  
  if (testFiles.length === 0) {
    log('stderr', '[test] Warning: No test files provided');
  } else {
    for (const testFile of testFiles) {
      // Parse test functions (deterministic based on content)
      const testMatches = testFile.content.match(/(?:def test_|it\(['"]|test\(['"]).+/g) || [];
      
      for (const testMatch of testMatches) {
        const testName = testMatch
          .replace(/def test_/, '')
          .replace(/it\(['"]/, '')
          .replace(/test\(['"]/, '')
          .replace(/['"].*/, '')
          .replace(/\(.*/, '')
          .trim();
        
        // Deterministic pass/fail based on test name content (not random)
        // Tests with "fail" or "error" in name will fail, others pass
        const shouldFail = testName.toLowerCase().includes('fail') || testName.toLowerCase().includes('error');
        
        testResults.push({
          name: testName,
          status: shouldFail ? 'failed' : 'passed',
          duration: 50 + (testName.length * 5), // Deterministic duration based on name length
          errorMessage: shouldFail ? 'Assertion failed: expected values do not match' : undefined
        });

        log('stdout', `[test] ${shouldFail ? '✗' : '✓'} ${testName} (${testResults[testResults.length - 1].duration}ms)`);
      }
    }

    // If no test functions found but test files exist
    if (testResults.length === 0 && testFiles.length > 0) {
      testResults.push({
        name: 'placeholder_test',
        status: 'passed',
        duration: 10
      });
      log('stdout', '[test] ✓ placeholder_test (10ms)');
    }
  }

  const endTime = Date.now();
  const durationMs = endTime - startTime;

  // Determine overall status (deterministic based on findings)
  const hasFailedTests = testResults.some(t => t.status === 'failed' || t.status === 'error');
  const hasCriticalSecurity = securityFindings.some(f => f.severity === 'critical' || f.severity === 'high');
  const hasLintErrors = lintViolations.some(v => v.severity === 'error');

  let status: 'success' | 'failure' | 'timeout' | 'error' = 'success';
  let exitCode = 0;

  if (hasCriticalSecurity || hasFailedTests || hasLintErrors) {
    status = 'failure';
    exitCode = 1;
  }

  log('stdout', `[sandbox] Execution complete in ${durationMs}ms - ${status.toUpperCase()}`);

  return {
    status,
    exitCode,
    logs,
    testResults,
    securityFindings,
    lintViolations,
    durationMs,
    resourceUsage: {
      peakMemoryMb: Math.min(request.config.resourceLimits.memoryMb * 0.4, 200),
      cpuTimeMs: Math.floor(durationMs * 0.7)
    }
  };
}

// ============= Request Handler =============

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid JSON in request body',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate request
    const validation = validateExecutionRequest(body);
    if (!validation.valid) {
      console.error('[sandbox-execute] Validation failed:', validation.errors);
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Validation failed',
        errors: validation.errors,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const request = validation.request!;
    
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
    console.error('[sandbox-execute] Unexpected error:', errorMessage);
    
    return new Response(JSON.stringify({
      status: 'error',
      exitCode: -1,
      message: 'Internal server error',
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
