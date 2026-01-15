import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

type VerificationPhase = 
  | 'idle' 
  | 'dependencies' 
  | 'linting' 
  | 'tests' 
  | 'contract' 
  | 'finalizing' 
  | 'complete';

interface VerifierProgressProps {
  currentPhase: VerificationPhase;
}

const PHASE_PROGRESS: Record<VerificationPhase, number> = {
  idle: 0,
  dependencies: 20,
  linting: 40,
  tests: 70,
  contract: 90,
  finalizing: 95,
  complete: 100,
};

export function VerifierProgress({ currentPhase }: VerifierProgressProps) {
  if (currentPhase === 'idle' || currentPhase === 'complete') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass-card p-4 rounded-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium capitalize">
          {currentPhase.replace('_', ' ')}
        </span>
        <span className="text-xs text-muted-foreground">In Progress</span>
      </div>
      <Progress value={PHASE_PROGRESS[currentPhase]} className="h-2" />
    </motion.div>
  );
}

export type { VerificationPhase };
