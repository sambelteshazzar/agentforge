import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Search, 
  LogOut, 
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  Settings,
  Command
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { agentList } from "@/lib/agentConfig";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const filteredAgents = agentList.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAgents = agentList.filter(a => a.status === "active").length;
  const totalAgents = agentList.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">AgentForge</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex gap-2 text-muted-foreground"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                  document.dispatchEvent(event);
                }}
              >
                <Command className="w-3 h-3" />
                <span className="text-xs">⌘K</span>
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.email?.split('@')[0]}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">
            Select an AI agent to start building
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAgents}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAgents}</p>
                <p className="text-sm text-muted-foreground">Active Agents</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAgents - activeAgents}</p>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/30 border-secondary/50"
            />
          </div>
        </motion.div>

        {/* Agents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent, index) => (
              <motion.button
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(`/agent/${agent.id}`)}
                disabled={agent.status !== "active"}
                className={cn(
                  "glass-card p-5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden",
                  agent.status === "active" 
                    ? "hover:border-primary/30 hover:glow-effect cursor-pointer" 
                    : "opacity-60 cursor-not-allowed"
                )}
              >
                {agent.status === "active" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `hsl(var(--primary) / 0.1)` }}
                  >
                    <agent.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        agent.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {agent.description}
                </p>

                {agent.status === "active" && (
                  <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open Agent</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No agents found matching "{searchQuery}"
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
