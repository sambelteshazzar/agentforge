import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send } from "lucide-react";

export function TaskCreator() {
  const [task, setTask] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = () => {
    if (!task.trim()) return;
    setIsGenerating(true);
    // Simulate task submission
    setTimeout(() => {
      setIsGenerating(false);
      setTask("");
    }, 2000);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Create New Task</h3>
      </div>
      
      <div className="space-y-4">
        <Textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe your task... e.g., 'Create a REST API with Python backend and React frontend with authentication'"
          className="min-h-[120px] bg-secondary/50 border-border/50 resize-none focus:border-primary/50"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Python + JS
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Full Stack
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              API Only
            </Button>
          </div>
          
          <Button
            variant="glow"
            onClick={handleSubmit}
            disabled={!task.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-pulse">Generating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Task
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
