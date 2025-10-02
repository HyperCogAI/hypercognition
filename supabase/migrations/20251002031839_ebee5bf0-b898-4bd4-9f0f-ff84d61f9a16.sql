-- Add new columns to agents table for creation workflow
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS initial_supply numeric DEFAULT 1000000,
ADD COLUMN IF NOT EXISTS initial_price numeric DEFAULT 0.001,
ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_creator_id ON public.agents(creator_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);

-- Update RLS policies for agent creation
DROP POLICY IF EXISTS "Agents are viewable by everyone" ON public.agents;

-- Allow everyone to view active agents
CREATE POLICY "Active agents are viewable by everyone"
ON public.agents
FOR SELECT
USING (status = 'active' OR creator_id = auth.uid());

-- Allow authenticated users to create agents via service role
-- (Will be handled by edge function with proper validation)

-- Create agent_creation_requests table for tracking
CREATE TABLE IF NOT EXISTS public.agent_creation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id),
  agent_data jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  agent_id uuid REFERENCES public.agents(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.agent_creation_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own creation requests
CREATE POLICY "Users can view their own creation requests"
ON public.agent_creation_requests
FOR SELECT
USING (auth.uid() = creator_id);

-- System can create requests
CREATE POLICY "System can create creation requests"
ON public.agent_creation_requests
FOR INSERT
WITH CHECK (true);

-- Create function to validate agent data
CREATE OR REPLACE FUNCTION public.validate_agent_creation(
  agent_name text,
  agent_symbol text,
  agent_description text,
  agent_category text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  errors text[] := '{}';
BEGIN
  -- Validate name
  IF agent_name IS NULL OR trim(agent_name) = '' THEN
    errors := array_append(errors, 'Agent name is required');
  ELSIF length(agent_name) < 3 THEN
    errors := array_append(errors, 'Agent name must be at least 3 characters');
  ELSIF length(agent_name) > 50 THEN
    errors := array_append(errors, 'Agent name must be less than 50 characters');
  END IF;
  
  -- Validate symbol
  IF agent_symbol IS NULL OR trim(agent_symbol) = '' THEN
    errors := array_append(errors, 'Agent symbol is required');
  ELSIF length(agent_symbol) < 2 THEN
    errors := array_append(errors, 'Agent symbol must be at least 2 characters');
  ELSIF length(agent_symbol) > 10 THEN
    errors := array_append(errors, 'Agent symbol must be less than 10 characters');
  ELSIF agent_symbol !~ '^[A-Z0-9]+$' THEN
    errors := array_append(errors, 'Agent symbol must contain only uppercase letters and numbers');
  END IF;
  
  -- Check if symbol already exists
  IF EXISTS (SELECT 1 FROM public.agents WHERE symbol = agent_symbol) THEN
    errors := array_append(errors, 'Agent symbol already exists');
  END IF;
  
  -- Validate description
  IF agent_description IS NULL OR trim(agent_description) = '' THEN
    errors := array_append(errors, 'Agent description is required');
  ELSIF length(agent_description) < 20 THEN
    errors := array_append(errors, 'Agent description must be at least 20 characters');
  ELSIF length(agent_description) > 500 THEN
    errors := array_append(errors, 'Agent description must be less than 500 characters');
  END IF;
  
  -- Validate category
  IF agent_category IS NULL OR trim(agent_category) = '' THEN
    errors := array_append(errors, 'Agent category is required');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors
  );
END;
$$;