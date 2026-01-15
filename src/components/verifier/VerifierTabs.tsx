import { 
  Package, FileCode, Shield, TestTube2, FileJson,
  XCircle, AlertTriangle, Lock, CheckCircle2, Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { 
  VerificationReport, 
  ScanStatus, 
  DependencyStatus 
} from "@/lib/verification";

interface VerifierTabsProps {
  report: VerificationReport;
}

function getStatusBadge(status: ScanStatus, passed?: boolean) {
  if (status === 'PENDING') return <Badge variant="secondary">Pending</Badge>;
  if (status === 'RUNNING') return <Badge variant="default" className="animate-pulse">Running</Badge>;
  if (status === 'FAILED') return <Badge variant="destructive">Error</Badge>;
  if (passed === undefined) return <Badge variant="secondary">Completed</Badge>;
  return passed 
    ? <Badge variant="default" className="bg-success">Passed</Badge>
    : <Badge variant="destructive">Failed</Badge>;
}

function getDependencyBadge(status: DependencyStatus) {
  switch (status) {
    case 'APPROVED': 
      return <Badge className="bg-success/10 text-success border-success/30">Approved</Badge>;
    case 'BANNED': 
      return <Badge variant="destructive">Banned</Badge>;
    case 'UNPINNED': 
      return <Badge variant="outline" className="border-warning text-warning">Unpinned</Badge>;
    case 'OUTDATED':
      return <Badge variant="outline" className="border-muted-foreground">Outdated</Badge>;
    default: 
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function VerifierTabs({ report }: VerifierTabsProps) {
  return (
    <Tabs defaultValue="dependencies" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="dependencies" className="gap-1">
          <Package className="w-3 h-3" />
          <span className="hidden sm:inline">Deps</span>
        </TabsTrigger>
        <TabsTrigger value="linting" className="gap-1">
          <FileCode className="w-3 h-3" />
          <span className="hidden sm:inline">Lint</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-1">
          <Shield className="w-3 h-3" />
          <span className="hidden sm:inline">Security</span>
        </TabsTrigger>
        <TabsTrigger value="tests" className="gap-1">
          <TestTube2 className="w-3 h-3" />
          <span className="hidden sm:inline">Tests</span>
        </TabsTrigger>
        <TabsTrigger value="contract" className="gap-1">
          <FileJson className="w-3 h-3" />
          <span className="hidden sm:inline">Contract</span>
        </TabsTrigger>
      </TabsList>

      {/* Dependencies Tab */}
      <TabsContent value="dependencies">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Dependency Vetting</h4>
            {getStatusBadge(report.dependencyVetting.status, report.dependencyVetting.passed)}
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {report.dependencyVetting.data.dependencies.map((dep, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{dep.name}</span>
                    <span className="text-xs text-muted-foreground">{dep.version}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDependencyBadge(dep.status)}
                    {dep.reason && (
                      <span 
                        className="text-xs text-muted-foreground max-w-[200px] truncate" 
                        title={dep.reason}
                      >
                        {dep.reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Linting Tab */}
      <TabsContent value="linting">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Static Analysis</h4>
            <Badge variant="outline">
              {report.staticAnalysis.data.lintingResults.length} issues
            </Badge>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {report.staticAnalysis.data.lintingResults.map((result, idx) => (
                <div key={idx} className="p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {result.severity === 'error' ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                      <span className="font-mono text-xs">
                        {result.file}:{result.line}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  <span className="text-xs text-muted-foreground">[{result.rule}]</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Security Scans</h4>
            {getStatusBadge(report.staticAnalysis.status, report.staticAnalysis.passed)}
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {report.staticAnalysis.data.securityScans.map((scan, idx) => (
                <div key={idx} className={cn(
                  "p-3 rounded-lg border",
                  scan.severity === 'critical' || scan.severity === 'high'
                    ? "bg-destructive/10 border-destructive/30"
                    : "bg-warning/10 border-warning/30"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium text-sm">{scan.type}</span>
                    </div>
                    <Badge variant={
                      scan.severity === 'high' || scan.severity === 'critical' 
                        ? 'destructive' 
                        : 'secondary'
                    }>
                      {scan.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm">{scan.message}</p>
                  {scan.cveId && (
                    <span className="text-xs text-muted-foreground">{scan.cveId}</span>
                  )}
                  {scan.remediation && (
                    <p className="text-xs text-primary mt-2">💡 {scan.remediation}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Tests Tab */}
      <TabsContent value="tests">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Test Execution</h4>
            {getStatusBadge(report.testExecution.status, report.testExecution.passed)}
          </div>
          {report.testExecution.data.suites.length > 0 && (
            <div className="mb-4 grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-success/10 rounded-lg">
                <div className="text-lg font-bold text-success">
                  {report.testExecution.data.suites[0].passed}
                </div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <div className="text-lg font-bold text-destructive">
                  {report.testExecution.data.suites[0].failed}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <div className="text-lg font-bold">
                  {report.testExecution.data.suites[0].skipped}
                </div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {report.testExecution.data.overallCoverage}%
                </div>
                <div className="text-xs text-muted-foreground">Coverage</div>
              </div>
            </div>
          )}
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {report.testExecution.data.suites.flatMap(suite => 
                suite.testResults
              ).map((test, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {test.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : test.status === 'failed' ? (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-mono text-sm">{test.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{test.durationMs}ms</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>

      {/* Contract Tab */}
      <TabsContent value="contract">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Contract Validation</h4>
            {getStatusBadge(report.contractValidation.status, report.contractValidation.passed)}
          </div>
          {report.contractValidation.data.result && (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                <span>Validator: {report.contractValidation.data.result.validator}</span>
                <span className="mx-2">•</span>
                <span>
                  {report.contractValidation.data.result.validated}/
                  {report.contractValidation.data.result.totalEndpoints} endpoints
                </span>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {report.contractValidation.data.result.violations.map((violation, idx) => (
                    <div key={idx} className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{violation.method}</Badge>
                        <span className="font-mono text-sm">{violation.endpoint}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>{violation.violationType}:</strong> Expected {violation.expected}, got {violation.actual}
                      </p>
                    </div>
                  ))}
                  {report.contractValidation.data.result.violations.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
                      All endpoints match contract specification
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
