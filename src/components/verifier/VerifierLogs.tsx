import { Terminal } from "lucide-react";
import type { VerificationReport } from "@/lib/verification";

interface VerifierLogsProps {
  report: VerificationReport;
}

export function VerifierLogs({ report }: VerifierLogsProps) {
  if (report.status !== 'COMPLETED') {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4" />
        <h4 className="font-medium">Execution Logs</h4>
      </div>
      <div className="bg-background/80 rounded-lg p-3 font-mono text-xs">
        <div className="text-muted-foreground">
          {report.output.logs.stdout}
        </div>
        {report.output.logs.stderr && (
          <div className="text-destructive mt-1">
            {report.output.logs.stderr}
          </div>
        )}
        <div className="mt-2 text-muted-foreground">
          Exit code: {report.output.logs.exitCode} | 
          Duration: {report.output.logs.executionTimeMs}ms
        </div>
      </div>
    </div>
  );
}
