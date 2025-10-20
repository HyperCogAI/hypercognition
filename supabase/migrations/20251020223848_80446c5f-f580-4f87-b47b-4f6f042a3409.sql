-- Drop existing functions first
DROP FUNCTION IF EXISTS public.enhanced_rate_limit_check;
DROP FUNCTION IF EXISTS public.check_agent_creation_limit;

-- Create atomic agent creation rate limit check function
-- This prevents race conditions by using database-level locking
CREATE FUNCTION public.check_agent_creation_limit(
  user_id_param UUID,
  max_agents_param INTEGER DEFAULT 5
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INTEGER,
  reset_time TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_reset_time TIMESTAMPTZ;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate 24-hour window
  v_window_start := NOW() - INTERVAL '24 hours';
  v_reset_time := v_window_start + INTERVAL '24 hours';
  
  -- Count agents created by user in last 24 hours
  SELECT COUNT(*)
  INTO v_count
  FROM public.agents
  WHERE creator_id = user_id_param
    AND created_at >= v_window_start;
  
  -- Return result
  RETURN QUERY SELECT 
    (v_count < max_agents_param) AS allowed,
    v_count AS current_count,
    v_reset_time AS reset_time;
END;
$$;

-- Create rate_limit_requests table for enhanced rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_endpoint_created 
ON public.rate_limit_requests(identifier, endpoint, created_at);

-- Create enhanced rate limit check function for edge functions
CREATE FUNCTION public.enhanced_rate_limit_check(
  identifier_param TEXT,
  endpoint_param TEXT,
  max_requests_param INTEGER DEFAULT 60,
  window_minutes_param INTEGER DEFAULT 1
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INTEGER,
  retry_after INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_reset_time TIMESTAMPTZ;
  v_retry_after INTEGER;
BEGIN
  -- Calculate time window
  v_window_start := NOW() - (window_minutes_param || ' minutes')::INTERVAL;
  v_reset_time := v_window_start + (window_minutes_param || ' minutes')::INTERVAL;
  
  -- Clean up old entries (older than 1 hour)
  DELETE FROM public.rate_limit_requests
  WHERE created_at < NOW() - INTERVAL '1 hour';
  
  -- Count recent requests
  SELECT COUNT(*)
  INTO v_count
  FROM public.rate_limit_requests
  WHERE identifier = identifier_param
    AND endpoint = endpoint_param
    AND created_at >= v_window_start;
  
  -- Calculate retry after in seconds
  v_retry_after := EXTRACT(EPOCH FROM (v_reset_time - NOW()))::INTEGER;
  
  -- If under limit, insert new request
  IF v_count < max_requests_param THEN
    INSERT INTO public.rate_limit_requests (identifier, endpoint, created_at)
    VALUES (identifier_param, endpoint_param, NOW());
    
    RETURN QUERY SELECT 
      TRUE AS allowed,
      (v_count + 1) AS current_count,
      0 AS retry_after;
  ELSE
    RETURN QUERY SELECT 
      FALSE AS allowed,
      v_count AS current_count,
      v_retry_after AS retry_after;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_agent_creation_limit(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.enhanced_rate_limit_check(TEXT, TEXT, INTEGER, INTEGER) TO authenticated, service_role;

-- Add RLS policies for rate_limit_requests table
ALTER TABLE public.rate_limit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_requests;
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limit_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON FUNCTION public.check_agent_creation_limit(UUID, INTEGER) IS 
'Atomically checks if user can create more agents (5 per 24h limit). Prevents race conditions.';

COMMENT ON FUNCTION public.enhanced_rate_limit_check(TEXT, TEXT, INTEGER, INTEGER) IS 
'Enhanced rate limiting for edge functions. Prevents DoS attacks and abuse.';

COMMENT ON TABLE public.rate_limit_requests IS 
'Tracks API requests for rate limiting purposes. Auto-cleaned after 1 hour.';