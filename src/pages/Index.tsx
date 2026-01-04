import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { AgentCard } from "@/components/AgentCard";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { TaskCreator } from "@/components/TaskCreator";
import { ActivityFeed } from "@/components/ActivityFeed";
import { agentList } from "@/lib/agentConfig";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none" />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      
      <Header 
        user={user} 
        onSignIn={() => navigate("/auth")} 
        onSignOut={handleSignOut} 
      />
      
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
          {!loading && !user && (
            <Button 
              variant="glow" 
              className="mt-6"
              onClick={() => navigate("/auth")}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to start building
            </Button>
          )}
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
                {agentList.filter(a => a.status === "active").length}/{agentList.length} active
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentList.map((agent) => (
                <AgentCard key={agent.id} {...agent} />
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
            ].map((phase) => (
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
