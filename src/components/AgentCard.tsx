import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AgentInfo } from "@/lib/agentConfig";

interface AgentCardProps extends AgentInfo {
  className?: string;
}

const statusLabels = {
  active: "Active",
  idle: "Idle",
  error: "Error",
};

export function AgentCard({
  id,
  name,
  description,
  icon: Icon,
  iconBg,
  borderColor,
  status,
  tasks = 0,
  className,
}: AgentCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/agent/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "glass-card p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
        borderColor,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            iconBg
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
          Open →
        </span>
      </div>
    </div>
  );
}
