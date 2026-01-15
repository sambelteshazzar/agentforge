import { Shield, Play, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifierHeaderProps {
  isRunning: boolean;
  onRunVerification: () => void;
  onReset?: () => void;
}

export function VerifierHeader({ 
  isRunning, 
  onRunVerification, 
  onReset 
}: VerifierHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold">Verifier Agent</h3>
          <p className="text-xs text-muted-foreground">
            Sandboxed Execution & Evaluation
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onRunVerification}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Verification
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          disabled={isRunning}
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
