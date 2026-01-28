import { useState } from "react";
import { Maximize2, Minimize2, Smartphone, Tablet, Monitor, SplitSquareHorizontal, Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type DevicePreset = "mobile" | "tablet" | "desktop" | "responsive";
export type ViewMode = "code" | "preview" | "split";

interface DeviceConfig {
  width: number;
  height: number;
  label: string;
  icon: React.ReactNode;
}

export const devicePresets: Record<DevicePreset, DeviceConfig> = {
  mobile: { width: 375, height: 667, label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
  tablet: { width: 768, height: 1024, label: "Tablet", icon: <Tablet className="w-4 h-4" /> },
  desktop: { width: 1280, height: 800, label: "Desktop", icon: <Monitor className="w-4 h-4" /> },
  responsive: { width: 0, height: 0, label: "Responsive", icon: <Maximize2 className="w-4 h-4" /> },
};

interface PreviewControlsProps {
  devicePreset: DevicePreset;
  viewMode: ViewMode;
  isFullscreen: boolean;
  onDeviceChange: (device: DevicePreset) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFullscreenToggle: () => void;
}

export const PreviewControls = ({
  devicePreset,
  viewMode,
  isFullscreen,
  onDeviceChange,
  onViewModeChange,
  onFullscreenToggle,
}: PreviewControlsProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Device Presets */}
        <ToggleGroup
          type="single"
          value={devicePreset}
          onValueChange={(value) => value && onDeviceChange(value as DevicePreset)}
          className="bg-secondary/50 rounded-lg p-1"
        >
          {Object.entries(devicePresets).map(([key, config]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={key}
                  size="sm"
                  className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {config.icon}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.label} {config.width > 0 && `(${config.width}×${config.height})`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>

        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
          className="bg-secondary/50 rounded-lg p-1"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="code"
                size="sm"
                className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Code2 className="w-4 h-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Code only</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="split"
                size="sm"
                className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <SplitSquareHorizontal className="w-4 h-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Side by side</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="preview"
                size="sm"
                className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <Eye className="w-4 h-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Preview only</TooltipContent>
          </Tooltip>
        </ToggleGroup>

        {/* Fullscreen Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onFullscreenToggle}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
