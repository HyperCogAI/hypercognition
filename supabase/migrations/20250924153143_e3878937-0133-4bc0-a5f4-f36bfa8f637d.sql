-- Create backup_configs table for backup recovery system
CREATE TABLE public.backup_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  backup_type TEXT NOT NULL DEFAULT 'full', -- full, incremental, differential
  schedule_cron TEXT, -- cron expression for scheduling
  retention_days INTEGER NOT NULL DEFAULT 30,
  storage_location TEXT NOT NULL DEFAULT 'local',
  encryption_enabled BOOLEAN NOT NULL DEFAULT true,
  compression_enabled BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE
);

-- Create backup_records table for backup history
CREATE TABLE public.backup_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.backup_configs(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  file_size_bytes BIGINT,
  file_path TEXT,
  backup_duration_seconds INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create environment_variables table for secrets management
CREATE TABLE public.environment_variables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  value_encrypted TEXT, -- encrypted value for secrets
  value_plain TEXT, -- plain text for non-secrets
  environment TEXT NOT NULL DEFAULT 'production', -- production, staging, development
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create technical_indicators table for technical analysis
CREATE TABLE public.technical_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL, -- rsi, macd, bollinger_bands, sma, ema, etc.
  timeframe TEXT NOT NULL DEFAULT '1h', -- 1m, 5m, 15m, 1h, 4h, 1d
  value NUMERIC NOT NULL,
  signal TEXT, -- buy, sell, hold, neutral
  strength NUMERIC, -- 0-100 signal strength
  parameters JSONB DEFAULT '{}', -- indicator-specific parameters
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backup_configs
CREATE POLICY "Admins can manage backup configs" ON public.backup_configs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for backup_records
CREATE POLICY "Admins can view backup records" ON public.backup_records
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for environment_variables
CREATE POLICY "Super admins can manage environment variables" ON public.environment_variables
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  )
);

-- RLS Policies for technical_indicators
CREATE POLICY "Technical indicators are viewable by everyone" ON public.technical_indicators
FOR SELECT USING (true);

CREATE POLICY "System can manage technical indicators" ON public.technical_indicators
FOR ALL USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_backup_configs_updated_at
  BEFORE UPDATE ON public.backup_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_environment_variables_updated_at
  BEFORE UPDATE ON public.environment_variables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_backup_records_config_id ON public.backup_records(config_id);
CREATE INDEX idx_backup_records_status ON public.backup_records(status);
CREATE INDEX idx_backup_records_created_at ON public.backup_records(created_at);
CREATE INDEX idx_technical_indicators_agent_timeframe ON public.technical_indicators(agent_id, timeframe);
CREATE INDEX idx_technical_indicators_type ON public.technical_indicators(indicator_type);
CREATE INDEX idx_technical_indicators_calculated_at ON public.technical_indicators(calculated_at);