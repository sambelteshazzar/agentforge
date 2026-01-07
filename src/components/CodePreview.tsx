import { useState, useEffect, useRef, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Eye, Code2, Copy, Check, Maximize2, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Prism from "prismjs";
// Core languages without complex dependencies
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-lua";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";

// Languages with complex deps that need fallback
const SUPPORTED_LANGUAGES = new Set([
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'bash', 'sql', 'json',
  'css', 'go', 'rust', 'java', 'c', 'cpp', 'csharp', 'ruby', 'swift', 'kotlin',
  'scala', 'lua', 'yaml', 'markdown', 'html', 'markup'
]);

interface CodePreviewProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

const getPrismLanguage = (language: string): string => {
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    md: "markdown",
    jsx: "jsx",
    tsx: "tsx",
    htm: "markup",
    html: "markup",
    go: "go",
    golang: "go",
    rs: "rust",
    rb: "ruby",
    cs: "csharp",
    kt: "kotlin",
    php: "javascript", // fallback to JS highlighting
    perl: "bash", // fallback
    r: "python", // fallback for similar syntax
    dart: "typescript", // fallback
    elixir: "ruby", // fallback
    haskell: "javascript", // fallback
    hs: "javascript",
  };
  const normalized = language.toLowerCase();
  const mapped = langMap[normalized] || normalized;
  // Return the mapped language if supported, otherwise fallback to javascript
  return SUPPORTED_LANGUAGES.has(mapped) ? mapped : "javascript";
};

const getPreviewType = (language: string): "html" | "react" | "terminal" | null => {
  const lang = language.toLowerCase();
  const htmlLangs = ["html", "htm"];
  const reactLangs = ["jsx", "tsx", "javascriptreact", "typescriptreact"];
  const terminalLangs = ["bash", "sh", "shell", "zsh", "python", "py", "node", "sql"];

  if (htmlLangs.includes(lang)) return "html";
  if (reactLangs.includes(lang)) return "react";
  if (terminalLangs.includes(lang)) return "terminal";
  return null;
};

const generateRunnableCode = (code: string, language: string): string => {
  const lang = language.toLowerCase();
  
  if (["html", "htm"].includes(lang)) {
    if (code.includes("<html") || code.includes("<!DOCTYPE")) {
      return code;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
  }
  
  if (["jsx", "tsx", "javascriptreact", "typescriptreact"].includes(lang)) {
    return `<!-- Save this as index.html and open in browser -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; margin: 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
${code}

// Auto-render the component
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
const ComponentToRender = typeof App !== 'undefined' ? App : 
  typeof Component !== 'undefined' ? Component : null;
if (ComponentToRender) {
  root.render(<ComponentToRender />);
}
  </script>
</body>
</html>`;
  }
  
  if (["python", "py"].includes(lang)) {
    return `# Python Script
# Run with: python script.py

${code}`;
  }
  
  if (["javascript", "js"].includes(lang)) {
    return `// JavaScript
// Run with: node script.js
// Or paste in browser console

${code}`;
  }
  
  if (["typescript", "ts"].includes(lang)) {
    return `// TypeScript
// Run with: npx ts-node script.ts
// Or compile first: tsc script.ts && node script.js

${code}`;
  }
  
  if (["bash", "sh", "shell", "zsh"].includes(lang)) {
    return `#!/bin/bash
# Run with: bash script.sh

${code}`;
  }
  
  if (["sql"].includes(lang)) {
    return `-- SQL Script
-- Run in your database client or terminal

${code}`;
  }
  
  if (["css"].includes(lang)) {
    return `/* CSS Styles */
/* Include in HTML: <link rel="stylesheet" href="styles.css"> */

${code}`;
  }

  if (["go", "golang"].includes(lang)) {
    return `// Go
// Run with: go run main.go

${code}`;
  }

  if (["rust", "rs"].includes(lang)) {
    return `// Rust
// Run with: cargo run
// Or compile: rustc main.rs && ./main

${code}`;
  }

  if (["java"].includes(lang)) {
    return `// Java
// Compile: javac Main.java
// Run: java Main

${code}`;
  }

  if (["c"].includes(lang)) {
    return `// C
// Compile: gcc main.c -o main
// Run: ./main

${code}`;
  }

  if (["cpp", "c++"].includes(lang)) {
    return `// C++
// Compile: g++ main.cpp -o main
// Run: ./main

${code}`;
  }

  if (["ruby", "rb"].includes(lang)) {
    return `# Ruby
# Run with: ruby script.rb

${code}`;
  }
  
  return code;
};

export const CodePreview = ({ code, language, onCopy, copied }: CodePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runnableCopied, setRunnableCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  const previewType = getPreviewType(language);
  const prismLanguage = getPrismLanguage(language);
  const lines = code.split("\n");

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLanguage]);

  const copyRunnable = async () => {
    const runnableCode = generateRunnableCode(code, language);
    await navigator.clipboard.writeText(runnableCode);
    setRunnableCopied(true);
    setTimeout(() => setRunnableCopied(false), 2000);
    toast({
      title: "Runnable code copied",
      description: "Paste into a file and run in your environment",
    });
  };

  return (
    <div className={cn(
      "rounded-lg overflow-hidden bg-[#1a1b26]",
      isFullscreen && "fixed inset-4 z-50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#24283b] border-b border-[#414868]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">{language}</span>
          {previewType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              Preview available
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {previewType && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                showPreview && "bg-primary/20 text-primary"
              )}
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Show code" : "Show preview"}
            >
              {showPreview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <X className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onCopy}
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={copyRunnable}
            title="Copy as runnable file"
          >
            {runnableCopied ? <Check className="w-3 h-3 text-success" /> : <Download className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {showPreview && previewType ? (
        <div className={cn("bg-white", isFullscreen ? "h-[calc(100%-40px)]" : "h-[300px]")}>
          <PreviewRenderer code={code} type={previewType} />
        </div>
      ) : (
        <div className={cn(
          "overflow-auto",
          isFullscreen ? "h-[calc(100%-40px)]" : "max-h-[400px]"
        )}>
          <pre className="p-4 text-sm leading-relaxed m-0">
            <div className="flex">
              {/* Line Numbers */}
              <div className="select-none pr-4 text-right text-[#565f89] font-mono text-xs border-r border-[#414868] mr-4 flex-shrink-0">
                {lines.map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <code 
                ref={codeRef}
                className={`language-${prismLanguage} font-mono text-xs`}
              >
                {code}
              </code>
            </div>
          </pre>
        </div>
      )}
    </div>
  );
};

interface PreviewRendererProps {
  code: string;
  type: "html" | "react" | "terminal";
}

const PreviewRenderer = forwardRef<HTMLDivElement, PreviewRendererProps>(({ code, type }, ref) => {
  return (
    <div ref={ref} className="w-full h-full">
      {type === "html" && <HTMLPreview code={code} />}
      {type === "react" && <ReactPreview code={code} />}
      {type === "terminal" && <TerminalPreview code={code} />}
    </div>
  );
});
PreviewRenderer.displayName = "PreviewRenderer";

const HTMLPreview = forwardRef<HTMLIFrameElement, { code: string }>(({ code }, ref) => {
  const fullHtml = code.includes("<html") || code.includes("<!DOCTYPE") 
    ? code 
    : `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;padding:16px;}</style></head><body>${code}</body></html>`;

  return (
    <iframe
      ref={ref}
      srcDoc={fullHtml}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="HTML Preview"
    />
  );
});
HTMLPreview.displayName = "HTMLPreview";

const ReactPreview = ({ code }: { code: string }) => {
  const [error, setError] = useState<string | null>(null);

  // Clean code for react-live
  const cleanCode = code
    .replace(/^import.*$/gm, "")
    .replace(/^export default.*$/gm, "")
    .replace(/^export.*$/gm, "")
    .trim();

  // Wrap if not already a render call
  const renderCode = cleanCode.includes("render(") 
    ? cleanCode 
    : `render(${cleanCode.match(/^const\s+(\w+)/)?.[1] || cleanCode.match(/^function\s+(\w+)/)?.[1] || `<>${cleanCode}</>`})`;

  return (
    <div className="w-full h-full p-4 overflow-auto">
      {error ? (
        <div className="text-destructive text-sm font-mono p-2 bg-destructive/10 rounded">
          {error}
        </div>
      ) : (
        <ReactLivePreview code={renderCode} onError={setError} />
      )}
    </div>
  );
};

const ReactLivePreview = ({ code, onError }: { code: string; onError: (e: string | null) => void }) => {
  const [LiveProvider, setLiveProvider] = useState<any>(null);
  const [LivePreview, setLivePreview] = useState<any>(null);
  const [LiveError, setLiveError] = useState<any>(null);

  useEffect(() => {
    import("react-live").then((mod) => {
      setLiveProvider(() => mod.LiveProvider);
      setLivePreview(() => mod.LivePreview);
      setLiveError(() => mod.LiveError);
    }).catch(() => {
      onError("Failed to load preview engine");
    });
  }, [onError]);

  if (!LiveProvider) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Loading preview...
      </div>
    );
  }

  return (
    <LiveProvider code={code} noInline>
      <LivePreview />
      <LiveError />
    </LiveProvider>
  );
};

const TerminalPreview = forwardRef<HTMLDivElement, { code: string }>(({ code }, ref) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const simulateExecution = () => {
    setIsRunning(true);
    setOutput([]);

    const lines = code.split("\n").filter(l => l.trim());
    let outputLines: string[] = [];

    lines.forEach((line, index) => {
      setTimeout(() => {
        if (line.startsWith("#") || line.startsWith("//") || line.startsWith("--")) {
          // Comments - skip
        } else if (line.includes("print(") || line.includes("console.log(")) {
          const match = line.match(/(?:print|console\.log)\s*\(\s*["'`](.*)["'`]\s*\)/);
          if (match) outputLines.push(match[1]);
        } else if (line.includes("echo ")) {
          outputLines.push(line.replace(/^echo\s+["']?/, "").replace(/["']?$/, ""));
        } else if (line.startsWith("SELECT") || line.startsWith("select")) {
          outputLines.push("┌─────────────────────────────┐");
          outputLines.push("│  (query result placeholder) │");
          outputLines.push("└─────────────────────────────┘");
        } else if (line.includes("pip install") || line.includes("npm install")) {
          outputLines.push(`Installing packages...`);
          outputLines.push(`✓ Successfully installed`);
        } else if (line.trim()) {
          outputLines.push(`$ ${line}`);
        }

        setOutput([...outputLines]);

        if (index === lines.length - 1) {
          setTimeout(() => setIsRunning(false), 500);
        }
      }, index * 300);
    });
  };

  return (
    <div ref={ref} className="w-full h-full bg-[#1a1b26] text-[#7aa2f7] font-mono text-sm flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#24283b] border-b border-[#414868]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <div className="w-3 h-3 rounded-full bg-warning" />
          <div className="w-3 h-3 rounded-full bg-success" />
        </div>
        <span className="text-muted-foreground text-xs flex-1 text-center">Terminal Simulation</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-[#7aa2f7] hover:text-[#7aa2f7]/80"
          onClick={simulateExecution}
          disabled={isRunning}
        >
          <Play className="w-3 h-3 mr-1" />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {output.length === 0 ? (
          <div className="text-muted-foreground">Click Run to simulate execution</div>
        ) : (
          output.map((line, i) => (
            <div key={i} className="leading-relaxed">{line}</div>
          ))
        )}
        {isRunning && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
});
TerminalPreview.displayName = "TerminalPreview";
