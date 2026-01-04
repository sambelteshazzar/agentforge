import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Eye, Code, Terminal, Copy, Check, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodePreviewProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

export const CodePreview = ({ code, language, onCopy, copied }: CodePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewType = getPreviewType(language);

  if (!previewType) {
    return (
      <BasicCodeBlock 
        code={code} 
        language={language} 
        onCopy={onCopy} 
        copied={copied} 
      />
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-border/50 overflow-hidden",
      isFullscreen && "fixed inset-4 z-50 bg-background"
    )}>
      <div className="flex items-center justify-between bg-secondary/80 px-3 py-1.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{language}</span>
          {previewType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
              Preview available
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <X className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className={cn("bg-white", isFullscreen ? "h-[calc(100%-40px)]" : "h-[300px]")}>
          <PreviewRenderer code={code} type={previewType} />
        </div>
      ) : (
        <pre className={cn(
          "bg-secondary/50 p-4 overflow-auto",
          isFullscreen ? "h-[calc(100%-40px)]" : "max-h-[400px]"
        )}>
          <code className="text-sm font-mono">{code}</code>
        </pre>
      )}
    </div>
  );
};

function getPreviewType(language: string): "html" | "react" | "terminal" | null {
  const htmlLangs = ["html", "htm"];
  const reactLangs = ["jsx", "tsx", "javascriptreact", "typescriptreact"];
  const terminalLangs = ["bash", "sh", "shell", "zsh", "python", "py", "node", "sql"];

  if (htmlLangs.includes(language.toLowerCase())) return "html";
  if (reactLangs.includes(language.toLowerCase())) return "react";
  if (terminalLangs.includes(language.toLowerCase())) return "terminal";
  return null;
}

interface PreviewRendererProps {
  code: string;
  type: "html" | "react" | "terminal";
}

const PreviewRenderer = ({ code, type }: PreviewRendererProps) => {
  if (type === "html") return <HTMLPreview code={code} />;
  if (type === "react") return <ReactPreview code={code} />;
  if (type === "terminal") return <TerminalPreview code={code} />;
  return null;
};

const HTMLPreview = ({ code }: { code: string }) => {
  const fullHtml = code.includes("<html") || code.includes("<!DOCTYPE") 
    ? code 
    : `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;padding:16px;}</style></head><body>${code}</body></html>`;

  return (
    <iframe
      srcDoc={fullHtml}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="HTML Preview"
    />
  );
};

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
        <div className="text-red-500 text-sm font-mono p-2 bg-red-50 rounded">
          {error}
        </div>
      ) : (
        <ReactLivePreview code={renderCode} onError={setError} />
      )}
    </div>
  );
};

const ReactLivePreview = ({ code, onError }: { code: string; onError: (e: string | null) => void }) => {
  // Lazy load react-live to avoid bundle size issues
  const [LiveProvider, setLiveProvider] = useState<any>(null);
  const [LivePreview, setLivePreview] = useState<any>(null);
  const [LiveError, setLiveError] = useState<any>(null);

  useState(() => {
    import("react-live").then((mod) => {
      setLiveProvider(() => mod.LiveProvider);
      setLivePreview(() => mod.LivePreview);
      setLiveError(() => mod.LiveError);
    }).catch(() => {
      onError("Failed to load preview engine");
    });
  });

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

const TerminalPreview = ({ code }: { code: string }) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const simulateExecution = () => {
    setIsRunning(true);
    setOutput([]);

    // Parse code and simulate output
    const lines = code.split("\n").filter(l => l.trim());
    let outputLines: string[] = [];

    lines.forEach((line, index) => {
      setTimeout(() => {
        // Simulate different command outputs
        if (line.startsWith("#") || line.startsWith("//")) {
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
    <div className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-400 text-xs flex-1 text-center">Terminal Simulation</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-green-400 hover:text-green-300"
          onClick={simulateExecution}
          disabled={isRunning}
        >
          <Play className="w-3 h-3 mr-1" />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {output.length === 0 ? (
          <div className="text-gray-500">Click Run to simulate execution</div>
        ) : (
          output.map((line, i) => (
            <div key={i} className="leading-relaxed">{line}</div>
          ))
        )}
        {isRunning && <span className="animate-pulse">▊</span>}
      </div>
    </div>
  );
};

const BasicCodeBlock = ({ code, language, onCopy, copied }: CodePreviewProps) => (
  <div className="relative group">
    <div className="flex items-center justify-between bg-secondary/80 px-3 py-1.5 rounded-t-lg border-b border-border/50">
      <span className="text-xs font-mono text-muted-foreground">{language}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onCopy}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </Button>
    </div>
    <pre className="bg-secondary/50 p-4 rounded-b-lg overflow-x-auto">
      <code className="text-sm font-mono">{code}</code>
    </pre>
  </div>
);
