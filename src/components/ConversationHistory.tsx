import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, Plus, MoreVertical, Trash2, Edit2, MessageSquare } from "lucide-react";
import { Conversation } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onSelect,
  onNew,
  onDelete,
  onRename,
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title || "");
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Conversation History</SheetTitle>
          <SheetDescription>
            Your previous conversations with this agent
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <Button onClick={onNew} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-2 pr-4">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet
                </p>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                      conversation.id === currentConversationId
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => onSelect(conversation.id)}
                    >
                      {editingId === conversation.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">
                            {conversation.title || "Untitled"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </p>
                        </>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(conversation)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(conversation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
