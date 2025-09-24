-- Create tables for Authentication & Security real data

-- KYC/AML verification table
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
  verification_type TEXT NOT NULL CHECK (verification_type IN ('individual', 'business', 'enhanced')),
  document_type TEXT,
  document_number TEXT,
  document_expiry DATE,
  full_name TEXT,
  date_of_birth DATE,
  nationality TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone_number TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  verification_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance violations table
CREATE TABLE public.compliance_violations_real (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('aml', 'kyc', 'sanctions', 'pep', 'transaction_limit', 'suspicious_activity')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  auto_detected BOOLEAN DEFAULT true,
  detection_method TEXT,
  related_transaction_id UUID,
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Security audit logs table
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  additional_data JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Security alerts table
CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('login_anomaly', 'multiple_failures', 'suspicious_transaction', 'account_takeover', 'data_breach', 'malware_detected')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_user_id UUID,
  affected_resource TEXT,
  source_ip INET,
  detection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID,
  resolution_notes TEXT,
  auto_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin actions table
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('user_management', 'system_config', 'security_override', 'data_export', 'compliance_review')),
  target_user_id UUID,
  target_resource TEXT,
  action_details JSONB NOT NULL DEFAULT '{}',
  justification TEXT,
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Two factor authentication table
CREATE TABLE public.user_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  secret_encrypted TEXT NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  recovery_email TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suspicious transactions table
CREATE TABLE public.suspicious_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  amount NUMERIC(20,8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  from_account TEXT,
  to_account TEXT,
  suspicion_reason TEXT[] NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  auto_flagged BOOLEAN DEFAULT true,
  reviewed_by UUID,
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'requires_investigation')),
  review_notes TEXT,
  escalated BOOLEAN DEFAULT false,
  escalated_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations_real ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC verifications
CREATE POLICY "Users can view their own KYC status" ON public.kyc_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC submissions" ON public.kyc_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all KYC verifications" ON public.kyc_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for compliance violations
CREATE POLICY "Admins can view all compliance violations" ON public.compliance_violations_real
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can create compliance violations" ON public.compliance_violations_real
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update compliance violations" ON public.compliance_violations_real
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS Policies for security audit logs
CREATE POLICY "Users can view their own audit logs" ON public.security_audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.security_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can create audit logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for security alerts
CREATE POLICY "Admins can manage security alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can create security alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for admin actions
CREATE POLICY "Admins can view admin actions" ON public.admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    ) AND auth.uid() = admin_user_id
  );

-- RLS Policies for 2FA
CREATE POLICY "Users can manage their own 2FA" ON public.user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for suspicious transactions
CREATE POLICY "Users can view their own suspicious transactions" ON public.suspicious_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage suspicious transactions" ON public.suspicious_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can create suspicious transactions" ON public.suspicious_transactions
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX idx_compliance_violations_user_id ON public.compliance_violations_real(user_id);
CREATE INDEX idx_compliance_violations_status ON public.compliance_violations_real(status);
CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at);
CREATE INDEX idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX idx_suspicious_transactions_user_id ON public.suspicious_transactions(user_id);
CREATE INDEX idx_suspicious_transactions_status ON public.suspicious_transactions(review_status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_violations_updated_at
  BEFORE UPDATE ON public.compliance_violations_real
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suspicious_transactions_updated_at
  BEFORE UPDATE ON public.suspicious_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();