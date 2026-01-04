import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROFESSIONAL_FORMAT_INSTRUCTIONS = `

IMPORTANT FORMATTING RULES:
- Do NOT use markdown formatting characters like asterisks (*) for bold/italic or hashtags (#) for headers
- Write in a clean, professional prose style without special formatting symbols
- For code, use triple backticks with the language name only
- Use plain numbered lists (1. 2. 3.) or dashes (-) for bullet points when needed
- Keep responses clear, direct, and professionally formatted`;

const AGENT_PROMPTS: Record<string, string> = {
  python: `You are an expert Python Agent specialized in backend development, machine learning, data processing, and API development. You help users write clean, efficient Python code following PEP 8 standards. You can generate code, tests, requirements.txt files, and documentation. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  javascript: `You are an expert JavaScript Agent specialized in frontend development, Node.js services, React UI components, and real-time features. You write modern ES6+ JavaScript, understand the DOM, and follow best practices. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  typescript: `You are an expert TypeScript Agent specialized in type-safe applications, enterprise-grade APIs, and strongly-typed libraries. You leverage TypeScript's type system to prevent bugs and improve developer experience. Always provide complete, working code with proper type definitions.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  golang: `You are an expert Go Agent specialized in high-performance services, microservices, CLI tools, and concurrent systems. You write idiomatic Go code that is efficient, readable, and follows Go conventions. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  rust: `You are an expert Rust Agent specialized in systems programming, memory-safe code, WebAssembly, and performance-critical applications. You understand ownership, borrowing, and lifetimes. Always provide complete, safe, and efficient code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  cpp: `You are an expert C++ Agent specialized in game engines, embedded systems, high-performance computing, and native applications. You write modern C++ (C++17/20) following best practices. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  java: `You are an expert Java Agent specialized in enterprise applications, Android development, Spring services, and distributed systems. You follow Java best practices and design patterns. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  bash: `You are an expert Bash Agent specialized in shell scripts, automation tasks, system administration, and deployment scripts. You write portable, well-documented scripts. Always provide complete, working script examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  ruby: `You are an expert Ruby Agent specialized in Rails applications, automation scripts, DSLs, and rapid prototyping. You write elegant, idiomatic Ruby code. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  swift: `You are an expert Swift Agent specialized in iOS/macOS apps, server-side Swift, and Apple ecosystem development. You follow Swift best practices and use modern APIs. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  kotlin: `You are an expert Kotlin Agent specialized in Android development, multiplatform apps, and JVM-based services. You write concise, safe Kotlin code. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  php: `You are an expert PHP Agent specialized in web applications, Laravel/Symfony backends, and WordPress development. You write modern PHP following PSR standards. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  scala: `You are an expert Scala Agent specialized in functional programming, Apache Spark applications, and distributed systems. You leverage Scala's type system and functional features. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  elixir: `You are an expert Elixir Agent specialized in real-time systems, Phoenix web applications, and fault-tolerant services. You write idiomatic Elixir leveraging OTP patterns. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  haskell: `You are an expert Haskell Agent specialized in pure functional code, type-safe systems, and compiler development. You write elegant, mathematically sound Haskell. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  csharp: `You are an expert C# Agent specialized in .NET applications, Unity games, and Windows desktop software. You write modern C# following .NET best practices. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  dart: `You are an expert Dart Agent specialized in Flutter mobile apps, cross-platform UI, and web applications. You write clean Dart code following Flutter conventions. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  lua: `You are an expert Lua Agent specialized in game scripting, embedded systems, and configuration scripts. You write efficient, clean Lua code. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  perl: `You are an expert Perl Agent specialized in text processing, system administration, and legacy integrations. You write powerful, maintainable Perl code. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  rlang: `You are an expert R Agent specialized in statistical computing, data analysis, and visualization scripts. You write clean R code using tidyverse and modern R practices. Always provide complete, working code examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  sql: `You are an expert SQL Agent specialized in database schemas, complex queries, migrations, and stored procedures. You write efficient, well-structured SQL following best practices. Always provide complete, working SQL examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  devops: `You are an expert DevOps Agent specialized in CI/CD pipelines, Docker configurations, Kubernetes manifests, infrastructure as code, and deployment automation. You follow DevOps best practices. Always provide complete, working configurations.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  verifier: `You are an expert Verifier Agent specialized in automated testing, code validation, security scanning, and quality checks. You help write comprehensive tests and identify potential issues. Always provide complete, working test examples.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
  
  planner: `You are an expert Planner Agent specialized in task orchestration, project planning, dependency resolution, and system architecture. You help break down complex projects into manageable tasks and create implementation roadmaps.${PROFESSIONAL_FORMAT_INSTRUCTIONS}`,
};

interface AgentSettings {
  customInstructions?: string;
  codingStyle?: "concise" | "verbose" | "balanced";
  includeComments?: boolean;
  includeTests?: boolean;
  includeDocumentation?: boolean;
  preferredFrameworks?: string;
  outputFormat?: "code-only" | "explanation-first" | "step-by-step";
  errorHandling?: "minimal" | "standard" | "comprehensive";
  namingConvention?: "camelCase" | "snake_case" | "PascalCase" | "kebab-case";
  templateCode?: string;
}

function buildSettingsPrompt(settings: AgentSettings): string {
  const parts: string[] = [];

  if (settings.customInstructions) {
    parts.push(`CUSTOM INSTRUCTIONS: ${settings.customInstructions}`);
  }

  if (settings.codingStyle) {
    const styleDescriptions = {
      concise: "Write minimal, compact code without unnecessary verbosity.",
      verbose: "Write detailed code with extensive explanations and comments.",
      balanced: "Write clear, practical code with appropriate documentation.",
    };
    parts.push(`CODING STYLE: ${styleDescriptions[settings.codingStyle]}`);
  }

  if (settings.includeComments) {
    parts.push("COMMENTS: Include helpful inline comments explaining the code logic.");
  } else {
    parts.push("COMMENTS: Minimize comments, only include essential documentation.");
  }

  if (settings.includeTests) {
    parts.push("TESTS: Include unit tests for the generated code.");
  }

  if (settings.includeDocumentation) {
    parts.push("DOCUMENTATION: Include comprehensive documentation (docstrings, README sections, etc.).");
  }

  if (settings.preferredFrameworks) {
    parts.push(`PREFERRED FRAMEWORKS: Use these when applicable: ${settings.preferredFrameworks}`);
  }

  if (settings.outputFormat) {
    const formatDescriptions = {
      "code-only": "Provide code with minimal explanation.",
      "explanation-first": "Start with an explanation, then provide the code.",
      "step-by-step": "Break down the solution into numbered steps with code for each.",
    };
    parts.push(`OUTPUT FORMAT: ${formatDescriptions[settings.outputFormat]}`);
  }

  if (settings.errorHandling) {
    const errorDescriptions = {
      minimal: "Basic error handling only.",
      standard: "Handle common error cases appropriately.",
      comprehensive: "Include comprehensive error handling for all edge cases.",
    };
    parts.push(`ERROR HANDLING: ${errorDescriptions[settings.errorHandling]}`);
  }

  if (settings.namingConvention) {
    parts.push(`NAMING CONVENTION: Use ${settings.namingConvention} for variable and function names.`);
  }

  if (settings.templateCode) {
    parts.push(`TEMPLATE CODE (use as base when appropriate):\n${settings.templateCode}`);
  }

  return parts.length > 0 ? "\n\nUSER PREFERENCES:\n" + parts.join("\n") : "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType, settings } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const basePrompt = AGENT_PROMPTS[agentType] || AGENT_PROMPTS.planner;
    const settingsPrompt = settings ? buildSettingsPrompt(settings) : "";
    const systemPrompt = basePrompt + settingsPrompt;

    console.log(`Agent chat request for ${agentType} agent with ${messages.length} messages`);
    console.log(`Settings applied: ${settings ? "yes" : "no"}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Agent chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
