import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, Code2, Smartphone, Tablet, Monitor, RotateCcw, 
  ZoomIn, ZoomOut, Move, Layers, MousePointer, Grid3X3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface VisualPrototypeProps {
  code: string;
  language: string;
  className?: string;
}

type ViewportSize = "mobile" | "tablet" | "desktop" | "responsive";

const VIEWPORT_SIZES: Record<ViewportSize, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 667, label: "iPhone SE" },
  tablet: { width: 768, height: 1024, label: "iPad" },
  desktop: { width: 1280, height: 800, label: "Desktop" },
  responsive: { width: 100, height: 100, label: "Responsive" },
};

export const VisualPrototype = ({ code, language, className }: VisualPrototypeProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "inspect">("preview");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"pointer" | "pan">("pointer");

  const generatePreviewHtml = (code: string, lang: string): string => {
    const normalizedLang = lang.toLowerCase();
    
    // For React/JSX components
    if (["jsx", "tsx", "javascriptreact", "typescriptreact"].includes(normalizedLang)) {
      // Extract component name from various patterns
      const componentMatch = code.match(/(?:export\s+default\s+)?(?:function|const|class)\s+(\w+)/);
      const componentName = componentMatch ? componentMatch[1] : null;
      
      // Clean up TypeScript types and imports for browser execution
      const cleanedCode = code
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove imports
        .replace(/export\s+default\s+/g, '') // Remove export default
        .replace(/export\s+/g, '') // Remove export
        .replace(/:\s*React\.FC\s*(<.*?>)?/g, '') // Remove React.FC type
        .replace(/:\s*\w+(\[\])?\s*(?=[,\)\=\{])/g, '') // Remove type annotations
        .replace(/<(\w+)(?:,\s*\w+)*>/g, '') // Remove generics
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // Remove interfaces
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Remove type declarations
      
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    ${showGrid ? `
    body { 
      background-image: 
        linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(147, 51, 234, 0.1) 1px, transparent 1px);
      background-size: 8px 8px;
    }` : ''}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
    // Polyfill common React hooks and utilities
    const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;
    
    // Stub for common UI components that might be imported
    const Button = ({ children, onClick, className = '', variant = 'default', size = 'default', ...props }) => {
      const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none';
      const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      };
      const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      };
      return React.createElement('button', {
        onClick,
        className: baseStyles + ' ' + (variants[variant] || variants.default) + ' ' + (sizes[size] || sizes.default) + ' ' + className,
        ...props
      }, children);
    };
    
    const Card = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'rounded-lg border bg-white shadow-sm ' + className, ...props }, children);
    
    const Input = ({ className = '', ...props }) => 
      React.createElement('input', { className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ' + className, ...props });

    const cn = (...classes) => classes.filter(Boolean).join(' ');

${cleanedCode}

    try {
      const rootElement = document.getElementById('root');
      const root = ReactDOM.createRoot(rootElement);
      
      // Try to find and render the component
      const componentNames = ['${componentName}', 'App', 'Component', 'Default', 'Main', 'Page', 'Home', 'Index'];
      let ComponentToRender = null;
      
      for (const name of componentNames) {
        if (name && typeof eval(name) === 'function') {
          ComponentToRender = eval(name);
          break;
        }
      }
      
      if (ComponentToRender) {
        root.render(React.createElement(ComponentToRender));
      } else {
        // If no component found, try to render the code as JSX directly
        root.render(React.createElement('div', { className: 'p-4' }, 'Preview rendered - component detected'));
      }
    } catch (error) {
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: #ef4444; font-family: monospace;"><strong>Preview Error:</strong><br/>' + error.message + '</div>';
      console.error('Preview error:', error);
    }
  </script>
</body>
</html>`;
    }
    
    // For HTML
    if (["html", "htm"].includes(normalizedLang)) {
      if (code.includes("<html") || code.includes("<!DOCTYPE")) {
        return code;
      }
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; }
    ${showGrid ? `
    body { 
      background-image: 
        linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(147, 51, 234, 0.1) 1px, transparent 1px);
      background-size: 8px 8px;
    }` : ''}
  </style>
</head>
<body>
${code}
</body>
</html>`;
    }

    // For CSS - show with sample HTML
    if (normalizedLang === "css") {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview</title>
  <style>
    ${code}
    ${showGrid ? `
    body { 
      background-image: 
        linear-gradient(to right, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(147, 51, 234, 0.1) 1px, transparent 1px);
      background-size: 8px 8px;
    }` : ''}
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <p>Your styles have been applied to this document.</p>
    <button>Sample Button</button>
    <div class="box">Sample Box</div>
  </div>
</body>
</html>`;
    }

    // Default: show code in pre tag
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Monaco', 'Menlo', monospace; padding: 16px; background: #1a1b26; color: #a9b1d6; }
    pre { white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
  };

  const currentViewport = VIEWPORT_SIZES[viewport];
  const isResponsive = viewport === "responsive";

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border bg-card", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="text-xs px-3">
              <Eye className="w-3 h-3 mr-1.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs px-3">
              <Code2 className="w-3 h-3 mr-1.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="inspect" className="text-xs px-3">
              <Layers className="w-3 h-3 mr-1.5" />
              Inspect
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Viewport controls */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewport("mobile")}
              title="Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewport === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewport("tablet")}
              title="Tablet"
            >
              <Tablet className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewport("desktop")}
              title="Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Interaction mode */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <Button
              variant={interactionMode === "pointer" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setInteractionMode("pointer")}
              title="Pointer mode"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={interactionMode === "pan" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setInteractionMode("pan")}
              title="Pan mode"
            >
              <Move className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Grid toggle */}
          <Button
            variant={showGrid ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle grid"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </Button>

          {/* Layers toggle */}
          <Button
            variant={showLayers ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowLayers(!showLayers)}
            title="Toggle layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <div className="w-20">
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={25}
                max={200}
                step={25}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground w-10">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom(100)}
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Viewport label */}
      <div className="flex items-center justify-center gap-2 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground">
        <span className="font-medium">{currentViewport.label}</span>
        {!isResponsive && (
          <span>({currentViewport.width} × {currentViewport.height})</span>
        )}
      </div>

      {/* Preview area */}
      <div 
        className="bg-muted/20 flex items-center justify-center overflow-auto"
        style={{ minHeight: 400, maxHeight: 600 }}
      >
        {activeTab === "preview" && (
          <div
            className={cn(
              "bg-white shadow-2xl transition-all duration-300",
              !isResponsive && "rounded-lg overflow-hidden"
            )}
            style={{
              width: isResponsive ? "100%" : currentViewport.width * (zoom / 100),
              height: isResponsive ? "100%" : currentViewport.height * (zoom / 100),
              transform: `scale(${isResponsive ? 1 : 1})`,
              transformOrigin: "center",
            }}
          >
            <iframe
              srcDoc={generatePreviewHtml(code, language)}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="Visual Prototype Preview"
              style={{
                width: isResponsive ? "100%" : currentViewport.width,
                height: isResponsive ? "100%" : currentViewport.height,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        )}

        {activeTab === "code" && (
          <div className="w-full h-full p-4 overflow-auto">
            <pre className="text-xs font-mono bg-[#1a1b26] text-[#a9b1d6] p-4 rounded-lg overflow-auto">
              <code>{code}</code>
            </pre>
          </div>
        )}

        {activeTab === "inspect" && (
          <div className="w-full h-full p-4">
            <div className="bg-background rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold">Element Inspector</h3>
              <p className="text-xs text-muted-foreground">
                Click on elements in the preview to inspect their properties.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{language}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lines:</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{code.split('\n').length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{code.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layers panel */}
      {showLayers && (
        <div className="border-t border-border p-3 bg-muted/30">
          <h4 className="text-xs font-semibold mb-2">Layer Hierarchy</h4>
          <div className="text-xs text-muted-foreground font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-primary">▼</span>
              <span>Document</span>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <span className="text-primary">▼</span>
              <span>Body</span>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <span className="text-muted-foreground">▸</span>
              <span>Component</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
