import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  agent_types: string[];
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export function usePromptTemplates(agentType?: string) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [agentType]);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter by agent type if provided
      let filtered = data || [];
      if (agentType) {
        filtered = filtered.filter(t => 
          t.is_global || t.agent_types.length === 0 || t.agent_types.includes(agentType)
        );
      }

      setTemplates(filtered);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (
    title: string,
    content: string,
    agentTypes: string[] = [],
    isGlobal: boolean = false
  ): Promise<PromptTemplate | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("prompt_templates")
        .insert({
          user_id: user.id,
          title,
          content,
          agent_types: agentTypes,
          is_global: isGlobal,
        })
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error creating template:", error);
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<Pick<PromptTemplate, 'title' | 'content' | 'agent_types' | 'is_global'>>
  ) => {
    try {
      const { error } = await supabase
        .from("prompt_templates")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setTemplates(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await supabase.from("prompt_templates").delete().eq("id", id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: loadTemplates,
  };
}
