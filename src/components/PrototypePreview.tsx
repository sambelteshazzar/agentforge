import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VisualPrototype } from "./VisualPrototype";
import { EditorExport } from "./EditorExport";
import { DesignTokenSync } from "./DesignTokenSync";
import { CollaborationPanel } from "./CollaborationPanel";
import { LiveCursors, CursorTracker } from "./LiveCursors";
import { useCollaboration } from "@/hooks/useCollaboration";
import { 
  Eye, Code2, Copy, Check, Maximize2, X, 
  Zap, ChevronDown, ChevronUp, Columns, Play, Pause,
  SkipBack, SkipForward, RefreshCw, Keyboard,
  Monitor, Tablet, Smartphone, ZoomIn, ZoomOut,
  Sun, Moon, Download, Share2, Settings2, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import Prism from "prismjs";

interface PrototypePreviewProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
  roomId?: string;
}

type ViewMode = "prototype" | "code" | "split";
type DevicePreview = "desktop" | "tablet" | "mobile";

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

const KEYBOARD_SHORTCUTS = [
  { key: "⌘/Ctrl + S", action: "Save" },
  { key: "⌘/Ctrl + C", action: "Copy" },
  { key: "⌘/Ctrl + F", action: "Fullscreen" },
  { key: "⌘/Ctrl + P", action: "Preview" },
  { key: "Esc", action: "Exit Fullscreen" },
];

export const PrototypePreview = ({ code, language, onCopy, copied, roomId: initialRoomId }: PrototypePreviewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(
    canShowVisualPreview(language) ? "prototype" : "code"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTokenSync, setShowTokenSync] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(initialRoomId || "");
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("desktop");
  const [zoom, setZoom] = useState(100);
  const [isDarkPreview, setIsDarkPreview] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [showActivity, setShowActivity] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<string[]>([]);
  
  const codeRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prismLanguage = getPrismLanguage(language);
  const hasVisualPreview = canShowVisualPreview(language);

  const {
    collaborators,
    isConnected,
    currentUser,
    updateCursor,
  } = useCollaboration(currentRoomId);

  // Simulate realtime updates
  useEffect(() => {
    if (!isPlaying) return;
    
    const messages = [
      "Component mounted",
      "State updated",
      "Re-rendering...",
      "DOM patched",
      "Event handlers attached",
      "Styles applied",
    ];
    
    const interval = setInterval(() => {
      setRealtimeUpdates(prev => {
        const newUpdate = `[${new Date().toLocaleTimeString()}] ${messages[Math.floor(Math.random() * messages.length)]}`;
        return [...prev.slice(-9), newUpdate];
      });
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
      if (isMeta && e.key === "f") {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
      if (isMeta && e.key === "c" && !window.getSelection()?.toString()) {
        e.preventDefault();
        onCopy();
      }
      if (isMeta && e.key === "p") {
        e.preventDefault();
        setViewMode("prototype");
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onCopy]);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = `room_${Math.random().toString(36).slice(2, 11)}`;
    setCurrentRoomId(newRoomId);
    return newRoomId;
  }, []);

  const handleJoinRoom = useCallback((roomId: string) => {
    setCurrentRoomId(roomId);
  }, []);

  useEffect(() => {
    if (codeRef.current && (viewMode === "code" || viewMode === "split")) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, prismLanguage, viewMode]);

  // Step through simulation
  const totalSteps = code.split('\n').length;
  
  const handleStepForward = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };
  
  const handleStepBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <TooltipProvider>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "rounded-xl overflow-hidden border border-border bg-card relative",
          isFullscreen && "fixed inset-4 z-50 shadow-2xl flex flex-col"
        )}
      >
        {/* Live Cursors */}
        {currentRoomId && (
          <>
            <LiveCursors collaborators={collaborators} containerRef={containerRef} />
            <CursorTracker onCursorMove={updateCursor} />
          </>
        )}

        {/* Header */}
        <motion.div 
          className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            {/* Language Badge */}
            <motion.div 
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-background"
              whileHover={{ scale: 1.02 }}
            >
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono">{language}</span>
            </motion.div>

            {/* View Mode Tabs */}
            {hasVisualPreview && (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="prototype" className="text-xs px-3 gap-1.5">
                    <Eye className="w-3 h-3" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs px-3 gap-1.5">
                    <Code2 className="w-3 h-3" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="split" className="text-xs px-3 gap-1.5">
                    <Columns className="w-3 h-3" />
                    Split
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Device Preview Selector */}
            {(viewMode === "prototype" || viewMode === "split") && hasVisualPreview && (
              <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                {[
                  { value: "desktop" as const, icon: Monitor, label: "Desktop" },
                  { value: "tablet" as const, icon: Tablet, label: "Tablet" },
                  { value: "mobile" as const, icon: Smartphone, label: "Mobile" },
                ].map(({ value, icon: Icon, label }) => (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={devicePreview === value ? "secondary" : "ghost"}
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDevicePreview(value)}
                      >
                        <Icon className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Activity Indicator */}
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs">Live</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-background rounded-lg p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
              
              <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </div>

            {/* Theme Toggle for Preview */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsDarkPreview(!isDarkPreview)}
                >
                  {isDarkPreview ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Preview Theme</TooltipContent>
            </Tooltip>

            {/* Design Token Sync */}
            <Button
              variant={showTokenSync ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowTokenSync(!showTokenSync)}
            >
              <Zap className="w-3.5 h-3.5" />
              Tokens
              {showTokenSync ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>

            {/* Activity Panel */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showActivity ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowActivity(!showActivity)}
                >
                  <Activity className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Realtime Activity</TooltipContent>
            </Tooltip>

            {/* Keyboard Shortcuts */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showShortcuts ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowShortcuts(!showShortcuts)}
                >
                  <Keyboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts</TooltipContent>
            </Tooltip>

            <CollaborationPanel
              roomId={currentRoomId}
              collaborators={collaborators}
              isConnected={isConnected}
              currentUser={currentUser}
              onJoinRoom={handleJoinRoom}
              onCreateRoom={handleCreateRoom}
            />
            
            <EditorExport code={code} language={language} />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen (⌘F)"}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onCopy}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="w-4 h-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Code (⌘C)</TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Playback Controls Bar */}
        <motion.div 
          className="flex items-center justify-between px-4 py-2 bg-background/50 border-b border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStepBack} disabled={currentStep === 0}>
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step Back</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isPlaying ? "secondary" : "default"} 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isPlaying ? "Pause" : "Play"}</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleStepForward} disabled={currentStep >= totalSteps - 1}>
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Step Forward</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Line {currentStep + 1} / {totalSteps}
            </span>
            <div className="w-32">
              <Slider
                value={[currentStep]}
                onValueChange={([v]) => setCurrentStep(v)}
                max={totalSteps - 1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2, 4].map((speed) => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? "secondary" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Panel */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-3 bg-muted/30 border-b border-border"
            >
              <div className="flex items-center gap-6 flex-wrap">
                {KEYBOARD_SHORTCUTS.map(({ key, action }) => (
                  <div key={key} className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-mono bg-background rounded border border-border">
                      {key}
                    </kbd>
                    <span className="text-xs text-muted-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-hidden",
          isFullscreen ? "flex-1" : "max-h-[500px]"
        )}>
          {viewMode === "split" ? (
            <div className="flex h-full">
              {/* Code Panel */}
              <div className="w-1/2 border-r border-border overflow-auto bg-[#1a1b26]">
                <pre className="p-4 text-sm leading-relaxed m-0">
                  <div className="flex">
                    <div className="select-none pr-4 text-right text-[#565f89] font-mono text-xs border-r border-[#414868] mr-4 flex-shrink-0">
                      {code.split('\n').map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "leading-relaxed transition-colors",
                            i === currentStep && "bg-primary/20 text-primary"
                          )}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <code ref={codeRef} className={`language-${prismLanguage} font-mono text-xs`}>
                      {code}
                    </code>
                  </div>
                </pre>
              </div>
              
              {/* Preview Panel */}
              <div className="w-1/2 overflow-auto">
                <VisualPrototype code={code} language={language} />
              </div>
            </div>
          ) : viewMode === "prototype" && hasVisualPreview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
            >
              <VisualPrototype code={code} language={language} />
            </motion.div>
          ) : (
            <div className={cn(
              "overflow-auto bg-[#1a1b26]",
              isFullscreen ? "h-full" : "max-h-[500px]"
            )}>
              <pre className="p-4 text-sm leading-relaxed m-0">
                <div className="flex">
                  <div className="select-none pr-4 text-right text-[#565f89] font-mono text-xs border-r border-[#414868] mr-4 flex-shrink-0">
                    {code.split('\n').map((_, i) => (
                      <motion.div 
                        key={i} 
                        className={cn(
                          "leading-relaxed transition-colors",
                          i === currentStep && "bg-primary/20 text-primary rounded"
                        )}
                        animate={{ 
                          backgroundColor: i === currentStep ? "rgba(34, 211, 238, 0.2)" : "transparent"
                        }}
                      >
                        {i + 1}
                      </motion.div>
                    ))}
                  </div>
                  <code ref={codeRef} className={`language-${prismLanguage} font-mono text-xs`}>
                    {code}
                  </code>
                </div>
              </pre>
            </div>
          )}
        </div>

        {/* Realtime Activity Panel */}
        <AnimatePresence>
          {showActivity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 120 }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border bg-background/80 overflow-hidden"
            >
              <div className="p-3 h-full overflow-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Realtime Updates</span>
                  {isPlaying && (
                    <Badge variant="secondary" className="text-xs animate-pulse">
                      Recording
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {realtimeUpdates.length === 0 ? (
                    <p className="text-muted-foreground italic">Press play to see realtime updates...</p>
                  ) : (
                    realtimeUpdates.map((update, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-muted-foreground"
                      >
                        {update}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Design Token Sync Panel */}
        <AnimatePresence>
          {showTokenSync && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <DesignTokenSync code={code} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};
