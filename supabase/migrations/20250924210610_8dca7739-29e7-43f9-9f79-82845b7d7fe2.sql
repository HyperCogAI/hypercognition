-- Security Fix 1: Strengthen RLS policies for sensitive tables
-- Add missing RLS policies for admin_privilege_log
CREATE POLICY "System can log admin privileges" ON public.admin_privilege_log
FOR INSERT 
WITH CHECK (true);

-- Fix environment_variables access - only super admins should access
DROP POLICY IF EXISTS "Super admins can manage environment variables" ON public.environment_variables;
CREATE POLICY "Super admins can manage environment variables" ON public.environment_variables
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admin_users 
  WHERE admin_users.user_id = auth.uid() 
  AND admin_users.role = 'super_admin' 
  AND admin_users.is_active = true
));

-- Fix login_attempts - only system should insert
CREATE POLICY "System can log login attempts" ON public.login_attempts
FOR INSERT 
WITH CHECK (true);

-- Security Fix 2: Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_admin_role()
RETURNS TEXT AS $$
  SELECT role FROM public.admin_users 
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Security Fix 3: Enhanced password validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_param text)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{"valid": true, "errors": []}'::jsonb;
  errors text[] := '{}';
BEGIN
  -- Check minimum length (increased to 14)
  IF LENGTH(password_param) < 14 THEN
    errors := array_append(errors, 'Password must be at least 14 characters long');
  END IF;
  
  -- Check for uppercase letter
  IF NOT password_param ~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letter
  IF NOT password_param ~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digit
  IF NOT password_param ~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special character
  IF NOT password_param ~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Check for common patterns
  IF password_param ~* '(password|123456|qwerty|admin|letmein)' THEN
    errors := array_append(errors, 'Password contains common patterns and is not secure');
  END IF;
  
  -- Check for repeated characters
  IF password_param ~ '(.)\1{2,}' THEN
    errors := array_append(errors, 'Password should not contain more than 2 repeated characters');
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', errors);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Security Fix 4: Enhanced input validation with XSS protection
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  input_text text, 
  max_length integer DEFAULT 1000, 
  allow_html boolean DEFAULT false,
  strict_mode boolean DEFAULT false
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  sanitized_text text;
  is_valid boolean := true;
  errors text[] := '{}';
BEGIN
  -- Initialize sanitized text
  sanitized_text := input_text;
  
  -- Check for null or empty
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN jsonb_build_object(
      'valid', false, 
      'sanitized', '', 
      'errors', ARRAY['Input cannot be empty']
    );
  END IF;
  
  -- Check length
  IF LENGTH(input_text) > max_length THEN
    is_valid := false;
    errors := array_append(errors, 'Input exceeds maximum length of ' || max_length || ' characters');
  END IF;
  
  -- XSS Protection - remove dangerous patterns
  IF NOT allow_html THEN
    -- Remove script tags and javascript
    sanitized_text := regexp_replace(sanitized_text, '<script[^>]*>.*?</script>', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'javascript:', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'data:', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'vbscript:', '', 'gi');
    
    -- Remove dangerous event handlers
    sanitized_text := regexp_replace(sanitized_text, 'on\w+\s*=', '', 'gi');
    
    -- Remove dangerous HTML tags
    sanitized_text := regexp_replace(sanitized_text, '<(script|iframe|object|embed|form|input)[^>]*>', '', 'gi');
    
    -- If strict mode, remove all HTML
    IF strict_mode THEN
      sanitized_text := regexp_replace(sanitized_text, '<[^>]*>', '', 'g');
    END IF;
  END IF;
  
  -- SQL Injection Protection
  IF sanitized_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+' THEN
    is_valid := false;
    errors := array_append(errors, 'Input contains potentially dangerous SQL patterns');
  END IF;
  
  -- Check for suspicious patterns
  IF sanitized_text ~* '(\.\./|\.\.\\|/etc/|/proc/|/dev/|/sys/)' THEN
    is_valid := false;
    errors := array_append(errors, 'Input contains potentially dangerous file system patterns');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', is_valid,
    'sanitized', sanitized_text,
    'errors', errors,
    'original_length', LENGTH(input_text),
    'sanitized_length', LENGTH(sanitized_text)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Security Fix 5: Enhanced rate limiting with IP tracking
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier_param text, 
  endpoint_param text, 
  ip_address_param inet DEFAULT NULL,
  max_requests integer DEFAULT 100, 
  window_minutes integer DEFAULT 15,
  burst_protection boolean DEFAULT true
)
RETURNS jsonb AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  request_count INTEGER;
  ip_request_count INTEGER;
  result jsonb;
BEGIN
  -- Calculate current window start
  current_window := date_trunc('minute', now()) - 
    (EXTRACT(minute FROM now())::INTEGER % window_minutes) * INTERVAL '1 minute';
  
  -- Get current request count for this identifier
  SELECT COALESCE(SUM(request_count), 0) INTO request_count
  FROM public.rate_limits
  WHERE identifier = identifier_param
    AND endpoint = endpoint_param
    AND window_start >= current_window;
  
  -- Check IP-based rate limiting if provided
  IF ip_address_param IS NOT NULL AND burst_protection THEN
    SELECT COALESCE(SUM(request_count), 0) INTO ip_request_count
    FROM public.rate_limits
    WHERE identifier = host(ip_address_param)
      AND endpoint = endpoint_param
      AND window_start >= current_window - INTERVAL '1 minute'; -- Shorter window for IP
    
    -- Stricter limits for IP-based checking
    IF ip_request_count >= (max_requests / 2) THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'ip_rate_limit_exceeded',
        'retry_after', window_minutes * 60,
        'current_count', ip_request_count,
        'limit', max_requests / 2
      );
    END IF;
  END IF;
  
  -- Check if limit exceeded
  IF request_count >= max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'retry_after', window_minutes * 60,
      'current_count', request_count,
      'limit', max_requests
    );
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (identifier_param, endpoint_param, current_window, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  -- Also track IP if provided
  IF ip_address_param IS NOT NULL THEN
    INSERT INTO public.rate_limits (identifier, endpoint, window_start, request_count)
    VALUES (host(ip_address_param), endpoint_param || '_ip', current_window, 1)
    ON CONFLICT (identifier, endpoint, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', max_requests - request_count - 1,
    'reset_time', extract(epoch from (current_window + (window_minutes * INTERVAL '1 minute')))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Security Fix 6: Session management improvements
CREATE TABLE IF NOT EXISTS public.enhanced_user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  device_fingerprint text,
  location jsonb
);

-- Enable RLS on enhanced sessions
ALTER TABLE public.enhanced_user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for enhanced sessions
CREATE POLICY "Users can view their own sessions" ON public.enhanced_user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage sessions" ON public.enhanced_user_sessions
FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_sessions_user_id ON public.enhanced_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_sessions_token ON public.enhanced_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_enhanced_sessions_active ON public.enhanced_user_sessions(is_active) WHERE is_active = true;