-- Add missing DELETE policy for agent_configurations
CREATE POLICY "Users can delete their own agent configurations"
ON public.agent_configurations
FOR DELETE
USING (auth.uid() = user_id);

-- Add missing UPDATE policy for chat_messages
CREATE POLICY "Users can update their own chat messages"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Add missing DELETE policy for chat_messages
CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Add missing UPDATE policy for favorite_agents
CREATE POLICY "Users can update their own favorites"
ON public.favorite_agents
FOR UPDATE
USING (auth.uid() = user_id);