-- Fix critical admin user creation vulnerability
-- Drop existing overly permissive admin policies
DROP POLICY IF EXISTS "Only super admins can manage admin users" ON public.admin_users;

-- Create secure policies for admin user management
CREATE POLICY "Super admins can insert new admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

CREATE POLICY "Super admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

CREATE POLICY "Super admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- Create audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create function for enhanced input validation
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limiting table for server-side enforcement
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP or user_id
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS on rate limits (admin only)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create function to check rate limits
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;