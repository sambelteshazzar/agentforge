import * as React from "react";
import { useState, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { Code2, Copy, Check, X, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from "react-live";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PreviewControls, DevicePreset, ViewMode, devicePresets } from "@/components/PreviewControls";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface EnhancedLivePreviewProps {
  code: string;
  language: string;
  onClose?: () => void;
}

// Scope with common React patterns and UI components for live preview
const liveScope = {
  React,
  ...LucideIcons,
  useState,
  useEffect,
  useRef,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Badge,
  Separator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  cn,
};

// Clean and prepare code for react-live
const prepareCodeForLive = (code: string): string => {
  let cleanCode = code.trim();
  
  // Remove import statements
  cleanCode = cleanCode.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  cleanCode = cleanCode.replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '');
  
  // Remove export statements but keep the rest
  cleanCode = cleanCode.replace(/^export\s+default\s+/gm, '');
  cleanCode = cleanCode.replace(/^export\s+(?=const|function|class)/gm, '');
  
  // Remove TypeScript type annotations carefully
  cleanCode = cleanCode.replace(/:\s*React\.FC(<[^>]*>)?/g, '');
  cleanCode = cleanCode.replace(/:\s*React\.ReactNode/g, '');
  cleanCode = cleanCode.replace(/:\s*JSX\.Element/g, '');
  cleanCode = cleanCode.replace(/(\([^)]*?):\s*\w+(\s*[,)])/g, '$1$2');
  cleanCode = cleanCode.replace(/\)\s*:\s*[\w<>[\]|&\s]+(?=\s*[{=])/g, ')');
  
  // Remove interface/type declarations
  cleanCode = cleanCode.replace(/^interface\s+\w+\s*\{[\s\S]*?\}\s*$/gm, '');
  cleanCode = cleanCode.replace(/^type\s+\w+\s*=[\s\S]*?;\s*$/gm, '');
  
  cleanCode = cleanCode.trim();
  
  // If already JSX, return directly
  if (cleanCode.startsWith('<')) {
    return cleanCode;
  }
  
  // Check for function component pattern
  const functionComponentMatch = cleanCode.match(
    /^(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)?\s*=>\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}\s*;?\s*$/
  ) || cleanCode.match(
    /^function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}\s*$/
  );
  
  if (functionComponentMatch && functionComponentMatch[2]) {
    const jsxContent = functionComponentMatch[2].trim();
    if (jsxContent.startsWith('<')) {
      return jsxContent;
    }
  }
  
  // Try to find return statement with JSX
  const returnMatch = cleanCode.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}?\s*;?\s*$/);
  if (returnMatch && returnMatch[1]) {
    const jsxContent = returnMatch[1].trim();
    if (jsxContent.startsWith('<')) {
      return jsxContent;
    }
  }
  
  // Handle arrow function returning JSX directly
  const arrowJsxMatch = cleanCode.match(/=>\s*(<[\s\S]+>)\s*;?\s*$/);
  if (arrowJsxMatch && arrowJsxMatch[1]) {
    return arrowJsxMatch[1].trim();
  }
  
  // If wrapped in parentheses, extract content
  const parenMatch = cleanCode.match(/^\(\s*([\s\S]*?)\s*\)$/);
  if (parenMatch && parenMatch[1]?.trim().startsWith('<')) {
    return parenMatch[1].trim();
  }
  
  // For plain JS without JSX, display it nicely
  if (!cleanCode.includes('<') && !cleanCode.includes('return')) {
    const escapedCode = cleanCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    return `<div className="p-4 font-mono text-sm bg-muted rounded-lg">
      <div className="text-muted-foreground text-xs mb-2">JavaScript Output:</div>
      <pre className="text-foreground whitespace-pre-wrap">${escapedCode}</pre>
    </div>`;
  }
  
  // Look for any JSX element
  const jsxMatch = cleanCode.match(/(<[A-Z][a-zA-Z]*[\s\S]*?>[\s\S]*?<\/[A-Z][a-zA-Z]*>|<[a-z][a-zA-Z]*[\s\S]*?\/>|<[a-z][a-zA-Z]*[\s\S]*?>[\s\S]*?<\/[a-z][a-zA-Z]*>)/);
  if (jsxMatch) {
    return jsxMatch[1];
  }

  // Fallback display
  const escapedFallback = cleanCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  return `<div className="p-4 font-mono text-sm text-foreground"><pre>${escapedFallback}</pre></div>`;
};

// Code panel component
const CodePanel = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">component.{language}</span>
        </div>
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
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm leading-relaxed">
          <div className="flex">
            <div className="select-none pr-4 text-right text-muted-foreground/50 font-mono text-xs border-r border-border mr-4">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-relaxed">{i + 1}</div>
              ))}
            </div>
            <code ref={codeRef} className={`language-${language} font-mono text-xs`}>
              {code}
            </code>
          </div>
        </pre>
      </div>
    </div>
  );
};

// Preview panel component
const PreviewPanel = ({ 
  code, 
  language, 
  devicePreset 
}: { 
  code: string; 
  language: string; 
  devicePreset: DevicePreset;
}) => {
  const lang = language.toLowerCase();
  const isReactCode = ["jsx", "tsx", "js", "javascript", "ts", "typescript", "react"].includes(lang);
  const device = devicePresets[devicePreset];
  const isResponsive = devicePreset === "responsive";

  if (!isReactCode) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/20">
        <div className="text-center text-muted-foreground">
          <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Preview available for React/JSX code only</p>
        </div>
      </div>
    );
  }

  const preparedCode = prepareCodeForLive(code);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">
          Live Preview {!isResponsive && `(${device.width}×${device.height})`}
        </span>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:20px_20px]">
        <div
          className={cn(
            "bg-background border border-border rounded-lg shadow-lg overflow-auto transition-all duration-300",
            isResponsive ? "w-full h-full" : ""
          )}
          style={
            !isResponsive
              ? {
                  width: device.width,
                  maxWidth: "100%",
                  minHeight: Math.min(device.height, 500),
                }
              : undefined
          }
        >
          <LiveProvider code={preparedCode} scope={liveScope} noInline={false}>
            <div className="p-4">
              <ReactLivePreview />
            </div>
            <LiveError className="p-3 text-xs font-mono text-destructive bg-destructive/10 border-t border-destructive/20" />
          </LiveProvider>
        </div>
      </div>
    </div>
  );
};

export const EnhancedLivePreview = ({ code, language, onClose }: EnhancedLivePreviewProps) => {
  const [devicePreset, setDevicePreset] = useState<DevicePreset>("responsive");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-background border border-border rounded-xl overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[600px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">Enhanced Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <PreviewControls
            devicePreset={devicePreset}
            viewMode={viewMode}
            isFullscreen={isFullscreen}
            onDeviceChange={setDevicePreset}
            onViewModeChange={setViewMode}
            onFullscreenToggle={toggleFullscreen}
          />
          {onClose && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "code" && (
          <CodePanel code={code} language={language} />
        )}
        
        {viewMode === "preview" && (
          <PreviewPanel code={code} language={language} devicePreset={devicePreset} />
        )}
        
        {viewMode === "split" && (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <CodePanel code={code} language={language} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <PreviewPanel code={code} language={language} devicePreset={devicePreset} />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};
