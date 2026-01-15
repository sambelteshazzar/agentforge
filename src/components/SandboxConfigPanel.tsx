import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Cpu, 
  HardDrive, 
  Clock, 
  Wifi, 
  WifiOff, 
  Lock, 
  Container,
  AlertTriangle
} from "lucide-react";
import { 
  type SandboxConfig, 
  type RunnerType, 
  type NetworkMode, 
  type SeccompProfile,
  createDefaultSandboxConfig 
} from "@/lib/verification";

interface SandboxConfigPanelProps {
  config?: SandboxConfig;
  onChange?: (config: SandboxConfig) => void;
  readOnly?: boolean;
}

export function SandboxConfigPanel({ 
  config: initialConfig, 
  onChange,
  readOnly = false 
}: SandboxConfigPanelProps) {
  const [config, setConfig] = useState<SandboxConfig>(
    initialConfig || createDefaultSandboxConfig('python')
  );

  const updateConfig = (updates: Partial<SandboxConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  const updateResourceLimits = (updates: Partial<SandboxConfig['resourceLimits']>) => {
    updateConfig({
      resourceLimits: { ...config.resourceLimits, ...updates }
    });
  };

  const updateNetworkPolicy = (updates: Partial<SandboxConfig['networkPolicy']>) => {
    updateConfig({
      networkPolicy: { ...config.networkPolicy, ...updates }
    });
  };

  const updateSecurity = (updates: Partial<SandboxConfig['security']>) => {
    updateConfig({
      security: { ...config.security, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Runner Selection */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Container className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Runner Configuration</CardTitle>
          </div>
          <CardDescription>Select the sandbox runtime environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Runner Type</Label>
              <Select
                value={config.runner}
                onValueChange={(value: RunnerType) => updateConfig({ runner: value })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">PY</span>
                      Python 3.11 Runner
                    </div>
                  </SelectItem>
                  <SelectItem value="node">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">JS</span>
                      Node.js 20 Runner
                    </div>
                  </SelectItem>
                  <SelectItem value="typescript">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded">TS</span>
                      TypeScript Runner
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {config.runner === 'python' ? 'pytest' : 'jest'} pre-installed
              </Badge>
              <Badge variant="outline" className="text-xs">
                {config.runner === 'python' ? 'bandit' : 'snyk'} security
              </Badge>
              <Badge variant="outline" className="text-xs">
                {config.runner === 'python' ? 'flake8' : 'eslint'} linting
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Limits */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Resource Limits</CardTitle>
          </div>
          <CardDescription>Prevent runaway processes from crashing the host</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Memory Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <Label>Memory Limit</Label>
              </div>
              <Badge variant="secondary">{config.resourceLimits.memoryMb} MB</Badge>
            </div>
            <Slider
              value={[config.resourceLimits.memoryMb]}
              onValueChange={([value]) => updateResourceLimits({ memoryMb: value })}
              min={128}
              max={2048}
              step={128}
              disabled={readOnly}
            />
            <p className="text-xs text-muted-foreground">
              Maximum memory the container can use before being killed
            </p>
          </div>

          <Separator />

          {/* CPU Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <Label>CPU Cores</Label>
              </div>
              <Badge variant="secondary">{config.resourceLimits.cpuCores} cores</Badge>
            </div>
            <Slider
              value={[config.resourceLimits.cpuCores * 10]}
              onValueChange={([value]) => updateResourceLimits({ cpuCores: value / 10 })}
              min={1}
              max={20}
              step={1}
              disabled={readOnly}
            />
            <p className="text-xs text-muted-foreground">
              CPU allocation (0.5 = half a core)
            </p>
          </div>

          <Separator />

          {/* Timeout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Execution Timeout</Label>
              </div>
              <Badge variant="secondary">{config.resourceLimits.timeoutSeconds}s</Badge>
            </div>
            <Slider
              value={[config.resourceLimits.timeoutSeconds]}
              onValueChange={([value]) => updateResourceLimits({ timeoutSeconds: value })}
              min={5}
              max={120}
              step={5}
              disabled={readOnly}
            />
            <p className="text-xs text-muted-foreground">
              Kill container if tests hang (prevents infinite loops)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Network Policy */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {config.networkPolicy.mode === 'none' ? (
              <WifiOff className="h-5 w-5 text-warning" />
            ) : (
              <Wifi className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="text-lg">Network Policy</CardTitle>
          </div>
          <CardDescription>Control container's network access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Network Mode</Label>
            <Select
              value={config.networkPolicy.mode}
              onValueChange={(value: NetworkMode) => 
                updateNetworkPolicy({ mode: value })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-warning" />
                    No Network Access
                  </div>
                </SelectItem>
                <SelectItem value="build-only">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-warning" />
                    Build Phase Only
                  </div>
                </SelectItem>
                <SelectItem value="restricted">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-success" />
                    Restricted (Allowlist)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block Data Exfiltration</Label>
              <p className="text-xs text-muted-foreground">
                Prevent sending data to external endpoints
              </p>
            </div>
            <Switch
              checked={config.networkPolicy.blockExfiltration}
              onCheckedChange={(checked) => 
                updateNetworkPolicy({ blockExfiltration: checked })
              }
              disabled={readOnly}
            />
          </div>

          {config.networkPolicy.mode === 'none' && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning">
                Network is completely disabled. Dependencies must be pre-installed in the runner image.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Hardening */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Security Hardening</CardTitle>
          </div>
          <CardDescription>Container isolation and privilege restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Read-Only Filesystem
              </Label>
              <p className="text-xs text-muted-foreground">
                Prevent code from modifying system binaries
              </p>
            </div>
            <Switch
              checked={config.security.readOnlyFilesystem}
              onCheckedChange={(checked) => 
                updateSecurity({ readOnlyFilesystem: checked })
              }
              disabled={readOnly}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No New Privileges</Label>
              <p className="text-xs text-muted-foreground">
                Block privilege escalation attempts
              </p>
            </div>
            <Switch
              checked={config.security.noNewPrivileges}
              onCheckedChange={(checked) => 
                updateSecurity({ noNewPrivileges: checked })
              }
              disabled={readOnly}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Seccomp Profile</Label>
            <Select
              value={config.security.seccompProfile}
              onValueChange={(value: SeccompProfile) => 
                updateSecurity({ seccompProfile: value })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Profile</SelectItem>
                <SelectItem value="strict">Strict Profile</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              System call filtering for additional isolation
            </p>
          </div>

          {/* Security Summary */}
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Security Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.security.readOnlyFilesystem && (
                <Badge className="bg-success/20 text-success text-xs">Read-Only FS</Badge>
              )}
              {config.security.noNewPrivileges && (
                <Badge className="bg-success/20 text-success text-xs">No Privesc</Badge>
              )}
              {config.networkPolicy.mode === 'none' && (
                <Badge className="bg-success/20 text-success text-xs">Air-Gapped</Badge>
              )}
              {config.networkPolicy.blockExfiltration && (
                <Badge className="bg-success/20 text-success text-xs">No Exfil</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
