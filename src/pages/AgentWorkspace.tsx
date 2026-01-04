import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, User, Bot, Copy, Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { agentConfig } from "@/lib/agentConfig";
import { AgentSettingsDialog, AgentSettings } from "@/components/AgentSettingsDialog";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AgentWorkspace = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agentId ? agentConfig[agentId] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (agentId) {
      loadAgentSettings();
    }
  }, [agentId]);

  const loadAgentSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("agent_configurations")
        .select("settings")
        .eq("user_id", user.id)
        .eq("agent_type", agentId)
        .maybeSingle();

      if (data?.settings) {
        setAgentSettings(data.settings as AgentSettings);
      }
    } catch (error) {
      console.error("Error loading agent settings:", error);
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent not found</h1>
          <Button onClick={() => navigate("/")}>Go back</Button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            agentType: agentId,
            settings: agentSettings,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === "assistant") {
                  lastMessage.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
      });
      setMessages((prev) => {
        if (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: { type: "text" | "code"; content: string; language?: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", content: match[2], language: match[1] || "plaintext" });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: "text" as const, content }];
  };

  const Icon = agent.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none" />
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", agent.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold">{agent.name}</h1>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <div className="flex items-center gap-2">
              <span className={cn("status-dot", agent.status === "active" ? "status-active" : "status-idle")} />
              <span className="text-xs text-muted-foreground font-mono capitalize">{agent.status}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Settings indicator */}
      {agentSettings && (
        <div className="bg-primary/5 border-b border-primary/20 px-6 py-2">
          <div className="container mx-auto flex items-center gap-2 text-xs text-primary">
            <Settings className="w-3 h-3" />
            <span>Custom settings applied: {agentSettings.codingStyle} style, {agentSettings.outputFormat} output</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6", agent.iconBg)}>
                <Icon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Start a conversation with {agent.name}</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Describe your project or task, and I'll help you generate code, tests, and documentation.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettingsOpen(true)}
                className="mb-6"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize Agent Settings
              </Button>
              <div className="flex flex-wrap gap-2 justify-center">
                {agent.suggestions?.map((suggestion, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", agent.iconBg)}>
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-card"
                )}
              >
                {message.role === "assistant" ? (
                  <div className="space-y-3">
                    {extractCodeBlocks(message.content).map((part, partIndex) => (
                      part.type === "code" ? (
                        <div key={partIndex} className="relative group">
                          <div className="flex items-center justify-between bg-secondary/80 px-3 py-1.5 rounded-t-lg border-b border-border/50">
                            <span className="text-xs font-mono text-muted-foreground">{part.language}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(part.content, index * 100 + partIndex)}
                            >
                              {copiedIndex === index * 100 + partIndex ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-secondary/50 p-4 rounded-b-lg overflow-x-auto">
                            <code className="text-sm font-mono">{part.content}</code>
                          </pre>
                        </div>
                      ) : (
                        <p key={partIndex} className="text-sm whitespace-pre-wrap">{part.content}</p>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", agent.iconBg)}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4 relative">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${agent.name} anything...`}
            className="min-h-[60px] max-h-[200px] resize-none bg-secondary/50 border-border/50"
            disabled={isLoading}
          />
          <Button
            variant="glow"
            size="icon"
            className="h-[60px] w-[60px]"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <AgentSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        agent={agent}
        onSettingsSaved={(settings) => setAgentSettings(settings)}
      />
    </div>
  );
};

export default AgentWorkspace;
