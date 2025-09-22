-- Fix search path security warnings for functions
-- Update validate_input_security function
CREATE OR REPLACE FUNCTION public.validate_input_security(
  input_text TEXT,
  max_length INTEGER DEFAULT 1000,
  allow_html BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check length
  IF LENGTH(input_text) > max_length THEN
    RETURN false;
  END IF;
  
  -- Check for malicious patterns if HTML not allowed
  IF NOT allow_html THEN
    IF input_text ~* '<script|javascript:|data:|vbscript:|onload|onerror' THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check for SQL injection patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter)\s+' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update check_rate_limit function  
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier_param TEXT,
  endpoint_param TEXT,
  max_requests INTEGER DEFAULT 100,
  window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  request_count INTEGER;
BEGIN
  -- Calculate current window start
  current_window := date_trunc('minute', now()) - 
    (EXTRACT(minute FROM now())::INTEGER % window_minutes) * INTERVAL '1 minute';
  
  -- Get current request count for this window
  SELECT COALESCE(SUM(request_count), 0) INTO request_count
  FROM public.rate_limits
  WHERE identifier = identifier_param
    AND endpoint = endpoint_param
    AND window_start >= current_window;
  
  -- Check if limit exceeded
  IF request_count >= max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (identifier_param, endpoint_param, current_window, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update cleanup_rate_limits function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;