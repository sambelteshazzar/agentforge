-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  agent_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for agent conversations
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_configurations table
CREATE TABLE public.agent_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_type)
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for agent_configurations
CREATE POLICY "Users can view their own configs" ON public.agent_configurations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own configs" ON public.agent_configurations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs" ON public.agent_configurations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_configurations_updated_at
  BEFORE UPDATE ON public.agent_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();