import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisualPrototype } from "./VisualPrototype";
import { EditorExport } from "./EditorExport";
import { DesignTokenSync } from "./DesignTokenSync";
import { 
  Eye, Code2, Copy, Check, Maximize2, X, 
  Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Prism from "prismjs";

interface PrototypePreviewProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

const SUPPORTED_LANGUAGES = new Set([
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'bash', 'sql', 'json',
  'css', 'go', 'rust', 'java', 'c', 'cpp', 'csharp', 'ruby', 'swift', 'kotlin',
  'scala', 'lua', 'yaml', 'markdown', 'html', 'markup'
]);

const getPrismLanguage = (language: string): string => {
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
    htm: "html",
    html: "markup",
  };
  const normalized = language.toLowerCase();
  const mapped = langMap[normalized] || normalized;
  return SUPPORTED_LANGUAGES.has(mapped) ? mapped : "javascript";
};

const canShowVisualPreview = (language: string): boolean => {
  const visualLangs = ["html", "htm", "jsx", "tsx", "css", "javascriptreact", "typescriptreact"];
  return visualLangs.includes(language.toLowerCase());
};

export const PrototypePreview = ({ code, language, onCopy, copied }: PrototypePreviewProps) => {
  const [activeView, setActiveView] = useState<"prototype" | "code">(
    canShowVisualPreview(language) ? "prototype" : "code"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTokenSync, setShowTokenSync] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const prismLanguage = getPrismLanguage(language);
  const hasVisualPreview = canShowVisualPreview(language);

  useEffect(() => {
    if (codeRef.current && activeView === "code") {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLanguage, activeView]);

  return (
    <div className={cn(
      "rounded-xl overflow-hidden border border-border bg-card",
      isFullscreen && "fixed inset-4 z-50 shadow-2xl"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono">{language}</span>
          </div>
          {hasVisualPreview && (
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
              <TabsList className="h-8">
                <TabsTrigger value="prototype" className="text-xs px-3 gap-1.5">
                  <Eye className="w-3 h-3" />
                  Prototype
                </TabsTrigger>
                <TabsTrigger value="code" className="text-xs px-3 gap-1.5">
                  <Code2 className="w-3 h-3" />
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showTokenSync ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setShowTokenSync(!showTokenSync)}
            title="Design Token Sync"
          >
            <Zap className="w-3.5 h-3.5" />
            Tokens
            {showTokenSync ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          
          <EditorExport code={code} language={language} />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCopy}
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeView === "prototype" && hasVisualPreview ? (
        <VisualPrototype code={code} language={language} />
      ) : (
        <div className={cn(
          "overflow-auto bg-[#1a1b26]",
          isFullscreen ? "h-[calc(100%-60px)]" : "max-h-[500px]"
        )}>
          <pre className="p-4 text-sm leading-relaxed m-0">
            <div className="flex">
              <div className="select-none pr-4 text-right text-[#565f89] font-mono text-xs border-r border-[#414868] mr-4 flex-shrink-0">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>
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

      {/* Design Token Sync Panel */}
      {showTokenSync && (
        <DesignTokenSync code={code} />
      )}
    </div>
  );
};
