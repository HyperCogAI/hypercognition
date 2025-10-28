-- Create risk_metrics table for storing historical risk calculations
CREATE TABLE IF NOT EXISTS public.risk_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  portfolio_value NUMERIC NOT NULL DEFAULT 0,
  total_exposure NUMERIC NOT NULL DEFAULT 0,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  value_at_risk NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC NOT NULL DEFAULT 0,
  diversification_ratio NUMERIC NOT NULL DEFAULT 0,
  beta NUMERIC NOT NULL DEFAULT 0,
  volatility NUMERIC NOT NULL DEFAULT 0,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  concentration_risk NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create risk_limits table for user-defined risk thresholds
CREATE TABLE IF NOT EXISTS public.risk_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL CHECK (limit_type IN ('max_position_size', 'max_daily_loss', 'var_limit', 'concentration_limit', 'max_drawdown', 'min_diversification')),
  limit_value NUMERIC NOT NULL,
  warning_threshold NUMERIC NOT NULL DEFAULT 0.8,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, limit_type)
);

-- Create risk_alerts table for tracking limit breaches
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_limit_id UUID REFERENCES public.risk_limits(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'breach', 'critical')),
  limit_type TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  limit_value NUMERIC NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Create portfolio_optimizations table for storing optimization suggestions
CREATE TABLE IF NOT EXISTS public.portfolio_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  optimization_score NUMERIC NOT NULL DEFAULT 0,
  applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.risk_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_metrics
CREATE POLICY "Users can view their own risk metrics"
  ON public.risk_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert risk metrics"
  ON public.risk_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for risk_limits
CREATE POLICY "Users can view their own risk limits"
  ON public.risk_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk limits"
  ON public.risk_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk limits"
  ON public.risk_limits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk limits"
  ON public.risk_limits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for risk_alerts
CREATE POLICY "Users can view their own risk alerts"
  ON public.risk_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert risk alerts"
  ON public.risk_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk alerts"
  ON public.risk_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for portfolio_optimizations
CREATE POLICY "Users can view their own optimizations"
  ON public.portfolio_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert optimizations"
  ON public.portfolio_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimizations"
  ON public.portfolio_optimizations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_risk_metrics_user_id ON public.risk_metrics(user_id);
CREATE INDEX idx_risk_metrics_calculated_at ON public.risk_metrics(calculated_at DESC);
CREATE INDEX idx_risk_limits_user_id ON public.risk_limits(user_id);
CREATE INDEX idx_risk_alerts_user_id ON public.risk_alerts(user_id);
CREATE INDEX idx_risk_alerts_acknowledged ON public.risk_alerts(user_id, acknowledged);
CREATE INDEX idx_portfolio_optimizations_user_id ON public.portfolio_optimizations(user_id);

-- Trigger for updating updated_at on risk_limits
CREATE TRIGGER update_risk_limits_updated_at
  BEFORE UPDATE ON public.risk_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default risk limits for existing users (optional)
-- This can be customized based on user preferences later
INSERT INTO public.risk_limits (user_id, limit_type, limit_value, warning_threshold)
SELECT DISTINCT user_id, 'max_position_size', 25.0, 0.8
FROM public.user_holdings
WHERE NOT EXISTS (
  SELECT 1 FROM public.risk_limits 
  WHERE risk_limits.user_id = user_holdings.user_id 
  AND risk_limits.limit_type = 'max_position_size'
)
ON CONFLICT (user_id, limit_type) DO NOTHING;

INSERT INTO public.risk_limits (user_id, limit_type, limit_value, warning_threshold)
SELECT DISTINCT user_id, 'var_limit', 10.0, 0.8
FROM public.user_holdings
WHERE NOT EXISTS (
  SELECT 1 FROM public.risk_limits 
  WHERE risk_limits.user_id = user_holdings.user_id 
  AND risk_limits.limit_type = 'var_limit'
)
ON CONFLICT (user_id, limit_type) DO NOTHING;

INSERT INTO public.risk_limits (user_id, limit_type, limit_value, warning_threshold)
SELECT DISTINCT user_id, 'concentration_limit', 30.0, 0.8
FROM public.user_holdings
WHERE NOT EXISTS (
  SELECT 1 FROM public.risk_limits 
  WHERE risk_limits.user_id = user_holdings.user_id 
  AND risk_limits.limit_type = 'concentration_limit'
)
ON CONFLICT (user_id, limit_type) DO NOTHING;