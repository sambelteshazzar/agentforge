import { useState, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2,
  Code2,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string, language: string) => void;
  className?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "yaml", label: "YAML" },
  { value: "shell", label: "Shell" },
];

const DEFAULT_CODE: Record<string, string> = {
  javascript: `// JavaScript Example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
  typescript: `// TypeScript Example
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

const user: User = { name: "Alice", age: 30 };
console.log(greet(user));`,
  python: `# Python Example
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
  css: `/* CSS Example */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}`,
  json: `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`,
  sql: `-- SQL Example
SELECT 
  users.name,
  COUNT(orders.id) as order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.id
HAVING order_count > 5
ORDER BY order_count DESC;`,
};

export const CodeEditor = ({
  initialCode = "",
  initialLanguage = "javascript",
  onCodeChange,
  onRun,
  className,
}: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE[initialLanguage] || "");
  const [language, setLanguage] = useState(initialLanguage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    setIsLoading(false);
    
    // Configure editor settings
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 0.8 },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      acceptSuggestionOnEnter: "on",
      snippetSuggestions: "inline",
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    // Add custom keybindings
    editor.addAction({
      id: "run-code",
      label: "Run Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => {
        if (onRun) {
          onRun(code, language);
        }
      },
    });

    // Configure TypeScript/JavaScript diagnostics
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add common lib definitions
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });
  }, [code, language, onRun]);

  const handleEditorChange: OnChange = useCallback((value) => {
    const newCode = value || "";
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!code.trim() || code === DEFAULT_CODE[language]) {
      setCode(DEFAULT_CODE[newLanguage] || "");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      html: "html",
      css: "css",
      json: "json",
      sql: "sql",
      markdown: "md",
      java: "java",
      csharp: "cs",
      cpp: "cpp",
      go: "go",
      rust: "rs",
      ruby: "rb",
      php: "php",
      swift: "swift",
      kotlin: "kt",
      yaml: "yml",
      shell: "sh",
    };

    const ext = extensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `Saved as code.${ext}`,
    });
  };

  const handleRun = () => {
    if (onRun) {
      onRun(code, language);
    } else {
      toast({
        title: "Running code...",
        description: "Code execution simulation - check console for output",
      });
      // Simple console simulation for JS
      if (language === "javascript" || language === "typescript") {
        try {
          // eslint-disable-next-line no-new-func
          const result = new Function(code.replace(/console\.log/g, "return "))();
          toast({
            title: "Output",
            description: String(result),
          });
        } catch (e) {
          console.log("Code to run:", code);
        }
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border border-border/50 bg-[#1e1e1e]",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <Code2 className="w-4 h-4 text-primary" />
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px] h-7 text-xs bg-[#3c3c3c] border-[#555] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleRun}
            title="Run (Ctrl+Enter)"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={cn("relative", isFullscreen ? "h-[calc(100%-44px)]" : "h-[400px]")}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading editor...</span>
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onMount={handleEditorMount}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            acceptSuggestionOnEnter: "on",
            snippetSuggestions: "inline",
          }}
          loading={null}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-xs">
        <div className="flex items-center gap-4">
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {code.split("\n").length}</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
