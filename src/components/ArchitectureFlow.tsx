import { motion } from "framer-motion";
import { 
  Brain, FileJson, Code2, CheckCircle2, GitMerge, HardDrive, 
  Shield, Network, Lock, Scan, RefreshCw, ArrowRight, ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhaseNodeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  isActive?: boolean;
}

const PhaseNode = ({ title, description, icon, color, delay, isActive }: PhaseNodeProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className={cn(
      "glass-card p-4 rounded-xl border-2 transition-all duration-300",
      isActive ? `border-${color} glow-effect` : "border-border/50 hover:border-primary/30"
    )}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        `bg-${color}/10`
      )}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    <p className="text-xs text-muted-foreground">{description}</p>
  </motion.div>
);

const ConnectionLine = ({ direction = "right", delay = 0 }: { direction?: "right" | "down"; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay }}
    className="flex items-center justify-center"
  >
    {direction === "right" ? (
      <ArrowRight className="w-5 h-5 text-muted-foreground" />
    ) : (
      <ArrowDown className="w-5 h-5 text-muted-foreground" />
    )}
  </motion.div>
);

export const ArchitectureFlow = () => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Contract-First Multi-Agent Architecture</h2>
        <p className="text-muted-foreground">Advanced pipeline with memory layer and contract negotiation</p>
      </motion.div>

      {/* Phase A: Planning & Memory */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-primary uppercase tracking-wider"
        >
          Phase A: Planning & Memory
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <PhaseNode
            title="User Request"
            description="Incoming task or feature request"
            icon={<Brain className="w-5 h-5 text-primary" />}
            color="primary"
            delay={0.1}
          />
          <ConnectionLine delay={0.2} />
          <PhaseNode
            title="Orchestrator"
            description="Decomposes request, queries memory"
            icon={<Network className="w-5 h-5 text-orchestrator" />}
            color="orchestrator"
            delay={0.3}
            isActive
          />
          <ConnectionLine delay={0.4} />
          <PhaseNode
            title="Memory Layer"
            description="RAG context, coding standards, history"
            icon={<HardDrive className="w-5 h-5 text-memory" />}
            color="memory"
            delay={0.5}
          />
        </div>
      </div>

      <ConnectionLine direction="down" delay={0.6} />

      {/* Phase B: Contract Negotiation */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm font-medium text-contractNegotiator uppercase tracking-wider"
        >
          Phase B: Contract Negotiation
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <PhaseNode
            title="Python Agent"
            description="Proposes API schema"
            icon={<Code2 className="w-5 h-5 text-python" />}
            color="python"
            delay={0.8}
          />
          <ConnectionLine delay={0.9} />
          <PhaseNode
            title="Schema Registry"
            description="Validates and locks OpenAPI spec"
            icon={<Lock className="w-5 h-5 text-schemaRegistry" />}
            color="schemaRegistry"
            delay={1.0}
            isActive
          />
          <ConnectionLine delay={1.1} />
          <PhaseNode
            title="JS Agent"
            description="Validates consumption patterns"
            icon={<FileJson className="w-5 h-5 text-javascript" />}
            color="javascript"
            delay={1.2}
          />
        </div>
      </div>

      <ConnectionLine direction="down" delay={1.3} />

      {/* Phase C: Implementation & Security */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-sm font-medium text-success uppercase tracking-wider"
        >
          Phase C: Implementation & Security
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          <PhaseNode
            title="Language Agents"
            description="Code + tests per locked spec"
            icon={<Code2 className="w-5 h-5 text-primary" />}
            color="primary"
            delay={1.5}
          />
          <ConnectionLine delay={1.6} />
          <PhaseNode
            title="SecOps Agent"
            description="Parallel security audit"
            icon={<Shield className="w-5 h-5 text-secops" />}
            color="secops"
            delay={1.7}
          />
          <ConnectionLine delay={1.8} />
          <PhaseNode
            title="Sandbox"
            description="Isolated execution environment"
            icon={<Scan className="w-5 h-5 text-sandbox" />}
            color="sandbox"
            delay={1.9}
            isActive
          />
          <ConnectionLine delay={2.0} />
          <PhaseNode
            title="Verifier"
            description="Smart error classification"
            icon={<CheckCircle2 className="w-5 h-5 text-verifier" />}
            color="verifier"
            delay={2.1}
          />
        </div>
      </div>

      <ConnectionLine direction="down" delay={2.2} />

      {/* Phase D: Verification Loop */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="text-sm font-medium text-warning uppercase tracking-wider"
        >
          Phase D: Smart Verification Loop
        </motion.h3>
        <div className="glass-card p-4 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.4 }}
              className="p-3 rounded-lg bg-success/10 border border-success/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Low Severity</span>
              </div>
              <p className="text-xs text-muted-foreground">Auto-Linter fixes (no LLM cost)</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="p-3 rounded-lg bg-warning/10 border border-warning/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <Code2 className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Medium Severity</span>
              </div>
              <p className="text-xs text-muted-foreground">Return to Language Agent</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">High Severity</span>
              </div>
              <p className="text-xs text-muted-foreground">Return to Planner (design flaw)</p>
            </motion.div>
          </div>
        </div>
      </div>

      <ConnectionLine direction="down" delay={2.7} />

      {/* Phase E: Delivery */}
      <div className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="text-sm font-medium text-integrator uppercase tracking-wider"
        >
          Phase E: Delivery
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <PhaseNode
            title="Integrator"
            description="Merges artifacts, signs releases"
            icon={<GitMerge className="w-5 h-5 text-integrator" />}
            color="integrator"
            delay={2.9}
            isActive
          />
          <ConnectionLine delay={3.0} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 3.1 }}
            className="glass-card p-4 rounded-xl border-2 border-success bg-success/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Production Artifacts</h3>
                <p className="text-xs text-muted-foreground">Signed + Memory Updated</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureFlow;
