import { useState, useEffect, useRef } from "react";
import { Bot, User, CheckCircle2, Code2, Loader2, Eye, Copy, Check, Maximize2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from "react-live";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EnhancedLivePreview } from "@/components/EnhancedLivePreview";
import { prepareCodeForLive, isBackendLanguage, isWebPreviewable, getLanguageInfo } from "@/lib/preview";
import { livePreviewScope, BackendCodePanel, NonPreviewablePanel } from "@/components/preview";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface PrototypePreviewProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
  roomId?: string;
}

// Live Preview Component for React/TSX code using react-live
const LivePreview = ({ code, language }: { code: string; language: string }) => {
  const lang = language.toLowerCase();
  
  // For backend languages, show a helpful "run locally" message
  if (isBackendLanguage(lang)) {
    return <BackendCodePanel language={lang} />;
  }

  // For non-web languages, show generic message
  if (!isWebPreviewable(lang)) {
    return <NonPreviewablePanel />;
  }

  const preparedCode = prepareCodeForLive(code);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-background">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
      </div>
      <LiveProvider code={preparedCode} scope={livePreviewScope} noInline={false}>
        <div className="p-4 min-h-[100px] bg-background">
          <ReactLivePreview />
        </div>
        <LiveError 
          className="p-3 text-xs font-mono text-destructive bg-destructive/10 border-t border-destructive/20" 
        />
      </LiveProvider>
    </div>
  );
};

const AnimatedCodeBlock = ({ 
  code, 
  isComplete,
  language 
}: { 
  code: string; 
  isComplete: boolean;
  language: string;
}) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const lines = code.split("\n");

  useEffect(() => {
    if (!isComplete) {
      setVisibleLines(0);
      return;
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      currentLine++;
      setVisibleLines(currentLine);
      if (currentLine >= lines.length) {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isComplete, lines.length]);

  useEffect(() => {
    if (codeRef.current && visibleLines > 0) {
      Prism.highlightElement(codeRef.current);
    }
  }, [visibleLines]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedCode = lines.slice(0, visibleLines).join("\n");
  
  // Show preview panel for web languages OR backend languages (with run instructions)
  const lang = language.toLowerCase();
  const canShowVisualPreview = isWebPreviewable(lang) || isBackendLanguage(lang);
  // Only show enhanced preview button for web-previewable languages
  const canShowEnhancedPreview = isWebPreviewable(lang);

  return (
    <div className="space-y-4">
      <div className="bg-secondary rounded-lg overflow-hidden border border-border">
        {/* Code Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">component.{language}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {visibleLines >= lines.length && canShowVisualPreview && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  "p-1 rounded transition-colors",
                  showPreview ? "bg-primary/20 text-primary" : "hover:bg-accent text-muted-foreground"
                )}
                title="Toggle preview"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {visibleLines >= lines.length && canShowEnhancedPreview && (
              <button
                onClick={() => setShowEnhancedPreview(true)}
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                title="Open enhanced preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="relative overflow-x-auto bg-secondary/50">
          <pre className="p-4 text-sm leading-relaxed">
            <div className="flex">
              {/* Line Numbers */}
              <div className="select-none pr-4 text-right text-muted-foreground/50 font-mono text-xs border-r border-border mr-4">
                {lines.slice(0, visibleLines).map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <code 
                ref={codeRef}
                className={`language-${language} font-mono text-xs`}
              >
                {displayedCode}
              </code>
            </div>
            {visibleLines < lines.length && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            )}
          </pre>
        </div>
      </div>

      {/* Live Preview Panel */}
      {showPreview && canShowVisualPreview && (
        <div className="animate-fade-in">
          <LivePreview code={code} language={language} />
        </div>
      )}

      {/* Enhanced Preview Dialog - only for web-previewable languages */}
      {canShowEnhancedPreview && (
        <Dialog open={showEnhancedPreview} onOpenChange={setShowEnhancedPreview}>
          <DialogContent className="max-w-[90vw] w-[1400px] h-[85vh] p-0 gap-0">
            <EnhancedLivePreview 
              code={code} 
              language={language} 
              onClose={() => setShowEnhancedPreview(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export const PrototypePreview = ({ code, language, onCopy, copied }: PrototypePreviewProps) => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState<Record<number, string>>({});
  const [codeStepComplete, setCodeStepComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const demoSteps = [
    { type: "user", content: `Generate a ${language} component`, delay: 0 },
    { type: "status", content: "Analyzing request...", delay: 800 },
    { type: "status", content: `Routing to ${language.toUpperCase()} Agent`, delay: 1500 },
    { type: "agent", content: "I'll create this component for you. Here is the implementation:", delay: 2500 },
    { type: "code", content: code, delay: 3500 },
    { type: "status", content: "Running verification checks...", delay: 3500 + (code.split('\n').length * 80) + 1000 },
    { type: "status", content: "All tests passed ✓", delay: 3500 + (code.split('\n').length * 80) + 2000 },
    { type: "agent", content: "Component created successfully! Ready to use in your project.", delay: 3500 + (code.split('\n').length * 80) + 2500 },
  ];

  useEffect(() => {
    // Start animation immediately
    if (!hasStarted) {
      setHasStarted(true);
    }
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    demoSteps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, index]);
        
        if (step.type === "user" || step.type === "agent") {
          setIsTyping(true);
          setCurrentTypingIndex(index);
          
          let charIndex = 0;
          const content = step.content;
          const typeInterval = setInterval(() => {
            if (charIndex <= content.length) {
              setDisplayedText((prev) => ({
                ...prev,
                [index]: content.slice(0, charIndex),
              }));
              charIndex++;
            } else {
              clearInterval(typeInterval);
              setIsTyping(false);
              setCurrentTypingIndex(-1);
            }
          }, 20);
        } else if (step.type === "code") {
          setCodeStepComplete(true);
        }

        if (index === demoSteps.length - 1) {
          setTimeout(() => setIsComplete(true), 1500);
        }
      }, step.delay);
    });
  }, [hasStarted, code, language]);

  const restartDemo = () => {
    setVisibleSteps([]);
    setDisplayedText({});
    setCodeStepComplete(false);
    setIsComplete(false);
    setHasStarted(false);
    setTimeout(() => setHasStarted(true), 100);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">Code Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && (
            <button
              onClick={restartDemo}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Replay
            </button>
          )}
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-background/50 rounded transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-6 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {visibleSteps.map((stepIndex) => {
          const step = demoSteps[stepIndex];
          const text = displayedText[stepIndex] || "";
          const isCurrentlyTyping = currentTypingIndex === stepIndex;

          if (step.type === "user") {
            return (
              <div key={stepIndex} className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-primary/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                  <p className="text-sm">
                    {text}
                    {isCurrentlyTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              </div>
            );
          }

          if (step.type === "status") {
            return (
              <div key={stepIndex} className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in pl-11">
                {step.content.includes("✓") ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
                <span>{step.content}</span>
              </div>
            );
          }

          if (step.type === "agent") {
            return (
              <div key={stepIndex} className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary/80 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary">{language.toUpperCase()} Agent</span>
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-sm">
                    {text}
                    {isCurrentlyTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              </div>
            );
          }

          if (step.type === "code") {
            return (
              <div key={stepIndex} className="animate-fade-in pl-11">
                <AnimatedCodeBlock code={step.content} isComplete={codeStepComplete} language={language} />
              </div>
            );
          }

          return null;
        })}

        {visibleSteps.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary animate-pulse" />
              <p className="text-sm">Initializing preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
