import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/sandbox-execute`;

Deno.test("sandbox-execute: should reject empty request body", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.status, "error");
  assertExists(data.errors);
});

Deno.test("sandbox-execute: should validate required fields", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      taskId: "test_task",
      // Missing other required fields
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.status, "error");
  assertExists(data.errors);
  await response.text(); // Consume body
});

Deno.test("sandbox-execute: should execute Python code successfully", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      taskId: "test_task_py",
      subtaskId: "sub_py_01",
      agentRole: "Python Agent",
      artifacts: [
        {
          filename: "main.py",
          content: "def hello():\n    return 'Hello World'\n",
          type: "source",
        },
        {
          filename: "test_main.py",
          content: "def test_hello():\n    assert hello() == 'Hello World'\n",
          type: "test",
        },
      ],
      testCommand: "pytest --tb=short -v",
      config: {
        runner: "python",
        resourceLimits: {
          memoryMb: 512,
          cpuCores: 0.5,
          timeoutSeconds: 30,
          maxOutputBytes: 1048576,
        },
      },
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data.taskId);
  assertExists(data.status);
  assertExists(data.logs);
  assertExists(data.testResults);
});

Deno.test("sandbox-execute: should detect security issues", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      taskId: "test_task_security",
      subtaskId: "sub_sec_01",
      agentRole: "Python Agent",
      artifacts: [
        {
          filename: "main.py",
          content: "import os\nresult = eval(input())\napi_key = 'sk-12345'\n",
          type: "source",
        },
      ],
      testCommand: "pytest",
      config: {
        runner: "python",
        resourceLimits: {
          memoryMb: 256,
          cpuCores: 0.25,
          timeoutSeconds: 10,
          maxOutputBytes: 524288,
        },
      },
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertEquals(data.status, "failure");
  assertExists(data.securityFindings);
  // Should find eval() and hardcoded secret
  const hasEvalFinding = data.securityFindings.some(
    (f: { type: string }) => f.type === "DANGEROUS_FUNCTION"
  );
  const hasSecretFinding = data.securityFindings.some(
    (f: { type: string }) => f.type === "HARDCODED_SECRET"
  );
  assertEquals(hasEvalFinding, true);
  assertEquals(hasSecretFinding, true);
});

Deno.test("sandbox-execute: should handle Node.js code", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      taskId: "test_task_node",
      subtaskId: "sub_js_01",
      agentRole: "JavaScript Agent",
      artifacts: [
        {
          filename: "index.js",
          content: "const add = (a, b) => a + b;\nmodule.exports = { add };\n",
          type: "source",
        },
        {
          filename: "package.json",
          content: '{"name": "test", "dependencies": {"lodash": "^4.0.0"}}',
          type: "requirements",
        },
      ],
      testCommand: "npm test",
      config: {
        runner: "node",
        resourceLimits: {
          memoryMb: 512,
          cpuCores: 0.5,
          timeoutSeconds: 30,
          maxOutputBytes: 1048576,
        },
      },
    }),
  });

  assertEquals(response.status, 200);
  const data = await response.json();
  assertExists(data.taskId);
  // Should detect unpinned dependency (^4.0.0)
  const hasUnpinnedWarning = data.securityFindings.some(
    (f: { type: string }) => f.type === "UNPINNED_DEPENDENCY"
  );
  assertEquals(hasUnpinnedWarning, true);
});

Deno.test("sandbox-execute: should handle CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
    },
  });

  assertEquals(response.status, 200);
  const corsHeader = response.headers.get("Access-Control-Allow-Origin");
  assertEquals(corsHeader, "*");
  await response.text(); // Consume body
});
