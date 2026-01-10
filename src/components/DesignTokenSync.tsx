import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Palette, Type, Ruler, RefreshCw, Download, Copy, Check,
  Layers, Zap, Settings2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DesignTokenSyncProps {
  code: string;
  onTokensExtracted?: (tokens: ExtractedTokens) => void;
}

interface ColorToken {
  name: string;
  value: string;
  usage: string[];
}

interface TypographyToken {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
}

interface SpacingToken {
  name: string;
  value: string;
}

interface ExtractedTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  shadows: { name: string; value: string }[];
  radii: { name: string; value: string }[];
}

const TAILWIND_COLORS: Record<string, string> = {
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0', 'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8', 'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155',
  'slate-800': '#1e293b', 'slate-900': '#0f172a', 'slate-950': '#020617',
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb', 'gray-300': '#d1d5db',
  'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563', 'gray-700': '#374151',
  'gray-800': '#1f2937', 'gray-900': '#111827', 'gray-950': '#030712',
  'red-500': '#ef4444', 'red-600': '#dc2626', 'orange-500': '#f97316', 'amber-500': '#f59e0b',
  'yellow-500': '#eab308', 'lime-500': '#84cc16', 'green-500': '#22c55e', 'green-600': '#16a34a',
  'emerald-500': '#10b981', 'teal-500': '#14b8a6', 'cyan-500': '#06b6d4', 'sky-500': '#0ea5e9',
  'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'indigo-500': '#6366f1', 'violet-500': '#8b5cf6',
  'purple-500': '#a855f7', 'fuchsia-500': '#d946ef', 'pink-500': '#ec4899', 'rose-500': '#f43f5e',
  'white': '#ffffff', 'black': '#000000', 'transparent': 'transparent',
};

export const DesignTokenSync = ({ code, onTokensExtracted }: DesignTokenSyncProps) => {
  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing" | "export">("colors");
  const [copied, setCopied] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const extractedTokens = useMemo((): ExtractedTokens => {
    const colors: ColorToken[] = [];
    const typography: TypographyToken[] = [];
    const spacing: SpacingToken[] = [];
    const shadows: { name: string; value: string }[] = [];
    const radii: { name: string; value: string }[] = [];

    // Extract Tailwind color classes
    const colorRegex = /(?:bg|text|border|ring|fill|stroke)-(\w+(?:-\d+)?)/g;
    const colorMatches = code.matchAll(colorRegex);
    const colorUsageMap = new Map<string, string[]>();

    for (const match of colorMatches) {
      const colorName = match[1];
      const fullClass = match[0];
      if (TAILWIND_COLORS[colorName]) {
        if (!colorUsageMap.has(colorName)) {
          colorUsageMap.set(colorName, []);
        }
        colorUsageMap.get(colorName)?.push(fullClass);
      }
    }

    colorUsageMap.forEach((usage, name) => {
      colors.push({
        name,
        value: TAILWIND_COLORS[name] || '#000000',
        usage: [...new Set(usage)],
      });
    });

    // Extract hex colors
    const hexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
    const hexMatches = code.matchAll(hexRegex);
    const seenHex = new Set<string>();
    
    for (const match of hexMatches) {
      const hex = match[0].toLowerCase();
      if (!seenHex.has(hex)) {
        seenHex.add(hex);
        colors.push({
          name: `custom-${hex.slice(1)}`,
          value: hex,
          usage: ['inline'],
        });
      }
    }

    // Extract RGB/HSL colors
    const rgbHslRegex = /(rgb|hsl)a?\([^)]+\)/g;
    const rgbHslMatches = code.matchAll(rgbHslRegex);
    
    for (const match of rgbHslMatches) {
      colors.push({
        name: `custom-${match[1]}`,
        value: match[0],
        usage: ['inline'],
      });
    }

    // Extract typography classes
    const fontSizeRegex = /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g;
    const fontWeightRegex = /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g;
    const fontFamilyRegex = /font-(sans|serif|mono)/g;

    const fontSizes = new Set<string>();
    const fontWeights = new Set<string>();
    const fontFamilies = new Set<string>();

    for (const match of code.matchAll(fontSizeRegex)) fontSizes.add(match[1]);
    for (const match of code.matchAll(fontWeightRegex)) fontWeights.add(match[1]);
    for (const match of code.matchAll(fontFamilyRegex)) fontFamilies.add(match[1]);

    if (fontSizes.size > 0 || fontWeights.size > 0 || fontFamilies.size > 0) {
      typography.push({
        name: 'body',
        fontFamily: fontFamilies.has('sans') ? 'Inter, system-ui, sans-serif' : undefined,
        fontSize: fontSizes.has('base') ? '1rem' : [...fontSizes][0] ? `text-${[...fontSizes][0]}` : undefined,
        fontWeight: [...fontWeights][0] || 'normal',
      });
    }

    // Extract spacing classes
    const spacingRegex = /(?:p|m|gap|space-[xy])-(\d+(?:\.\d+)?|\[[\w.]+\])/g;
    const spacingMatches = code.matchAll(spacingRegex);
    const seenSpacing = new Set<string>();

    for (const match of spacingMatches) {
      const value = match[1];
      if (!seenSpacing.has(value)) {
        seenSpacing.add(value);
        spacing.push({
          name: `spacing-${value}`,
          value: value.startsWith('[') ? value.slice(1, -1) : `${parseInt(value) * 0.25}rem`,
        });
      }
    }

    // Extract shadows
    const shadowRegex = /shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?/g;
    const shadowMatches = code.matchAll(shadowRegex);
    const seenShadows = new Set<string>();

    for (const match of shadowMatches) {
      const shadowName = match[0];
      if (!seenShadows.has(shadowName)) {
        seenShadows.add(shadowName);
        shadows.push({
          name: shadowName,
          value: shadowName,
        });
      }
    }

    // Extract border radii
    const radiusRegex = /rounded(-sm|-md|-lg|-xl|-2xl|-3xl|-full|-none)?/g;
    const radiusMatches = code.matchAll(radiusRegex);
    const seenRadii = new Set<string>();

    for (const match of radiusMatches) {
      const radiusName = match[0];
      if (!seenRadii.has(radiusName)) {
        seenRadii.add(radiusName);
        radii.push({
          name: radiusName,
          value: radiusName,
        });
      }
    }

    return { colors, typography, spacing, shadows, radii };
  }, [code]);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onTokensExtracted?.(extractedTokens);
    setSyncing(false);
    toast.success("Design tokens synced successfully!");
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const generateCSSVariables = () => {
    let css = ':root {\n';
    extractedTokens.colors.forEach((color, i) => {
      css += `  --color-${color.name}: ${color.value};\n`;
    });
    extractedTokens.spacing.forEach((space) => {
      css += `  --${space.name}: ${space.value};\n`;
    });
    css += '}\n';
    return css;
  };

  const generateTailwindConfig = () => {
    const config = {
      theme: {
        extend: {
          colors: {} as Record<string, string>,
          spacing: {} as Record<string, string>,
        },
      },
    };

    extractedTokens.colors.forEach((color) => {
      config.theme.extend.colors[color.name] = color.value;
    });

    extractedTokens.spacing.forEach((space) => {
      config.theme.extend.spacing[space.name.replace('spacing-', '')] = space.value;
    });

    return `module.exports = ${JSON.stringify(config, null, 2)}`;
  };

  const generateFigmaTokens = () => {
    const tokens = {
      colors: {} as Record<string, { value: string; type: string }>,
      spacing: {} as Record<string, { value: string; type: string }>,
    };

    extractedTokens.colors.forEach((color) => {
      tokens.colors[color.name] = { value: color.value, type: 'color' };
    });

    extractedTokens.spacing.forEach((space) => {
      tokens.spacing[space.name] = { value: space.value, type: 'spacing' };
    });

    return JSON.stringify(tokens, null, 2);
  };

  const generateStyleDictionary = () => {
    const tokens = {
      color: {} as Record<string, { value: string }>,
      size: {} as Record<string, { value: string }>,
    };

    extractedTokens.colors.forEach((color) => {
      tokens.color[color.name] = { value: color.value };
    });

    extractedTokens.spacing.forEach((space) => {
      tokens.size[space.name] = { value: space.value };
    });

    return JSON.stringify(tokens, null, 2);
  };

  return (
    <div className="border-t border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Design Token Sync</span>
          <Badge variant="secondary" className="text-xs">
            {extractedTokens.colors.length + extractedTokens.spacing.length} tokens
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className={cn("w-3 h-3", syncing && "animate-spin")} />
          {syncing ? "Syncing..." : "Sync Tokens"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-9 p-0">
          <TabsTrigger 
            value="colors" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs h-9"
          >
            <Palette className="w-3 h-3 mr-1.5" />
            Colors ({extractedTokens.colors.length})
          </TabsTrigger>
          <TabsTrigger 
            value="typography"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs h-9"
          >
            <Type className="w-3 h-3 mr-1.5" />
            Typography ({extractedTokens.typography.length})
          </TabsTrigger>
          <TabsTrigger 
            value="spacing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs h-9"
          >
            <Ruler className="w-3 h-3 mr-1.5" />
            Spacing ({extractedTokens.spacing.length})
          </TabsTrigger>
          <TabsTrigger 
            value="export"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs h-9"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-48">
          <TabsContent value="colors" className="m-0 p-3">
            {extractedTokens.colors.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No colors detected in code</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {extractedTokens.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(color.value, `color-${i}`)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div 
                      className="w-8 h-8 rounded-md border border-border shadow-sm flex-shrink-0"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium truncate">{color.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{color.value}</p>
                    </div>
                    {copied === `color-${i}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="typography" className="m-0 p-3">
            {extractedTokens.typography.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No typography styles detected</p>
            ) : (
              <div className="space-y-2">
                {extractedTokens.typography.map((typo, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{typo.name}</span>
                      <Badge variant="outline" className="text-[10px]">Typography</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {typo.fontFamily && (
                        <div>
                          <span className="text-muted-foreground">Font:</span>
                          <span className="ml-1 font-mono">{typo.fontFamily.split(',')[0]}</span>
                        </div>
                      )}
                      {typo.fontSize && (
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <span className="ml-1 font-mono">{typo.fontSize}</span>
                        </div>
                      )}
                      {typo.fontWeight && (
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-1 font-mono">{typo.fontWeight}</span>
                        </div>
                      )}
                      {typo.lineHeight && (
                        <div>
                          <span className="text-muted-foreground">Line Height:</span>
                          <span className="ml-1 font-mono">{typo.lineHeight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="spacing" className="m-0 p-3">
            {extractedTokens.spacing.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No spacing values detected</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {extractedTokens.spacing.map((space, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(space.value, `space-${i}`)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <div 
                        className="bg-primary rounded-sm"
                        style={{ 
                          width: Math.min(24, parseInt(space.value) * 4 || 8),
                          height: Math.min(24, parseInt(space.value) * 4 || 8),
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium truncate">{space.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{space.value}</p>
                    </div>
                    {copied === `space-${i}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="m-0 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => copyToClipboard(generateCSSVariables(), 'css')}
              >
                <Settings2 className="w-4 h-4" />
                <span className="text-xs">CSS Variables</span>
                {copied === 'css' && <Check className="w-3 h-3 text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => copyToClipboard(generateTailwindConfig(), 'tailwind')}
              >
                <Layers className="w-4 h-4" />
                <span className="text-xs">Tailwind Config</span>
                {copied === 'tailwind' && <Check className="w-3 h-3 text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => copyToClipboard(generateFigmaTokens(), 'figma')}
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-xs">Figma Tokens</span>
                {copied === 'figma' && <Check className="w-3 h-3 text-green-500" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => copyToClipboard(generateStyleDictionary(), 'style-dict')}
              >
                <Zap className="w-4 h-4" />
                <span className="text-xs">Style Dictionary</span>
                {copied === 'style-dict' && <Check className="w-3 h-3 text-green-500" />}
              </Button>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
