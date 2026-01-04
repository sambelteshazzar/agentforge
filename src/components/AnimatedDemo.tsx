import { useState, useEffect } from "react";
import { Bot, User, Sparkles, CheckCircle2, Code2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoStep {
  type: "user" | "agent" | "code" | "status";
  content: string;
  delay: number;
}

const demoSteps: DemoStep[] = [
  { type: "user", content: "Create a React component for a pricing card with monthly/yearly toggle", delay: 0 },
  { type: "status", content: "Analyzing request...", delay: 1500 },
  { type: "status", content: "Routing to TypeScript Agent", delay: 2500 },
  { type: "agent", content: "I'll create a reusable PricingCard component with a toggle for billing periods. Here's the implementation:", delay: 3500 },
  { type: "code", content: `interface PricingCardProps {
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

export const PricingCard = ({ 
  title, 
  monthlyPrice, 
  yearlyPrice, 
  features 
}: PricingCardProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const price = isYearly ? yearlyPrice : monthlyPrice;
  
  return (
    <div className="rounded-xl border p-6">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="my-4">
        <span className="text-4xl font-bold">\${price}</span>
        <span className="text-muted">/{isYearly ? 'year' : 'month'}</span>
      </div>
      <button onClick={() => setIsYearly(!isYearly)}>
        {isYearly ? 'Switch to Monthly' : 'Switch to Yearly'}
      </button>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
    </div>
  );
};`, delay: 5000 },
  { type: "status", content: "Running verification checks...", delay: 8000 },
  { type: "status", content: "All tests passed ✓", delay: 9000 },
  { type: "agent", content: "Component created successfully! It includes TypeScript types, state management for the billing toggle, and renders the feature list. Ready to use.", delay: 9500 },
];

export const AnimatedDemo = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState<Record<number, string>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("animated-demo");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [hasStarted]);

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
          setDisplayedText((prev) => ({
            ...prev,
            [index]: step.content,
          }));
        }

        if (index === demoSteps.length - 1) {
          setTimeout(() => setIsComplete(true), 1500);
        }
      }, step.delay);
    });
  }, [hasStarted]);

  const restartDemo = () => {
    setVisibleSteps([]);
    setDisplayedText({});
    setIsComplete(false);
    setHasStarted(false);
    setTimeout(() => setHasStarted(true), 100);
  };

  return (
    <div id="animated-demo" className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/80 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">AgentForge Demo</span>
        </div>
        {isComplete && (
          <button
            onClick={restartDemo}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Replay Demo
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
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
                    <span className="text-xs font-medium text-primary">TypeScript Agent</span>
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
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono text-gray-400">PricingCard.tsx</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs">
                    <code className="text-gray-300 font-mono whitespace-pre">{text}</code>
                  </pre>
                </div>
              </div>
            );
          }

          return null;
        })}

        {visibleSteps.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary animate-pulse" />
              <p className="text-sm">Scroll to start the demo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
