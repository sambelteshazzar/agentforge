import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Settings, 
  ChevronRight, Bot, Zap, CheckCircle2, AlertCircle,
  Clock, Activity, FileJson, Plus, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { agentConfig, pipelinePhases, orchestrationAgents } from "@/lib/agentConfig";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import { TaskSchemaEditor } from "@/components/TaskSchemaEditor";
import { VerifierPanel } from "@/components/VerifierPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { exampleTaskSchema, calculateTaskProgress } from "@/lib/taskSchema";
import { VerificationReport } from "@/lib/verifierTypes";

interface PipelineStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  progress: number;
  agent: string;
  logs: string[];
}

const PipelineOrchestration = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [activePhase, setActivePhase] = useState("planning");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: "1", name: "Initialize Memory Context", status: "completed", progress: 100, agent: "memory", logs: ["Retrieved 15 project standards", "Loaded error history"] },
    { id: "2", name: "Orchestrator Planning", status: "completed", progress: 100, agent: "orchestrator", logs: ["Decomposed task into 4 subtasks", "Assigned language targets"] },
    { id: "3", name: "Define API Contract", status: "running", progress: 65, agent: "contractNegotiator", logs: ["Generating OpenAPI spec...", "Validating schemas..."] },
    { id: "4", name: "Schema Registration", status: "pending", progress: 0, agent: "schemaRegistry", logs: [] },
    { id: "5", name: "Implementation", status: "pending", progress: 0, agent: "python", logs: [] },
    { id: "6", name: "Security Audit", status: "pending", progress: 0, agent: "secops", logs: [] },
    { id: "7", name: "Verification", status: "pending", progress: 0, agent: "verifier", logs: [] },
    { id: "8", name: "Integration & Delivery", status: "pending", progress: 0, agent: "integrator", logs: [] },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "running":
        return <Activity className="w-4 h-4 text-primary animate-pulse" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/30";
      case "running":
        return "bg-primary/10 text-primary border-primary/30";
      case "error":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none opacity-40"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 60%)" }}
      />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-xl font-semibold">Pipeline Orchestration</span>
                  <p className="text-xs text-muted-foreground">Advanced Multi-Agent Workflow</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="schema">Task Schema</TabsTrigger>
            <TabsTrigger value="verifier" className="gap-1">
              <Shield className="w-3 h-3" />
              Verifier
            </TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setIsRunning(!isRunning)}
                  className="gap-2"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Pipeline
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Pipeline
                    </>
                  )}
                </Button>
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Overall Progress:</span>
                  <span className="ml-2 font-medium">37%</span>
                </div>
                <Progress value={37} className="w-32" />
              </div>
            </motion.div>

            {/* Pipeline Phases */}
            <div className="grid lg:grid-cols-5 gap-4">
              {pipelinePhases.map((phase, idx) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActivePhase(phase.id)}
                  className={cn(
                    "glass-card p-4 rounded-xl cursor-pointer transition-all",
                    activePhase === phase.id 
                      ? "border-primary glow-effect" 
                      : "hover:border-primary/30"
                  )}
                >
                  <h3 className="font-medium text-sm mb-2">{phase.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {phase.agents.slice(0, 3).map(agentId => {
                      const agent = agentConfig[agentId];
                      return agent ? (
                        <Badge key={agentId} variant="secondary" className="text-xs">
                          {agent.name.split(" ")[0]}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pipeline Steps */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <h3 className="font-semibold mb-4">Execution Steps</h3>
                {pipelineSteps.map((step, idx) => {
                  const agent = agentConfig[step.agent];
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "glass-card p-4 rounded-xl border",
                        getStatusColor(step.status)
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.name}</span>
                        </div>
                        {agent && (
                          <Badge variant="outline" className="text-xs">
                            <agent.icon className="w-3 h-3 mr-1" />
                            {agent.name.split(" ")[0]}
                          </Badge>
                        )}
                      </div>
                      {step.status === "running" && (
                        <Progress value={step.progress} className="h-1.5 mt-2" />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Live Logs */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 rounded-xl"
              >
                <h3 className="font-semibold mb-4">Live Logs</h3>
                <div className="bg-background/50 rounded-lg p-4 font-mono text-xs space-y-1 h-[400px] overflow-y-auto">
                  {pipelineSteps.flatMap(step => 
                    step.logs.map((log, idx) => (
                      <div key={`${step.id}-${idx}`} className="flex gap-2">
                        <span className="text-muted-foreground">[{step.agent}]</span>
                        <span className="text-foreground">{log}</span>
                      </div>
                    ))
                  )}
                  {isRunning && (
                    <div className="flex gap-2 animate-pulse">
                      <span className="text-primary">[contractNegotiator]</span>
                      <span className="text-muted-foreground">Processing...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Task Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-primary" />
                  Unified Task Schema v2
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Contract-first schema with memory context, security constraints, and verification criteria
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 rounded-xl"
            >
              <TaskSchemaEditor 
                schema={exampleTaskSchema}
                onSave={(schema) => console.log("Saved schema:", schema)}
              />
            </motion.div>
          </TabsContent>

          {/* Verifier Tab */}
          <TabsContent value="verifier" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl"
            >
              <VerifierPanel 
                taskSchema={exampleTaskSchema}
                onVerificationComplete={(report: VerificationReport) => {
                  console.log("Verification complete:", report);
                }}
                onRepairRequest={(agent, suggestion) => {
                  console.log(`Routing to ${agent}: ${suggestion}`);
                }}
              />
            </motion.div>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 rounded-xl"
            >
              <ArchitectureFlow />
            </motion.div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold mb-4">Orchestration Agents</h3>
              <p className="text-muted-foreground mb-6">
                Specialized agents for the advanced contract-first architecture pipeline.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orchestrationAgents.map((agent, idx) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/agent/${agent.id}`)}
                  className="glass-card p-5 rounded-xl cursor-pointer transition-all hover:border-primary/30 hover:glow-effect group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `hsl(var(--primary) / 0.1)` }}
                    >
                      <agent.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      {agent.phase && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {agent.phase}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {agent.description}
                  </p>
                  <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open Agent</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PipelineOrchestration;
