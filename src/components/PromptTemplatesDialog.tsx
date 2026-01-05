import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Plus, MoreVertical, Trash2, Edit2, Copy, Check } from "lucide-react";
import { PromptTemplate } from "@/hooks/usePromptTemplates";
import { cn } from "@/lib/utils";

interface PromptTemplatesDialogProps {
  templates: PromptTemplate[];
  currentAgentType?: string;
  onSelect: (content: string) => void;
  onCreate: (title: string, content: string, agentTypes: string[], isGlobal: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<PromptTemplate, 'title' | 'content' | 'is_global'>>) => void;
  onDelete: (id: string) => void;
}

export function PromptTemplatesDialog({
  templates,
  currentAgentType,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: PromptTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      onCreate(
        title.trim(),
        content.trim(),
        isGlobal ? [] : currentAgentType ? [currentAgentType] : [],
        isGlobal
      );
      setTitle("");
      setContent("");
      setIsGlobal(true);
      setCreateOpen(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingTemplate && title.trim() && content.trim()) {
      onUpdate(editingTemplate.id, {
        title: title.trim(),
        content: content.trim(),
        is_global: isGlobal,
      });
      setEditingTemplate(null);
      setTitle("");
      setContent("");
    }
  };

  const handleStartEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setContent(template.content);
    setIsGlobal(template.is_global);
    setCreateOpen(true);
  };

  const handleUse = (template: PromptTemplate) => {
    onSelect(template.content);
    setOpen(false);
  };

  const handleCopy = async (template: PromptTemplate) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prompt Templates</DialogTitle>
          <DialogDescription>
            Save and reuse your favorite prompts across conversations
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Dialog open={createOpen} onOpenChange={(o) => {
            setCreateOpen(o);
            if (!o) {
              setEditingTemplate(null);
              setTitle("");
              setContent("");
              setIsGlobal(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-title">Title</Label>
                  <Input
                    id="template-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Code Review Request"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-content">Prompt Content</Label>
                  <Textarea
                    id="template-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your prompt template..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="global-toggle">Available for all agents</Label>
                    <p className="text-xs text-muted-foreground">
                      {isGlobal 
                        ? "This template will appear for all agents" 
                        : currentAgentType 
                          ? `Only available for the current agent`
                          : "Only for specific agents"
                      }
                    </p>
                  </div>
                  <Switch
                    id="global-toggle"
                    checked={isGlobal}
                    onCheckedChange={setIsGlobal}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingTemplate ? handleSaveEdit : handleCreate}>
                  {editingTemplate ? "Save Changes" : "Create Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No templates yet</p>
              <p className="text-sm">Create your first template to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{template.title}</h4>
                        {template.is_global && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUse(template)}
                      >
                        Use
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopy(template)}
                      >
                        {copiedId === template.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEdit(template)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
