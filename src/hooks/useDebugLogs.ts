import { useState, useEffect, useCallback } from "react";

interface DebugLog {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  message: string;
  data?: unknown;
}

interface DebugState {
  logs: DebugLog[];
  isEnabled: boolean;
  maxLogs: number;
}

/**
 * Hook for capturing and displaying debug information during development.
 * Provides structured logging with filtering capabilities.
 */
export function useDebugLogs(maxLogs = 100) {
  const [state, setState] = useState<DebugState>({
    logs: [],
    isEnabled: import.meta.env.DEV,
    maxLogs,
  });

  const addLog = useCallback(
    (
      level: DebugLog["level"],
      source: string,
      message: string,
      data?: unknown
    ) => {
      if (!state.isEnabled) return;

      const log: DebugLog = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
        level,
        source,
        message,
        data,
      };

      setState((prev) => ({
        ...prev,
        logs: [log, ...prev.logs].slice(0, prev.maxLogs),
      }));
    },
    [state.isEnabled]
  );

  const info = useCallback(
    (source: string, message: string, data?: unknown) =>
      addLog("info", source, message, data),
    [addLog]
  );

  const warn = useCallback(
    (source: string, message: string, data?: unknown) =>
      addLog("warn", source, message, data),
    [addLog]
  );

  const error = useCallback(
    (source: string, message: string, data?: unknown) =>
      addLog("error", source, message, data),
    [addLog]
  );

  const debug = useCallback(
    (source: string, message: string, data?: unknown) =>
      addLog("debug", source, message, data),
    [addLog]
  );

  const clearLogs = useCallback(() => {
    setState((prev) => ({ ...prev, logs: [] }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const filterByLevel = useCallback(
    (level: DebugLog["level"]) => {
      return state.logs.filter((log) => log.level === level);
    },
    [state.logs]
  );

  const filterBySource = useCallback(
    (source: string) => {
      return state.logs.filter((log) =>
        log.source.toLowerCase().includes(source.toLowerCase())
      );
    },
    [state.logs]
  );

  return {
    logs: state.logs,
    isEnabled: state.isEnabled,
    info,
    warn,
    error,
    debug,
    clearLogs,
    toggleEnabled,
    filterByLevel,
    filterBySource,
  };
}

/**
 * Hook for tracking component render performance.
 */
export function useRenderTracker(componentName: string) {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    setRenderCount((c) => c + 1);

    return () => {
      const duration = performance.now() - start;
      setLastRenderTime(duration);
      if (import.meta.env.DEV && duration > 16) {
        console.warn(
          `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`
        );
      }
    };
  });

  return { renderCount, lastRenderTime };
}

/**
 * Hook for tracking async operation states with error handling.
 */
export function useAsyncState<T>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
