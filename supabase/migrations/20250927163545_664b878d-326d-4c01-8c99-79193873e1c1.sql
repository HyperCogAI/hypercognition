-- Create user_favorites table for favorites functionality
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user favorites
CREATE POLICY "Users can manage their own favorites"
ON public.user_favorites
FOR ALL
USING (auth.uid() = user_id);

-- Create user_community_memberships table for community functionality  
CREATE TABLE IF NOT EXISTS public.user_community_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(user_id, community_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_community_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for community memberships
CREATE POLICY "Users can manage their own community memberships"
ON public.user_community_memberships  
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_agent_id ON public.user_favorites(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_community_memberships_user_id ON public.user_community_memberships(user_id);