import { useState } from "react";
import { Bug, X, Trash2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DebugLog {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  message: string;
  data?: unknown;
}

interface DebugPanelProps {
  logs: DebugLog[];
  isEnabled: boolean;
  onClear: () => void;
  onToggle: () => void;
}

const levelColors = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  warn: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
  debug: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const levelIcons = {
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  debug: "🔍",
};

/**
 * Floating debug panel for viewing logs during development.
 * Shows structured logs with filtering and search capabilities.
 */
export const DebugPanel = ({
  logs,
  isEnabled,
  onClear,
  onToggle,
}: DebugPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [filter, setFilter] = useState<"all" | DebugLog["level"]>("all");
  const [search, setSearch] = useState("");

  // Only show in development
  if (!import.meta.env.DEV) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filter === "all" || log.level === filter;
    const matchesSearch =
      search === "" ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        title="Open Debug Panel"
      >
        <Bug className="w-5 h-5" />
        {logs.filter((l) => l.level === "error").length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
            {logs.filter((l) => l.level === "error").length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-2xl transition-all",
        isMinimized ? "w-[300px]" : "w-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Debug Panel</span>
          <Badge
            variant="outline"
            className={cn("text-xs", isEnabled ? "text-success" : "text-muted-foreground")}
          >
            {isEnabled ? "Active" : "Paused"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggle}
            title={isEnabled ? "Pause logging" : "Resume logging"}
          >
            {isEnabled ? "⏸" : "▶"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs flex-1"
            />
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <SelectTrigger className="w-[100px] h-7 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClear}
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Logs */}
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No logs to display
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-2 rounded text-xs border",
                      levelColors[log.level]
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span>{levelIcons[log.level]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.source}</span>
                          <span className="text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="break-words">{log.message}</p>
                        {log.data !== undefined && (
                          <pre className="mt-1 p-1 bg-background/50 rounded text-[10px] overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-3 py-1 text-xs text-muted-foreground border-t border-border">
            {filteredLogs.length} / {logs.length} logs
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPanel;
