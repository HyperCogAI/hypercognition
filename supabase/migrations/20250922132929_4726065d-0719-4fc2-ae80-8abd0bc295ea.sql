-- Add 2FA and enhanced authentication security
-- Create 2FA secrets table for admin users
CREATE TABLE IF NOT EXISTS public.admin_2fa_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes TEXT[], -- Encrypted backup codes
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_2fa_secrets ENABLE ROW LEVEL SECURITY;

-- Only allow users to manage their own 2FA
CREATE POLICY "Users can manage their own 2FA secrets" 
ON public.admin_2fa_secrets 
FOR ALL 
USING (auth.uid() = user_id);

-- Create session tracking table for enhanced security
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_token)
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create login attempts tracking for brute force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or IP
  attempt_type TEXT NOT NULL, -- 'email', 'wallet', 'admin'
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only admins can view
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login attempts" 
ON public.login_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Create function to check for brute force attempts
CREATE OR REPLACE FUNCTION public.check_brute_force(
  identifier_param TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count failed attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.login_attempts
  WHERE identifier = identifier_param
    AND success = false
    AND created_at > (now() - (window_minutes || ' minutes')::INTERVAL);
  
  -- Return false if too many attempts
  RETURN attempt_count < max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to log login attempts
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  identifier_param TEXT,
  attempt_type_param TEXT,
  success_param BOOLEAN,
  ip_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  failure_reason_param TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.login_attempts (
    identifier, 
    attempt_type, 
    success, 
    ip_address, 
    user_agent, 
    failure_reason
  ) VALUES (
    identifier_param, 
    attempt_type_param, 
    success_param, 
    ip_param, 
    user_agent_param, 
    failure_reason_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to clean up old sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions() RETURNS void AS $$
BEGIN
  -- Mark expired sessions as inactive
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Delete old inactive sessions (older than 7 days)
  DELETE FROM public.user_sessions 
  WHERE is_active = false 
    AND created_at < now() - INTERVAL '7 days';
    
  -- Clean up old login attempts (older than 30 days)
  DELETE FROM public.login_attempts 
  WHERE created_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create password policy validation function
CREATE OR REPLACE FUNCTION public.validate_password_policy(
  password_param TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check minimum length
  IF LENGTH(password_param) < 12 THEN
    RETURN false;
  END IF;
  
  -- Check for uppercase letter
  IF NOT password_param ~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for lowercase letter
  IF NOT password_param ~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for digit
  IF NOT password_param ~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Check for special character
  IF NOT password_param ~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create admin privileges escalation log
CREATE TABLE IF NOT EXISTS public.admin_privilege_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_privilege_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view privilege logs
CREATE POLICY "Super admins can view privilege logs" 
ON public.admin_privilege_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);