-- Add missing critical RLS policies for agents table creator management

-- Policy: Creators can update their own pending/draft agents
CREATE POLICY "Creators can update their own agents"
ON public.agents
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Policy: Creators can view creation status
CREATE POLICY "Creators can view all their agents"
ON public.agents
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Add check constraint on status to ensure valid values
ALTER TABLE public.agents 
  DROP CONSTRAINT IF EXISTS agents_status_check;

ALTER TABLE public.agents 
  ADD CONSTRAINT agents_status_check 
  CHECK (status IN ('pending', 'active', 'rejected', 'suspended'));

-- Add index for faster status filtering
CREATE INDEX IF NOT EXISTS agents_status_idx ON public.agents (status);

-- Add index for creator's agents lookup
CREATE INDEX IF NOT EXISTS agents_creator_status_idx 
  ON public.agents (creator_id, status, created_at DESC);

-- Enhanced policy for agent_creation_requests
DROP POLICY IF EXISTS "Users can view their own creation requests" ON public.agent_creation_requests;

CREATE POLICY "Users can view their creation requests with full access"
ON public.agent_creation_requests
FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Allow users to cancel their pending requests
CREATE POLICY "Users can update their pending requests"
ON public.agent_creation_requests
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid() AND status = 'pending')
WITH CHECK (creator_id = auth.uid() AND status IN ('pending', 'cancelled'));

-- Create function to check agent ownership
CREATE OR REPLACE FUNCTION public.is_agent_creator(agent_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents
    WHERE id = agent_id_param
    AND creator_id = auth.uid()
  );
$$;

-- Create function to get user's agent creation count (for rate limiting check)
CREATE OR REPLACE FUNCTION public.get_user_agent_count_today()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.agents
  WHERE creator_id = auth.uid()
  AND created_at >= CURRENT_DATE;
$$;

COMMENT ON FUNCTION public.get_user_agent_count_today() IS 'Returns the number of agents created by the current user today';
COMMENT ON FUNCTION public.is_agent_creator(uuid) IS 'Checks if the current user is the creator of the specified agent';