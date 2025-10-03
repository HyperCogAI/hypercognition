-- =====================================================
-- ENTERPRISE-GRADE SETTINGS BACKEND
-- =====================================================

-- Create enum types for settings
CREATE TYPE notification_frequency AS ENUM ('instant', 'daily', 'weekly', 'never');
CREATE TYPE privacy_level AS ENUM ('public', 'friends', 'private');
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Display preferences
  theme_mode theme_mode DEFAULT 'system',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  currency TEXT DEFAULT 'USD',
  
  -- Email preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_marketing_enabled BOOLEAN DEFAULT false,
  email_product_updates BOOLEAN DEFAULT true,
  email_security_alerts BOOLEAN DEFAULT true,
  
  -- Push notification preferences
  push_notifications_enabled BOOLEAN DEFAULT true,
  push_trading_alerts BOOLEAN DEFAULT true,
  push_price_alerts BOOLEAN DEFAULT true,
  push_social_updates BOOLEAN DEFAULT false,
  
  -- Privacy settings
  profile_visibility privacy_level DEFAULT 'public',
  show_email BOOLEAN DEFAULT false,
  show_wallet_address BOOLEAN DEFAULT false,
  show_portfolio BOOLEAN DEFAULT false,
  show_trading_history BOOLEAN DEFAULT false,
  allow_direct_messages BOOLEAN DEFAULT true,
  
  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false,
  login_notifications BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 60,
  require_password_change_days INTEGER DEFAULT 90,
  
  -- Trading preferences
  default_slippage_tolerance NUMERIC DEFAULT 1.0,
  auto_approve_transactions BOOLEAN DEFAULT false,
  show_test_networks BOOLEAN DEFAULT false,
  confirm_transactions BOOLEAN DEFAULT true,
  
  -- Data & Analytics
  allow_analytics BOOLEAN DEFAULT true,
  allow_personalization BOOLEAN DEFAULT true,
  share_anonymous_data BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT user_settings_user_id_check CHECK (user_id IS NOT NULL),
  CONSTRAINT user_settings_session_timeout_check CHECK (session_timeout_minutes BETWEEN 5 AND 1440),
  CONSTRAINT user_settings_password_change_check CHECK (require_password_change_days >= 0),
  CONSTRAINT user_settings_slippage_check CHECK (default_slippage_tolerance BETWEEN 0.1 AND 50)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
  ON public.user_settings FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Trading notifications
  price_alerts_enabled BOOLEAN DEFAULT true,
  price_alerts_frequency notification_frequency DEFAULT 'instant',
  trade_confirmations BOOLEAN DEFAULT true,
  order_fills BOOLEAN DEFAULT true,
  position_updates BOOLEAN DEFAULT true,
  
  -- Social notifications
  new_followers BOOLEAN DEFAULT true,
  mentions BOOLEAN DEFAULT true,
  comments BOOLEAN DEFAULT true,
  likes BOOLEAN DEFAULT false,
  
  -- System notifications
  system_updates BOOLEAN DEFAULT true,
  maintenance_alerts BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  feature_announcements BOOLEAN DEFAULT true,
  
  -- Agent notifications
  agent_performance_updates BOOLEAN DEFAULT true,
  agent_creation_status BOOLEAN DEFAULT true,
  agent_milestone_alerts BOOLEAN DEFAULT true,
  
  -- Email digest
  daily_summary BOOLEAN DEFAULT false,
  weekly_report BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT false,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PRIVACY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Profile privacy
  profile_searchable BOOLEAN DEFAULT true,
  show_activity_status BOOLEAN DEFAULT true,
  show_last_seen BOOLEAN DEFAULT false,
  
  -- Data sharing
  share_trading_data BOOLEAN DEFAULT false,
  share_with_partners BOOLEAN DEFAULT false,
  allow_third_party_cookies BOOLEAN DEFAULT false,
  
  -- Blocking & restrictions
  blocked_users UUID[] DEFAULT ARRAY[]::UUID[],
  muted_users UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Account visibility
  hide_from_search_engines BOOLEAN DEFAULT false,
  private_profile BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their privacy settings"
  ON public.privacy_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SETTINGS CHANGE LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  setting_category TEXT NOT NULL,
  setting_name TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT settings_change_log_user_id_check CHECK (user_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.settings_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own change log"
  ON public.settings_change_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert change logs"
  ON public.settings_change_log FOR INSERT
  WITH CHECK (true);

-- Admins can view all change logs
CREATE POLICY "Admins can view all change logs"
  ON public.settings_change_log FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- API ACCESS TOKENS TABLE (for user-generated tokens)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL,
  
  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count BIGINT DEFAULT 0,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by_ip INET,
  
  CONSTRAINT user_api_tokens_name_length CHECK (length(name) >= 3 AND length(name) <= 100),
  CONSTRAINT user_api_tokens_rate_limit CHECK (rate_limit_per_hour BETWEEN 1 AND 10000)
);

-- Enable RLS
ALTER TABLE public.user_api_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own API tokens"
  ON public.user_api_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CONNECTED ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  provider_account_name TEXT,
  
  -- OAuth tokens (encrypted)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Connection metadata
  scopes TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT connected_accounts_unique UNIQUE (user_id, provider, provider_account_id)
);

-- Enable RLS
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their connected accounts"
  ON public.connected_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update user_settings timestamp
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to log settings changes
CREATE OR REPLACE FUNCTION log_settings_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if values actually changed
  IF (TG_OP = 'UPDATE' AND OLD IS DISTINCT FROM NEW) THEN
    INSERT INTO public.settings_change_log (
      user_id,
      setting_category,
      setting_name,
      old_value,
      new_value,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      NEW.user_id,
      TG_TABLE_NAME,
      'settings_updated',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid(),
      inet_client_addr(),
      current_setting('request.headers', true)::jsonb->>'user-agent'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get user settings with defaults
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT to_jsonb(us.*) INTO settings
  FROM public.user_settings us
  WHERE us.user_id = p_user_id;
  
  -- If no settings exist, create default ones
  IF settings IS NULL THEN
    INSERT INTO public.user_settings (user_id)
    VALUES (p_user_id)
    RETURNING to_jsonb(user_settings.*) INTO settings;
  END IF;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to validate settings update
CREATE OR REPLACE FUNCTION validate_settings_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format if changing email-related settings
  IF NEW.email_notifications_enabled IS NOT NULL THEN
    -- Log this as a security-relevant change
    PERFORM public.log_sensitive_data_access(
      'user_settings',
      'UPDATE',
      NEW.id,
      jsonb_build_object('email_notifications_changed', true)
    );
  END IF;
  
  -- Ensure critical security settings can't be disabled without proper authentication
  IF OLD.two_factor_enabled = true AND NEW.two_factor_enabled = false THEN
    -- This should be handled by edge function with additional verification
    RAISE EXCEPTION 'Two-factor authentication cannot be disabled directly. Use the dedicated endpoint.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to cleanup expired API tokens
CREATE OR REPLACE FUNCTION cleanup_expired_api_tokens()
RETURNS void AS $$
BEGIN
  UPDATE public.user_api_tokens
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update timestamp on user_settings
CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- Trigger to update timestamp on notification_preferences
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- Trigger to update timestamp on privacy_settings
CREATE TRIGGER update_privacy_settings_timestamp
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();

-- Trigger to log settings changes
CREATE TRIGGER log_user_settings_changes
  AFTER UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_settings_change();

-- Trigger to validate settings updates
CREATE TRIGGER validate_user_settings_update
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION validate_settings_update();

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX idx_settings_change_log_user_id ON public.settings_change_log(user_id);
CREATE INDEX idx_settings_change_log_created_at ON public.settings_change_log(created_at DESC);
CREATE INDEX idx_user_api_tokens_user_id ON public.user_api_tokens(user_id);
CREATE INDEX idx_user_api_tokens_token_hash ON public.user_api_tokens(token_hash);
CREATE INDEX idx_user_api_tokens_is_active ON public.user_api_tokens(is_active) WHERE is_active = true;
CREATE INDEX idx_connected_accounts_user_id ON public.connected_accounts(user_id);

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.user_settings IS 'Stores comprehensive user settings and preferences';
COMMENT ON TABLE public.notification_preferences IS 'Manages user notification preferences across all channels';
COMMENT ON TABLE public.privacy_settings IS 'Controls user privacy and data sharing preferences';
COMMENT ON TABLE public.settings_change_log IS 'Audit trail for all settings changes';
COMMENT ON TABLE public.user_api_tokens IS 'User-generated API tokens for programmatic access';
COMMENT ON TABLE public.connected_accounts IS 'Third-party account connections and OAuth data';