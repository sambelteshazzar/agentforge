import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AgentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "idle" | "error";
  color: "python" | "javascript" | "devops" | "verifier" | "planner";
  tasks?: number;
  className?: string;
}

const colorClasses = {
  python: "border-python/30 hover:border-python/60",
  javascript: "border-javascript/30 hover:border-javascript/60",
  devops: "border-devops/30 hover:border-devops/60",
  verifier: "border-verifier/30 hover:border-verifier/60",
  planner: "border-planner/30 hover:border-planner/60",
};

const iconBgClasses = {
  python: "bg-python/10 text-python",
  javascript: "bg-javascript/10 text-javascript",
  devops: "bg-devops/10 text-devops",
  verifier: "bg-verifier/10 text-verifier",
  planner: "bg-planner/10 text-planner",
};

const statusLabels = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};

export function AgentCard({
  name,
  description,
  icon: Icon,
  status,
  color,
  tasks = 0,
  className,
}: AgentCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            iconBgClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("status-dot", `status-${status}`)} />
          <span className="text-xs text-muted-foreground font-mono">
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {tasks} {tasks === 1 ? "task" : "tasks"} queued
        </span>
        <span className="text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          View →
        </span>
      </div>
    </div>
  );
}
