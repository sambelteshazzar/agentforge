import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  agent_type: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string | null;
  role: string;
  content: string;
  agent_type: string;
  created_at: string;
}

export function useConversations(agentType?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [agentType]);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (agentType) {
        query = query.eq("agent_type", agentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (agentType: string, title?: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          agent_type: agentType,
          title: title || `New conversation`,
        })
        .select()
        .single();

      if (error) throw error;
      setConversations(prev => [data, ...prev]);
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  };

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      await supabase
        .from("conversations")
        .update({ title })
        .eq("id", id);

      setConversations(prev => 
        prev.map(c => c.id === id ? { ...c, title } : c)
      );
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await supabase.from("conversations").delete().eq("id", id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const loadMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  };

  const saveMessage = async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    agentType: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("chat_messages").insert({
        user_id: user.id,
        conversation_id: conversationId,
        role,
        content,
        agent_type: agentType,
      });

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    loadMessages,
    saveMessage,
    refresh: loadConversations,
  };
}
