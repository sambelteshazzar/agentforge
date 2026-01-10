import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isTyping?: boolean;
  lastSeen: string;
}

interface CollaborationState {
  collaborators: Collaborator[];
  isConnected: boolean;
  roomId: string | null;
}

const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#6366f1"
];

const generateUserId = () => `user_${Math.random().toString(36).slice(2, 11)}`;
const generateUserName = () => `User ${Math.floor(Math.random() * 1000)}`;
const getRandomColor = () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

export const useCollaboration = (roomId: string) => {
  const [state, setState] = useState<CollaborationState>({
    collaborators: [],
    isConnected: false,
    roomId: null,
  });
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userRef = useRef({
    id: generateUserId(),
    name: generateUserName(),
    color: getRandomColor(),
  });

  const updateCursor = useCallback((x: number, y: number) => {
    if (channelRef.current) {
      channelRef.current.track({
        ...userRef.current,
        cursor: { x, y },
        lastSeen: new Date().toISOString(),
      });
    }
  }, []);

  const updateSelection = useCallback((start: number, end: number) => {
    if (channelRef.current) {
      channelRef.current.track({
        ...userRef.current,
        selection: { start, end },
        lastSeen: new Date().toISOString(),
      });
    }
  }, []);

  const updateTyping = useCallback((isTyping: boolean) => {
    if (channelRef.current) {
      channelRef.current.track({
        ...userRef.current,
        isTyping,
        lastSeen: new Date().toISOString(),
      });
    }
  }, []);

  const broadcastMessage = useCallback((type: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: type,
        payload: {
          ...payload,
          userId: userRef.current.id,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`collab:${roomId}`, {
      config: {
        presence: { key: userRef.current.id },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const collaborators: Collaborator[] = [];

        Object.entries(presenceState).forEach(([key, presences]) => {
          if (key !== userRef.current.id && presences.length > 0) {
            const presence = presences[0] as any;
            collaborators.push({
              id: key,
              name: presence.name || "Anonymous",
              avatar: presence.avatar,
              color: presence.color || getRandomColor(),
              cursor: presence.cursor,
              selection: presence.selection,
              isTyping: presence.isTyping,
              lastSeen: presence.lastSeen || new Date().toISOString(),
            });
          }
        });

        setState(prev => ({
          ...prev,
          collaborators,
        }));
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences);
      })
      .on("broadcast", { event: "code_change" }, ({ payload }) => {
        if (payload.userId !== userRef.current.id) {
          // Handle code changes from other users
          window.dispatchEvent(new CustomEvent("collab:code_change", { detail: payload }));
        }
      })
      .on("broadcast", { event: "cursor_move" }, ({ payload }) => {
        if (payload.userId !== userRef.current.id) {
          window.dispatchEvent(new CustomEvent("collab:cursor_move", { detail: payload }));
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            ...userRef.current,
            lastSeen: new Date().toISOString(),
          });
          setState(prev => ({
            ...prev,
            isConnected: true,
            roomId,
          }));
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      setState(prev => ({
        ...prev,
        isConnected: false,
        collaborators: [],
      }));
    };
  }, [roomId]);

  return {
    ...state,
    currentUser: userRef.current,
    updateCursor,
    updateSelection,
    updateTyping,
    broadcastMessage,
  };
};
