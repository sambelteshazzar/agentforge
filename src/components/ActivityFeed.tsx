import { CheckCircle2, AlertCircle, Clock, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "success" | "error" | "pending" | "info";
  message: string;
  agent: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "success",
    message: "Python API endpoints generated successfully",
    agent: "Python Agent",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "pending",
    message: "Running integration tests...",
    agent: "Verifier Agent",
    time: "5 min ago",
  },
  {
    id: "3",
    type: "info",
    message: "Frontend components created",
    agent: "JavaScript Agent",
    time: "8 min ago",
  },
  {
    id: "4",
    type: "success",
    message: "Docker configuration completed",
    agent: "DevOps Agent",
    time: "12 min ago",
  },
  {
    id: "5",
    type: "error",
    message: "Test failure: auth module - fixing...",
    agent: "Verifier Agent",
    time: "15 min ago",
  },
];

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  pending: Clock,
  info: Code2,
};

const colorMap = {
  success: "text-success",
  error: "text-destructive",
  pending: "text-warning",
  info: "text-primary",
};

export function ActivityFeed() {
  return (
    <div className="glass-card p-6 h-full">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("mt-0.5", colorMap[activity.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {activity.agent}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
