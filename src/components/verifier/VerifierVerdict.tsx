import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VerificationReport } from "@/lib/verification";

interface VerifierVerdictProps {
  report: VerificationReport;
  maxBudget: number;
  onRepairRequest?: (targetAgent: string, suggestion: string) => void;
}

export function VerifierVerdict({ 
  report, 
  maxBudget,
  onRepairRequest 
}: VerifierVerdictProps) {
  if (report.status !== 'COMPLETED') {
    return null;
  }

  const isPassed = report.output.verdict === 'PASS';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "glass-card p-6 rounded-xl border-2",
        isPassed 
          ? "border-success/50 bg-success/5" 
          : "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isPassed ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <XCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <h3 className={cn(
              "text-xl font-bold",
              isPassed ? "text-success" : "text-destructive"
            )}>
              {report.output.verdict}
            </h3>
            {report.output.failureCategory !== 'NONE' && (
              <Badge variant="outline" className="mt-1">
                {report.output.failureCategory}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>Iteration: {report.output.iterationCount}/{maxBudget}</div>
          <div>Budget: {report.output.budgetRemaining} remaining</div>
        </div>
      </div>

      {!isPassed && (
        <div className="space-y-3">
          <div className="bg-background/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Feedback to Agent</h4>
            <p className="text-sm text-muted-foreground">
              {report.output.feedbackToAgent}
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Repair Suggestion</h4>
            <p className="text-sm text-muted-foreground">
              {report.output.repairSuggestion}
            </p>
          </div>
          {report.output.retryRecommended && report.output.targetAgent && (
            <Button 
              className="w-full gap-2 mt-2"
              onClick={() => onRepairRequest?.(
                report.output.targetAgent!, 
                report.output.repairSuggestion
              )}
            >
              <ArrowRight className="w-4 h-4" />
              Route to {report.output.targetAgent}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
