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
    
    // Check if this looks like React code (has JSX or React patterns)
    const looksLikeReact = 
      code.includes('React') ||
      code.includes('useState') ||
      code.includes('useEffect') ||
      code.includes('className=') ||
      code.includes('onClick=') ||
      code.includes('onChange=') ||
      /<[A-Z]\w*/.test(code) || // JSX component tags
      /return\s*\(?\s*</.test(code) || // Return with JSX
      /=>\s*\(?\s*</.test(code); // Arrow function returning JSX
    
    // For React/JSX components - include javascript/typescript if they look like React
    const isReactLanguage = ["jsx", "tsx", "javascriptreact", "typescriptreact", "react"].includes(normalizedLang);
    const isJsTs = ["javascript", "typescript", "js", "ts"].includes(normalizedLang);
    
    if (isReactLanguage || (isJsTs && looksLikeReact)) {
      // Extract component name from various patterns
      const exportDefaultMatch = code.match(/export\s+default\s+(?:function\s+)?(\w+)/);
      const functionMatch = code.match(/(?:function|const|class)\s+(\w+)\s*(?:=|extends|\()/);
      const componentName = exportDefaultMatch?.[1] || functionMatch?.[1] || null;
      
      // Clean up TypeScript types and imports for browser execution
      const cleanedCode = code
        .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '') // Remove imports
        .replace(/import\s+['"].*?['"];?\s*/g, '') // Remove side-effect imports
        .replace(/export\s+default\s+/g, '') // Remove export default
        .replace(/export\s+/g, '') // Remove export
        .replace(/:\s*React\.FC\s*(<.*?>)?/g, '') // Remove React.FC type
        .replace(/:\s*React\.\w+(<.*?>)?/g, '') // Remove React types
        .replace(/:\s*\{[^}]+\}/g, '') // Remove inline object types
        .replace(/:\s*\([^)]+\)\s*=>/g, ' =>') // Remove function parameter types
        .replace(/:\s*\w+(\[\])?\s*(?=[,\)\=\{])/g, '') // Remove type annotations
        .replace(/<(\w+)(?:,\s*\w+)*>/g, '') // Remove generics
        .replace(/interface\s+\w+\s*\{[^}]*\}/gs, '') // Remove interfaces
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type declarations
        .replace(/as\s+\w+(\[\])?/g, ''); // Remove type assertions
      
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
  <link href="https://cdn.jsdelivr.net/npm/lucide-static@0.321.0/font/lucide.min.css" rel="stylesheet">
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
    const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, useReducer, useLayoutEffect, Fragment } = React;
    
    // Icon component stub
    const createIcon = (name) => ({ className = '', size = 24, ...props }) => 
      React.createElement('span', { 
        className: 'inline-flex items-center justify-center ' + className,
        style: { width: size, height: size },
        ...props 
      }, React.createElement('i', { className: 'lucide lucide-' + name.toLowerCase() }));
    
    // Common Lucide icons
    const icons = ['Search', 'Menu', 'X', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight', 
      'Plus', 'Minus', 'Check', 'Copy', 'Edit', 'Trash', 'Settings', 'User', 'Home', 'Mail', 
      'Phone', 'Calendar', 'Clock', 'Star', 'Heart', 'Share', 'Download', 'Upload', 'Send',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ExternalLink', 'Link', 'Image',
      'File', 'Folder', 'Code', 'Terminal', 'Eye', 'EyeOff', 'Lock', 'Unlock', 'Key',
      'Bell', 'MessageSquare', 'MessageCircle', 'Info', 'AlertCircle', 'AlertTriangle',
      'CheckCircle', 'XCircle', 'HelpCircle', 'Loader', 'RefreshCw', 'RotateCcw',
      'Zap', 'Sparkles', 'Wand2', 'Bot', 'Brain', 'Cpu', 'Globe', 'Map', 'Navigation'];
    icons.forEach(name => { window[name] = createIcon(name); });
    
    // Stub for common UI components
    const Button = ({ children, onClick, className = '', variant = 'default', size = 'default', disabled, type = 'button', ...props }) => {
      const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
      const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus:ring-gray-500',
        ghost: 'hover:bg-gray-100 focus:ring-gray-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        link: 'text-blue-600 underline-offset-4 hover:underline',
      };
      const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      };
      return React.createElement('button', {
        type,
        onClick,
        disabled,
        className: baseStyles + ' ' + (variants[variant] || variants.default) + ' ' + (sizes[size] || sizes.default) + ' ' + className,
        ...props
      }, children);
    };
    
    const Card = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'rounded-xl border border-gray-200 bg-white shadow-sm ' + className, ...props }, children);
    
    const CardHeader = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'flex flex-col space-y-1.5 p-6 ' + className, ...props }, children);
    
    const CardTitle = ({ children, className = '', ...props }) => 
      React.createElement('h3', { className: 'text-2xl font-semibold leading-none tracking-tight ' + className, ...props }, children);
    
    const CardDescription = ({ children, className = '', ...props }) => 
      React.createElement('p', { className: 'text-sm text-gray-500 ' + className, ...props }, children);
    
    const CardContent = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'p-6 pt-0 ' + className, ...props }, children);
    
    const CardFooter = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'flex items-center p-6 pt-0 ' + className, ...props }, children);
    
    const Input = ({ className = '', type = 'text', ...props }) => 
      React.createElement('input', { 
        type,
        className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' + className, 
        ...props 
      });
    
    const Textarea = ({ className = '', ...props }) => 
      React.createElement('textarea', { 
        className: 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' + className, 
        ...props 
      });
    
    const Label = ({ children, className = '', htmlFor, ...props }) => 
      React.createElement('label', { 
        htmlFor,
        className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ' + className, 
        ...props 
      }, children);
    
    const Badge = ({ children, className = '', variant = 'default', ...props }) => {
      const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 text-gray-700',
        destructive: 'bg-red-100 text-red-700',
      };
      return React.createElement('div', { 
        className: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ' + (variants[variant] || variants.default) + ' ' + className, 
        ...props 
      }, children);
    };
    
    const Avatar = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ' + className, ...props }, children);
    
    const AvatarImage = ({ src, alt = '', className = '', ...props }) => 
      React.createElement('img', { src, alt, className: 'aspect-square h-full w-full ' + className, ...props });
    
    const AvatarFallback = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'flex h-full w-full items-center justify-center rounded-full bg-gray-100 ' + className, ...props }, children);
    
    const Separator = ({ className = '', orientation = 'horizontal', ...props }) => 
      React.createElement('div', { 
        className: (orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]') + ' bg-gray-200 ' + className, 
        ...props 
      });
    
    const Switch = ({ checked, onCheckedChange, className = '', ...props }) => 
      React.createElement('button', {
        role: 'switch',
        'aria-checked': checked,
        onClick: () => onCheckedChange && onCheckedChange(!checked),
        className: 'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' + (checked ? 'bg-blue-600' : 'bg-gray-200') + ' ' + className,
        ...props
      }, React.createElement('span', {
        className: 'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ' + (checked ? 'translate-x-5' : 'translate-x-0')
      }));
    
    const Checkbox = ({ checked, onCheckedChange, className = '', ...props }) => 
      React.createElement('button', {
        role: 'checkbox',
        'aria-checked': checked,
        onClick: () => onCheckedChange && onCheckedChange(!checked),
        className: 'h-4 w-4 shrink-0 rounded border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ' + (checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white') + ' ' + className,
        ...props
      }, checked && React.createElement('span', { className: 'flex items-center justify-center text-current' }, '✓'));
    
    const Progress = ({ value = 0, className = '', ...props }) => 
      React.createElement('div', { 
        className: 'relative h-4 w-full overflow-hidden rounded-full bg-gray-100 ' + className, 
        ...props 
      }, React.createElement('div', {
        className: 'h-full bg-blue-600 transition-all',
        style: { width: value + '%' }
      }));
    
    const Skeleton = ({ className = '', ...props }) => 
      React.createElement('div', { 
        className: 'animate-pulse rounded-md bg-gray-200 ' + className, 
        ...props 
      });
    
    const ScrollArea = ({ children, className = '', ...props }) => 
      React.createElement('div', { className: 'relative overflow-auto ' + className, ...props }, children);
    
    const Tabs = ({ children, defaultValue, value, onValueChange, className = '', ...props }) => {
      const [activeTab, setActiveTab] = useState(value || defaultValue);
      return React.createElement('div', { className: className, ...props }, 
        React.Children.map(children, child => 
          child && React.cloneElement(child, { activeTab, setActiveTab: onValueChange || setActiveTab })
        )
      );
    };
    
    const TabsList = ({ children, className = '', activeTab, setActiveTab, ...props }) => 
      React.createElement('div', { 
        className: 'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ' + className, 
        ...props 
      }, React.Children.map(children, child => child && React.cloneElement(child, { activeTab, setActiveTab })));
    
    const TabsTrigger = ({ children, value, className = '', activeTab, setActiveTab, ...props }) => 
      React.createElement('button', { 
        onClick: () => setActiveTab(value),
        className: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ' + (activeTab === value ? 'bg-white text-gray-900 shadow-sm' : '') + ' ' + className, 
        ...props 
      }, children);
    
    const TabsContent = ({ children, value, className = '', activeTab, ...props }) => 
      activeTab === value ? React.createElement('div', { className: 'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ' + className, ...props }, children) : null;
    
    const cn = (...classes) => classes.filter(Boolean).join(' ');
    
    const motion = { div: 'div', span: 'span', button: 'button', a: 'a', ul: 'ul', li: 'li', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', section: 'section', article: 'article', nav: 'nav', header: 'header', footer: 'footer', main: 'main', img: 'img' };
    Object.keys(motion).forEach(key => {
      motion[key] = ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, className = '', ...props }) => 
        React.createElement(key, { className, ...props }, children);
    });

${cleanedCode}

    try {
      const rootElement = document.getElementById('root');
      const root = ReactDOM.createRoot(rootElement);
      
      // Try to find and render the component
      const componentNames = ['${componentName}', 'App', 'Component', 'Default', 'Main', 'Page', 'Home', 'Index', 'Root', 'Layout', 'Dashboard', 'Hero', 'Landing', 'Preview'];
      let ComponentToRender = null;
      
      for (const name of componentNames) {
        try {
          if (name && typeof eval(name) === 'function') {
            ComponentToRender = eval(name);
            break;
          }
        } catch (e) {
          // Component not found, try next
        }
      }
      
      if (ComponentToRender) {
        root.render(React.createElement(ComponentToRender));
      } else {
        // Try to find any function that looks like a React component
        const allGlobals = Object.keys(window);
        for (const key of allGlobals) {
          try {
            const val = window[key];
            if (typeof val === 'function' && /^[A-Z]/.test(key) && !icons.includes(key)) {
              ComponentToRender = val;
              break;
            }
          } catch (e) {}
        }
        
        if (ComponentToRender) {
          root.render(React.createElement(ComponentToRender));
        } else {
          root.render(React.createElement('div', { className: 'p-8 text-center text-gray-500' }, 
            React.createElement('p', { className: 'text-lg font-medium' }, 'No React component detected'),
            React.createElement('p', { className: 'text-sm mt-2' }, 'Make sure your code exports a valid React component')
          ));
        }
      }
    } catch (error) {
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: #ef4444; font-family: monospace; background: #fef2f2; border-radius: 8px; margin: 16px;"><strong>Preview Error:</strong><br/><pre style="margin-top: 8px; white-space: pre-wrap;">' + error.message + '</pre></div>';
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
