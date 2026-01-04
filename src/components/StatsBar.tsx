import { Activity, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "Tasks Completed",
    value: "127",
    change: "+12 today",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    label: "Active Agents",
    value: "4/5",
    change: "1 idle",
    icon: Activity,
    color: "text-primary",
  },
  {
    label: "Avg. Response",
    value: "2.4s",
    change: "-0.3s",
    icon: Clock,
    color: "text-warning",
  },
  {
    label: "Error Rate",
    value: "0.8%",
    change: "↓ 0.2%",
    icon: AlertTriangle,
    color: "text-destructive",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-xs text-muted-foreground font-mono">
              {stat.change}
            </span>
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
