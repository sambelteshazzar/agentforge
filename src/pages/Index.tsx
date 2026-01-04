import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Code2, 
  Cpu, 
  Sparkles,
  CheckCircle2,
  Play,
  ChevronRight,
  Bot,
  Terminal,
  GitBranch,
  Layers
} from "lucide-react";
import { agentList } from "@/lib/agentConfig";
import { cn } from "@/lib/utils";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Code2,
      title: "Multi-Language Support",
      description: "Python, JavaScript, TypeScript, Go, Rust, and 15+ programming languages with specialized agents."
    },
    {
      icon: Shield,
      title: "Verified Outputs",
      description: "Automated verification loops ensure production-ready code with built-in quality checks."
    },
    {
      icon: Zap,
      title: "Blazing Fast",
      description: "Parallel agent execution delivers results in seconds, not minutes."
    },
    {
      icon: GitBranch,
      title: "Smart Orchestration",
      description: "Intelligent task routing assigns the right agent for each job automatically."
    }
  ];

  const stats = [
    { value: "20+", label: "Specialized Agents" },
    { value: "99.9%", label: "Uptime" },
    { value: "50ms", label: "Avg Response" },
    { value: "10K+", label: "Tasks Completed" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none opacity-60"
        style={{ background: "radial-gradient(ellipse at center, hsl(185 70% 50% / 0.12) 0%, transparent 60%)" }}
      />
      <div 
        className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-40"
        style={{ background: "radial-gradient(ellipse at center, hsl(280 70% 50% / 0.1) 0%, transparent 60%)" }}
      />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">AgentForge</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Agents</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            </div>

            <div className="flex items-center gap-3">
              {!loading && !user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button variant="glow" onClick={() => navigate("/auth")}>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <Button variant="glow" onClick={() => navigate("/agent/python")}>
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Powered by Advanced AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Build Faster with
              <br />
              <span className="gradient-text">AI-Powered Agents</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Orchestrate specialized AI agents for code generation, testing, and deployment. 
              Get production-ready outputs through automated verification loops.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button 
                size="lg" 
                variant="glow" 
                className="text-lg px-8 py-6"
                onClick={() => navigate(user ? "/agent/python" : "/auth")}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Building Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
              >
                Watch Demo
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass-card p-8 rounded-2xl border border-border/50 glow-effect">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs font-mono text-muted-foreground">AgentForge Terminal</span>
                </div>
              </div>
              <div className="font-mono text-sm space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary">$</span>
                  <span className="text-foreground">agentforge run "Create a REST API with authentication"</span>
                </div>
                <div className="pl-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary animate-pulse" />
                    <span>Analyzing task requirements...</span>
                  </div>
                </div>
                <div className="pl-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Assigned to: Python Agent, DevOps Agent</span>
                  </div>
                </div>
                <div className="pl-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Generated 12 files with full test coverage</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <span className="text-success">✓</span>
                  <span className="text-success">Task completed in 3.2 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <br />
              <span className="gradient-text">Ship Faster</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built features that help development teams move faster without sacrificing quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Meet Your
              <br />
              <span className="gradient-text">AI Agents</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized agents trained for specific programming languages and tasks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agentList.slice(0, 8).map((agent) => (
              <button
                key={agent.id}
                onClick={() => navigate(`/agent/${agent.id}`)}
                className={cn(
                  "glass-card p-5 rounded-xl text-left hover:border-primary/30 transition-all duration-300 group",
                  agent.status === "active" && "hover:glow-effect"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `hsl(var(--${agent.id}) / 0.15)` }}
                  >
                    <agent.icon className="w-5 h-5" style={{ color: `hsl(var(--${agent.id}))` }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        agent.status === "active" ? "bg-success" : "bg-muted-foreground"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
              </button>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate("/agent/python")}>
              View All {agentList.length} Agents
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It
              <br />
              <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                Icon: Terminal,
                title: "Describe Your Task",
                description: "Tell the agent what you want to build in plain English. No complex syntax required."
              },
              {
                step: "02",
                Icon: Layers,
                title: "AI Orchestration",
                description: "Our system automatically routes your task to the best-suited specialized agents."
              },
              {
                step: "03",
                Icon: CheckCircle2,
                title: "Verified Output",
                description: "Get production-ready code that's been automatically tested and verified."
              }
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="glass-card p-8 rounded-xl text-center relative z-10">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="glass-card p-12 md:p-16 rounded-2xl text-center glow-effect relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at center, hsl(185 70% 50% / 0.2) 0%, transparent 70%)" }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Build with AI?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of developers shipping faster with AgentForge. Start building for free today.
              </p>
              <Button 
                size="lg" 
                variant="glow" 
                className="text-lg px-10 py-6"
                onClick={() => navigate(user ? "/agent/python" : "/auth")}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AgentForge</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with specialized AI agents for developers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
