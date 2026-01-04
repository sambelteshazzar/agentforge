import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AgentInfo } from "@/lib/agentConfig";
import { cn } from "@/lib/utils";
import { z } from "zod";

const settingsSchema = z.object({
  customInstructions: z.string().max(2000, "Instructions must be less than 2000 characters"),
  codingStyle: z.enum(["concise", "verbose", "balanced"]),
  includeComments: z.boolean(),
  includeTests: z.boolean(),
  includeDocumentation: z.boolean(),
  preferredFrameworks: z.string().max(500, "Frameworks list must be less than 500 characters"),
  outputFormat: z.enum(["code-only", "explanation-first", "step-by-step"]),
  errorHandling: z.enum(["minimal", "standard", "comprehensive"]),
  namingConvention: z.enum(["camelCase", "snake_case", "PascalCase", "kebab-case"]),
  templateCode: z.string().max(5000, "Template must be less than 5000 characters"),
});

export type AgentSettings = z.infer<typeof settingsSchema>;

const defaultSettings: AgentSettings = {
  customInstructions: "",
  codingStyle: "balanced",
  includeComments: true,
  includeTests: false,
  includeDocumentation: false,
  preferredFrameworks: "",
  outputFormat: "explanation-first",
  errorHandling: "standard",
  namingConvention: "camelCase",
  templateCode: "",
};

interface AgentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentInfo;
  onSettingsSaved?: (settings: AgentSettings) => void;
}

export function AgentSettingsDialog({
  open,
  onOpenChange,
  agent,
  onSettingsSaved,
}: AgentSettingsDialogProps) {
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, agent.id]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSettings(defaultSettings);
        return;
      }

      const { data, error } = await supabase
        .from("agent_configurations")
        .select("settings")
        .eq("user_id", user.id)
        .eq("agent_type", agent.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.settings) {
        setSettings({ ...defaultSettings, ...(data.settings as Partial<AgentSettings>) });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateSettings = (): boolean => {
    try {
      settingsSchema.parse(settings);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const saveSettings = async () => {
    if (!validateSettings()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors before saving",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please sign in to save settings",
        });
        return;
      }

      const { error } = await supabase
        .from("agent_configurations")
        .upsert({
          user_id: user.id,
          agent_type: agent.id,
          settings: settings,
          is_active: true,
        }, {
          onConflict: "user_id,agent_type",
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: `${agent.name} configuration has been updated.`,
      });

      onSettingsSaved?.(settings);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setErrors({});
    toast({
      title: "Settings reset",
      description: "Settings have been reset to defaults. Save to apply.",
    });
  };

  const updateSetting = <K extends keyof AgentSettings>(
    key: K,
    value: AgentSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const Icon = agent.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", agent.iconBg)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{agent.name} Settings</DialogTitle>
              <DialogDescription>
                Customize how this agent generates code and responds to your requests.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="behavior" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="style">Code Style</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="behavior" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Add specific instructions for this agent... e.g., 'Always use async/await instead of promises'"
                  value={settings.customInstructions}
                  onChange={(e) => updateSetting("customInstructions", e.target.value)}
                  className="min-h-[100px] bg-secondary/50"
                />
                {errors.customInstructions && (
                  <p className="text-xs text-destructive">{errors.customInstructions}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  These instructions will be added to every request to this agent.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Select
                  value={settings.outputFormat}
                  onValueChange={(v) => updateSetting("outputFormat", v as AgentSettings["outputFormat"])}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code-only">Code Only</SelectItem>
                    <SelectItem value="explanation-first">Explanation First</SelectItem>
                    <SelectItem value="step-by-step">Step by Step</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredFrameworks">Preferred Frameworks/Libraries</Label>
                <Input
                  id="preferredFrameworks"
                  placeholder="e.g., React, Express, Jest"
                  value={settings.preferredFrameworks}
                  onChange={(e) => updateSetting("preferredFrameworks", e.target.value)}
                  className="bg-secondary/50"
                />
                {errors.preferredFrameworks && (
                  <p className="text-xs text-destructive">{errors.preferredFrameworks}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <Label htmlFor="includeComments" className="cursor-pointer">
                    Include Comments
                  </Label>
                  <Switch
                    id="includeComments"
                    checked={settings.includeComments}
                    onCheckedChange={(v) => updateSetting("includeComments", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <Label htmlFor="includeTests" className="cursor-pointer">
                    Include Tests
                  </Label>
                  <Switch
                    id="includeTests"
                    checked={settings.includeTests}
                    onCheckedChange={(v) => updateSetting("includeTests", v)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 col-span-2">
                  <Label htmlFor="includeDocumentation" className="cursor-pointer">
                    Include Documentation
                  </Label>
                  <Switch
                    id="includeDocumentation"
                    checked={settings.includeDocumentation}
                    onCheckedChange={(v) => updateSetting("includeDocumentation", v)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="codingStyle">Coding Style</Label>
                <Select
                  value={settings.codingStyle}
                  onValueChange={(v) => updateSetting("codingStyle", v as AgentSettings["codingStyle"])}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise - Minimal code, no extras</SelectItem>
                    <SelectItem value="balanced">Balanced - Clear and practical</SelectItem>
                    <SelectItem value="verbose">Verbose - Detailed with explanations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="namingConvention">Naming Convention</Label>
                <Select
                  value={settings.namingConvention}
                  onValueChange={(v) => updateSetting("namingConvention", v as AgentSettings["namingConvention"])}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camelCase">camelCase</SelectItem>
                    <SelectItem value="snake_case">snake_case</SelectItem>
                    <SelectItem value="PascalCase">PascalCase</SelectItem>
                    <SelectItem value="kebab-case">kebab-case</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorHandling">Error Handling</Label>
                <Select
                  value={settings.errorHandling}
                  onValueChange={(v) => updateSetting("errorHandling", v as AgentSettings["errorHandling"])}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal - Basic try/catch</SelectItem>
                    <SelectItem value="standard">Standard - Common error cases</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive - Full error handling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="templateCode">Default Template Code</Label>
                <Textarea
                  id="templateCode"
                  placeholder="Add boilerplate code that should be included by default..."
                  value={settings.templateCode}
                  onChange={(e) => updateSetting("templateCode", e.target.value)}
                  className="min-h-[200px] font-mono text-sm bg-secondary/50"
                />
                {errors.templateCode && (
                  <p className="text-xs text-destructive">{errors.templateCode}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This template will be used as a starting point when generating code.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4">
          <Button variant="outline" onClick={resetSettings} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="glow" onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
