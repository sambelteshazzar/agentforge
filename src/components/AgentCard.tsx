import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AgentCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "idle" | "error";
  color: "python" | "javascript" | "devops" | "verifier" | "planner" | "cpp" | "golang" | "bash" | "java" | "rust" | "ruby" | "typescript" | "swift";
  tasks?: number;
  className?: string;
}

const colorClasses = {
  python: "border-python/30 hover:border-python/60",
  javascript: "border-javascript/30 hover:border-javascript/60",
  devops: "border-devops/30 hover:border-devops/60",
  verifier: "border-verifier/30 hover:border-verifier/60",
  planner: "border-planner/30 hover:border-planner/60",
  cpp: "border-cpp/30 hover:border-cpp/60",
  golang: "border-golang/30 hover:border-golang/60",
  bash: "border-bash/30 hover:border-bash/60",
  java: "border-java/30 hover:border-java/60",
  rust: "border-rust/30 hover:border-rust/60",
  ruby: "border-ruby/30 hover:border-ruby/60",
  typescript: "border-typescript/30 hover:border-typescript/60",
  swift: "border-swift/30 hover:border-swift/60",
};

const iconBgClasses = {
  python: "bg-python/10 text-python",
  javascript: "bg-javascript/10 text-javascript",
  devops: "bg-devops/10 text-devops",
  verifier: "bg-verifier/10 text-verifier",
  planner: "bg-planner/10 text-planner",
  cpp: "bg-cpp/10 text-cpp",
  golang: "bg-golang/10 text-golang",
  bash: "bg-bash/10 text-bash",
  java: "bg-java/10 text-java",
  rust: "bg-rust/10 text-rust",
  ruby: "bg-ruby/10 text-ruby",
  typescript: "bg-typescript/10 text-typescript",
  swift: "bg-swift/10 text-swift",
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
