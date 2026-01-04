import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { AgentCard } from "@/components/AgentCard";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { TaskCreator } from "@/components/TaskCreator";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Code2, FileCode, Container, CheckCircle2, Brain, Cpu, Gem, Terminal, Coffee, Cog, Blocks, FileType, Zap, Smartphone, Globe, FlaskConical, Sparkles, Sigma, Hash, Feather, Moon, Bird, BarChart3, Database } from "lucide-react";

const agents = [
  {
    name: "Python Agent",
    description: "Backend services, ML prototypes, API endpoints, and data processing scripts.",
    icon: Code2,
    status: "active" as const,
    color: "python" as const,
    tasks: 3,
  },
  {
    name: "JavaScript Agent",
    description: "Frontend components, Node.js services, React UI, and real-time features.",
    icon: FileCode,
    status: "active" as const,
    color: "javascript" as const,
    tasks: 2,
  },
  {
    name: "TypeScript Agent",
    description: "Type-safe applications, enterprise-grade APIs, and strongly-typed libraries.",
    icon: FileType,
    status: "active" as const,
    color: "typescript" as const,
    tasks: 4,
  },
  {
    name: "Go Agent",
    description: "High-performance services, microservices, CLI tools, and concurrent systems.",
    icon: Zap,
    status: "active" as const,
    color: "golang" as const,
    tasks: 2,
  },
  {
    name: "Rust Agent",
    description: "Systems programming, memory-safe code, WebAssembly, and performance-critical apps.",
    icon: Cog,
    status: "idle" as const,
    color: "rust" as const,
    tasks: 1,
  },
  {
    name: "C++ Agent",
    description: "Game engines, embedded systems, high-performance computing, and native apps.",
    icon: Cpu,
    status: "active" as const,
    color: "cpp" as const,
    tasks: 2,
  },
  {
    name: "Java Agent",
    description: "Enterprise applications, Android apps, Spring services, and distributed systems.",
    icon: Coffee,
    status: "idle" as const,
    color: "java" as const,
    tasks: 0,
  },
  {
    name: "Bash Agent",
    description: "Shell scripts, automation tasks, system administration, and deployment scripts.",
    icon: Terminal,
    status: "active" as const,
    color: "bash" as const,
    tasks: 3,
  },
  {
    name: "Ruby Agent",
    description: "Rails applications, automation scripts, DSLs, and rapid prototyping.",
    icon: Gem,
    status: "idle" as const,
    color: "ruby" as const,
    tasks: 0,
  },
  {
    name: "Swift Agent",
    description: "iOS/macOS apps, server-side Swift, and Apple ecosystem development.",
    icon: Blocks,
    status: "idle" as const,
    color: "swift" as const,
    tasks: 1,
  },
  {
    name: "Kotlin Agent",
    description: "Android development, multiplatform apps, and JVM-based services.",
    icon: Smartphone,
    status: "active" as const,
    color: "kotlin" as const,
    tasks: 2,
  },
  {
    name: "PHP Agent",
    description: "Web applications, Laravel/Symfony backends, and WordPress plugins.",
    icon: Globe,
    status: "idle" as const,
    color: "php" as const,
    tasks: 0,
  },
  {
    name: "Scala Agent",
    description: "Functional programming, Spark applications, and distributed systems.",
    icon: FlaskConical,
    status: "idle" as const,
    color: "scala" as const,
    tasks: 1,
  },
  {
    name: "Elixir Agent",
    description: "Real-time systems, Phoenix web apps, and fault-tolerant services.",
    icon: Sparkles,
    status: "active" as const,
    color: "elixir" as const,
    tasks: 2,
  },
  {
    name: "Haskell Agent",
    description: "Pure functional code, type-safe systems, and compiler development.",
    icon: Sigma,
    status: "idle" as const,
    color: "haskell" as const,
    tasks: 0,
  },
  {
    name: "C# Agent",
    description: ".NET applications, Unity games, and Windows desktop software.",
    icon: Hash,
    status: "active" as const,
    color: "csharp" as const,
    tasks: 3,
  },
  {
    name: "Dart Agent",
    description: "Flutter mobile apps, cross-platform UI, and web applications.",
    icon: Feather,
    status: "active" as const,
    color: "dart" as const,
    tasks: 4,
  },
  {
    name: "Lua Agent",
    description: "Game scripting, embedded systems, and configuration scripts.",
    icon: Moon,
    status: "idle" as const,
    color: "lua" as const,
    tasks: 0,
  },
  {
    name: "Perl Agent",
    description: "Text processing, system administration, and legacy integrations.",
    icon: Bird,
    status: "idle" as const,
    color: "perl" as const,
    tasks: 0,
  },
  {
    name: "R Agent",
    description: "Statistical computing, data analysis, and visualization scripts.",
    icon: BarChart3,
    status: "idle" as const,
    color: "rlang" as const,
    tasks: 1,
  },
  {
    name: "SQL Agent",
    description: "Database schemas, queries, migrations, and stored procedures.",
    icon: Database,
    status: "active" as const,
    color: "sql" as const,
    tasks: 2,
  },
  {
    name: "DevOps Agent",
    description: "CI/CD pipelines, Docker configs, infrastructure manifests, and deployments.",
    icon: Container,
    status: "active" as const,
    color: "devops" as const,
    tasks: 2,
  },
  {
    name: "Verifier Agent",
    description: "Automated testing, code validation, security scanning, and quality checks.",
    icon: CheckCircle2,
    status: "active" as const,
    color: "verifier" as const,
    tasks: 5,
  },
  {
    name: "Planner Agent",
    description: "Task orchestration, dependency resolution, resource allocation, and scheduling.",
    icon: Brain,
    status: "active" as const,
    color: "planner" as const,
    tasks: 1,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none" />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      
      <Header />
      
      <main className="container mx-auto px-6 py-8 relative">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Multi-Agent</span> Developer Assistant
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Orchestrate specialized agents for code generation, testing, and deployment. 
            Production-ready outputs through automated verification loops.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <StatsBar />
        </div>

        {/* Pipeline */}
        <div className="mb-8">
          <PipelineVisualization />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Task Creator */}
          <div className="lg:col-span-2">
            <TaskCreator />
          </div>
          
          {/* Activity Feed */}
          <div className="lg:row-span-2">
            <ActivityFeed />
          </div>

          {/* Agent Cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Language Agents</h3>
              <span className="text-sm text-muted-foreground font-mono">
                {agents.filter(a => a.status === "active").length}/{agents.length} active
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard key={agent.name} {...agent} />
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap Preview */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Development Roadmap</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { week: "Week 1-2", title: "MVP Design", status: "done" },
              { week: "Week 3-6", title: "Two-Agent Prototype", status: "active" },
              { week: "Week 7-10", title: "Verifier & Repair Loop", status: "upcoming" },
              { week: "Week 11-16", title: "Integration & Hardening", status: "upcoming" },
            ].map((phase, index) => (
              <div
                key={phase.week}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  phase.status === "done"
                    ? "bg-success/10 border-success/30"
                    : phase.status === "active"
                    ? "bg-primary/10 border-primary/30 animate-pulse"
                    : "bg-secondary/50 border-border/50"
                }`}
              >
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  {phase.week}
                </div>
                <div className="font-medium">{phase.title}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {phase.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-mono">Multi-Agent Developer Assistant</span>
            <span>Built with specialized AI agents</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
