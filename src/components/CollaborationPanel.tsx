import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Users, Link2, Copy, Check, Radio, MessageCircle, 
  Pencil, Eye, Crown, Wifi, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Collaborator } from "@/hooks/useCollaboration";

interface CollaborationPanelProps {
  roomId: string;
  collaborators: Collaborator[];
  isConnected: boolean;
  currentUser: { id: string; name: string; color: string };
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => string;
}

export const CollaborationPanel = ({
  roomId,
  collaborators,
  isConnected,
  currentUser,
  onJoinRoom,
  onCreateRoom,
}: CollaborationPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");

  const copyRoomLink = async () => {
    const link = `${window.location.origin}?room=${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Room link copied!");
  };

  const handleCreateRoom = () => {
    const newRoomId = onCreateRoom();
    toast.success(`Room created: ${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      onJoinRoom(joinRoomId.trim());
      setJoinRoomId("");
      toast.success(`Joined room: ${joinRoomId}`);
    }
  };

  const totalUsers = collaborators.length + 1; // +1 for current user

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-2 relative",
            isConnected && "border-green-500/50"
          )}
        >
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{totalUsers}</span>
          {collaborators.some(c => c.isTyping) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Radio className={cn(
                "w-3 h-3",
                isConnected ? "text-green-500 animate-pulse" : "text-muted-foreground"
              )} />
              Real-time Collaboration
            </h4>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          
          {roomId ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-2 py-1.5 bg-muted rounded text-xs font-mono truncate">
                {roomId}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={copyRoomLink}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={handleCreateRoom}
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                Create New Room
              </Button>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter room ID..."
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                >
                  Join
                </Button>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="h-64">
          <div className="p-3 space-y-2">
            {/* Current user */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
              <Avatar className="h-8 w-8 border-2" style={{ borderColor: currentUser.color }}>
                <AvatarFallback 
                  className="text-xs font-medium"
                  style={{ backgroundColor: currentUser.color + "20", color: currentUser.color }}
                >
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{currentUser.name}</span>
                  <Crown className="w-3 h-3 text-amber-500" />
                  <Badge variant="outline" className="text-[10px]">You</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">Online now</span>
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentUser.color }}
              />
            </div>

            {/* Collaborators */}
            {collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 border-2" style={{ borderColor: collaborator.color }}>
                    <AvatarFallback 
                      className="text-xs font-medium"
                      style={{ backgroundColor: collaborator.color + "20", color: collaborator.color }}
                    >
                      {collaborator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{collaborator.name}</span>
                      {collaborator.isTyping && (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Pencil className="w-2.5 h-2.5" />
                          Typing
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {collaborator.cursor ? (
                        <span className="flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" />
                          Viewing prototype
                        </span>
                      ) : (
                        "Online"
                      )}
                    </span>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: collaborator.color }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No other collaborators yet</p>
                <p className="text-[10px]">Share the room link to invite others</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {collaborators.length > 0 && (
          <div className="p-2 border-t border-border bg-muted/30">
            <Button variant="ghost" size="sm" className="w-full h-7 text-xs gap-1.5">
              <MessageCircle className="w-3 h-3" />
              Open Chat
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
