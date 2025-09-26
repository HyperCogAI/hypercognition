-- CRITICAL SECURITY FIXES - Phase 1: Data Protection (Fixed)

-- 1. Fix KYC data exposure - Create restricted access policies
DROP POLICY IF EXISTS "Users can view their own KYC status" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can create their own KYC submissions" ON public.kyc_verifications;

-- Create security definer function to check compliance officer role
CREATE OR REPLACE FUNCTION public.is_compliance_officer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
    AND (permissions::jsonb ? 'kyc_access' OR permissions::jsonb @> '["kyc_access"]'::jsonb)
  );
$$;

-- Restrictive KYC policies - users can only view their own basic status
CREATE POLICY "Users can view their own KYC basic status" 
ON public.kyc_verifications 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND verification_type IN ('basic', 'standard')
);

-- Users can only create basic submissions
CREATE POLICY "Users can create their own basic KYC submissions" 
ON public.kyc_verifications 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND verification_type IN ('basic', 'standard')
);

-- Only compliance officers can view full KYC data
CREATE POLICY "Compliance officers can view all KYC data" 
ON public.kyc_verifications 
FOR SELECT 
USING (public.is_compliance_officer());

-- Only compliance officers can update KYC records
CREATE POLICY "Compliance officers can update KYC records" 
ON public.kyc_verifications 
FOR UPDATE 
USING (public.is_compliance_officer());

-- 2. Fix admin 2FA secret exposure
DROP POLICY IF EXISTS "Users can manage their own 2FA secrets" ON public.admin_2fa_secrets;

-- Restricted 2FA access policy - users can only access their own, super admins can access all
CREATE POLICY "Restricted admin 2FA access" 
ON public.admin_2fa_secrets 
FOR ALL 
USING (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ))
  OR EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 3. Create security audit function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name text,
  operation text,
  record_id uuid DEFAULT NULL,
  additional_context jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    operation || '_' || table_name,
    table_name,
    jsonb_build_object(
      'record_id', record_id,
      'context', additional_context,
      'timestamp', now()
    ),
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );
EXCEPTION
  -- Gracefully handle cases where security_audit_log doesn't exist yet
  WHEN undefined_table THEN
    NULL;
END;
$$;

-- 4. Create table for enhanced security settings
CREATE TABLE IF NOT EXISTS public.security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security settings
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage security settings
CREATE POLICY "Super admins can manage security settings" 
ON public.security_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  )
);

-- 5. Create function to validate data access patterns
CREATE OR REPLACE FUNCTION public.detect_unusual_access_pattern(
  user_id_param uuid,
  table_name_param text,
  time_window_minutes integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  access_count integer := 0;
  normal_threshold integer := 50;
BEGIN
  -- Try to count recent access attempts
  BEGIN
    SELECT COUNT(*) INTO access_count
    FROM public.security_audit_log
    WHERE user_id = user_id_param
      AND resource = table_name_param
      AND created_at > (now() - (time_window_minutes || ' minutes')::interval);
  EXCEPTION
    WHEN undefined_table THEN
      access_count := 0;
  END;
  
  RETURN access_count > normal_threshold;
END;
$$;

-- 6. Insert default security settings
INSERT INTO public.security_settings (setting_name, setting_value) VALUES
('kyc_data_retention_days', '"2555"'::jsonb),
('admin_session_timeout_minutes', '"30"'::jsonb),
('max_failed_login_attempts', '"5"'::jsonb),
('password_policy_min_length', '"14"'::jsonb),
('require_2fa_for_admin', 'true'::jsonb),
('log_sensitive_data_access', 'true'::jsonb)
ON CONFLICT (setting_name) DO NOTHING;

-- 7. Create compliance alerts table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.compliance_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  affected_user_id uuid,
  related_table text,
  related_record_id uuid,
  metadata jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Enable RLS on compliance alerts
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- Compliance officers and admins can view alerts
CREATE POLICY "Compliance officers can view alerts" 
ON public.compliance_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- System can create alerts
CREATE POLICY "System can create compliance alerts" 
ON public.compliance_alerts 
FOR INSERT 
WITH CHECK (true);

-- Admins can update alerts
CREATE POLICY "Admins can update compliance alerts" 
ON public.compliance_alerts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- 8. Create audit functions for KYC operations (without SELECT trigger)
CREATE OR REPLACE FUNCTION public.audit_kyc_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log KYC data modifications (INSERT, UPDATE, DELETE)
  PERFORM public.log_sensitive_data_access(
    'kyc_verifications',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'verification_type', COALESCE(NEW.verification_type, OLD.verification_type),
      'user_affected', COALESCE(NEW.user_id, OLD.user_id),
      'status_change', CASE 
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        ELSE '{}'::jsonb
      END
    )
  );
  
  -- Check for unusual access patterns and create alerts if needed
  IF public.detect_unusual_access_pattern(auth.uid(), 'kyc_verifications') THEN
    INSERT INTO public.compliance_alerts (
      alert_type,
      severity,
      title,
      description,
      affected_user_id,
      related_table,
      metadata
    ) VALUES (
      'unusual_access_pattern',
      'high',
      'Unusual KYC Data Access Pattern Detected',
      'User ' || COALESCE(auth.uid()::text, 'unknown') || ' has accessed KYC data unusually frequently',
      auth.uid(),
      'kyc_verifications',
      jsonb_build_object(
        'detection_time', now(),
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for KYC modification auditing (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS audit_kyc_modification_trigger ON public.kyc_verifications;
CREATE TRIGGER audit_kyc_modification_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_kyc_modification();

-- 9. Update admin permissions to include KYC access flag for existing admins
UPDATE public.admin_users 
SET permissions = CASE 
  WHEN permissions::jsonb ? 'kyc_access' THEN permissions
  WHEN permissions = '[]'::jsonb THEN '["kyc_access"]'::jsonb
  ELSE permissions::jsonb || '["kyc_access"]'::jsonb
END
WHERE role IN ('super_admin', 'admin') 
AND is_active = true;

-- 10. Create updated_at trigger for security settings
CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Enhanced rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_sensitive_rate_limit(
  operation_type text,
  user_id_param uuid DEFAULT auth.uid(),
  max_ops integer DEFAULT 10,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  operation_count integer := 0;
BEGIN
  -- Count operations in the time window
  BEGIN
    SELECT COUNT(*) INTO operation_count
    FROM public.security_audit_log
    WHERE user_id = user_id_param
      AND action ILIKE '%' || operation_type || '%'
      AND created_at > (now() - (window_minutes || ' minutes')::interval);
  EXCEPTION
    WHEN undefined_table THEN
      operation_count := 0;
  END;
  
  -- Create alert if limit exceeded
  IF operation_count >= max_ops THEN
    INSERT INTO public.compliance_alerts (
      alert_type,
      severity,
      title,
      description,
      affected_user_id,
      metadata
    ) VALUES (
      'rate_limit_exceeded',
      'medium',
      'Sensitive Operation Rate Limit Exceeded',
      'User exceeded rate limit for ' || operation_type || ' operations',
      user_id_param,
      jsonb_build_object(
        'operation_type', operation_type,
        'count', operation_count,
        'limit', max_ops,
        'window_minutes', window_minutes
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;