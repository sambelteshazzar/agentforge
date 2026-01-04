import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, Mail, Lock, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
            });
          } else {
            throw error;
          }
          return;
        }
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: "This email is already registered. Please log in instead.",
            });
            setIsLogin(true);
          } else {
            throw error;
          }
          return;
        }
        toast({
          title: "Account created!",
          description: "You can now start using the multi-agent system.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      {/* Floating orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 70%)",
          filter: "blur(40px)"
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect behind card */}
        <div 
          className="absolute -inset-1 rounded-2xl opacity-50 blur-xl"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.2))" }}
        />
        
        <div className="glass-card p-8 relative backdrop-blur-xl border border-primary/10">
          {/* Header */}
          <motion.div 
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div 
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Terminal className="w-7 h-7 text-primary" />
            </motion.div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Multi-Agent Dev
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-muted-foreground"
                >
                  {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <motion.div
                  className="absolute -inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))" }}
                  animate={focusedField === "email" ? { opacity: 1 } : {}}
                />
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 bg-secondary/30 border-secondary/50 focus:border-primary/50 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-destructive"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative group">
                <motion.div
                  className="absolute -inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))" }}
                  animate={focusedField === "password" ? { opacity: 1 } : {}}
                />
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="pl-10 bg-secondary/30 border-secondary/50 focus:border-primary/50 transition-all duration-300"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-destructive"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Button
                type="submit"
                variant="glow"
                className="w-full h-12 text-base font-medium relative overflow-hidden group"
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0"
                  initial={{ x: "-100%" }}
                  animate={isLoading ? {} : { x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "linear",
                    repeatDelay: 1
                  }}
                />
                <span className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isLogin ? "Sign In" : "Create Account"}
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div 
            className="relative my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </motion.div>

          {/* Toggle Login/Signup */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
              disabled={isLoading}
            >
              <span className="relative">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span className="text-primary font-medium">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </span>
              <motion.div
                className="absolute -bottom-0.5 left-0 right-0 h-px bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/50"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-accent/50"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
