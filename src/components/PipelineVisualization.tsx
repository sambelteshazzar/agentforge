import { Brain, Code2, CheckCircle2, Package, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    id: "planner",
    name: "Planner",
    icon: Brain,
    color: "planner",
    description: "Task decomposition",
  },
  {
    id: "agents",
    name: "Agents",
    icon: Code2,
    color: "javascript",
    description: "Code generation",
  },
  {
    id: "verifier",
    name: "Verifier",
    icon: CheckCircle2,
    color: "verifier",
    description: "Test & validate",
  },
  {
    id: "integrator",
    name: "Integrator",
    icon: Package,
    color: "devops",
    description: "Package & deploy",
  },
];

const colorClasses: Record<string, string> = {
  planner: "bg-planner/10 text-planner border-planner/30",
  javascript: "bg-javascript/10 text-javascript border-javascript/30",
  verifier: "bg-verifier/10 text-verifier border-verifier/30",
  devops: "bg-devops/10 text-devops border-devops/30",
};

export function PipelineVisualization() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6">Pipeline Overview</h3>
      
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[100px]">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-110",
                  colorClasses[stage.color]
                )}
              >
                <stage.icon className="w-6 h-6" />
              </div>
              <span className="mt-2 text-sm font-medium">{stage.name}</span>
              <span className="text-xs text-muted-foreground">
                {stage.description}
              </span>
            </div>
            
            {index < stages.length - 1 && (
              <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
