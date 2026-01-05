import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFavoriteAgents() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorite_agents")
        .select("agent_type")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.agent_type) || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (agentType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favorites.includes(agentType);

      if (isFavorite) {
        await supabase
          .from("favorite_agents")
          .delete()
          .eq("user_id", user.id)
          .eq("agent_type", agentType);
        
        setFavorites(prev => prev.filter(f => f !== agentType));
      } else {
        await supabase
          .from("favorite_agents")
          .insert({ user_id: user.id, agent_type: agentType });
        
        setFavorites(prev => [...prev, agentType]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const isFavorite = (agentType: string) => favorites.includes(agentType);

  return { favorites, loading, toggleFavorite, isFavorite };
}
