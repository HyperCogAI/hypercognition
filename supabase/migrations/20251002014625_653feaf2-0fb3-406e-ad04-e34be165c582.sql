-- Analytics Events Table (stores all user actions and events)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio Analytics Table (tracks portfolio performance over time)
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
  total_value NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  total_pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  avg_profit NUMERIC NOT NULL DEFAULT 0,
  avg_loss NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC,
  max_drawdown NUMERIC,
  best_trade NUMERIC,
  worst_trade NUMERIC,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Trading Analytics Table (detailed trading performance metrics)
CREATE TABLE IF NOT EXISTS public.trading_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  trade_count INTEGER NOT NULL DEFAULT 0,
  profitable_trades INTEGER NOT NULL DEFAULT 0,
  unprofitable_trades INTEGER NOT NULL DEFAULT 0,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  total_loss NUMERIC NOT NULL DEFAULT 0,
  avg_trade_duration INTERVAL,
  avg_position_size NUMERIC,
  largest_win NUMERIC,
  largest_loss NUMERIC,
  consecutive_wins INTEGER DEFAULT 0,
  consecutive_losses INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Agent Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  successful_trades INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  avg_roi NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  volatility NUMERIC,
  sentiment_score NUMERIC,
  active_users INTEGER DEFAULT 0,
  total_holders INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- User Analytics Dashboard Preferences
CREATE TABLE IF NOT EXISTS public.analytics_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_period TEXT DEFAULT 'daily',
  favorite_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_user_period ON public.portfolio_analytics(user_id, period, period_start);
CREATE INDEX IF NOT EXISTS idx_trading_analytics_user_period ON public.trading_analytics(user_id, period, period_start);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_period ON public.agent_performance_metrics(agent_id, period, period_start);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for portfolio_analytics
CREATE POLICY "Users can view their own portfolio analytics"
  ON public.portfolio_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage portfolio analytics"
  ON public.portfolio_analytics FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for trading_analytics
CREATE POLICY "Users can view their own trading analytics"
  ON public.trading_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage trading analytics"
  ON public.trading_analytics FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for agent_performance_metrics
CREATE POLICY "Agent performance metrics are publicly viewable"
  ON public.agent_performance_metrics FOR SELECT
  USING (true);

CREATE POLICY "System can manage agent performance metrics"
  ON public.agent_performance_metrics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for analytics_preferences
CREATE POLICY "Users can manage their own analytics preferences"
  ON public.analytics_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update analytics_preferences timestamp
CREATE OR REPLACE FUNCTION public.update_analytics_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics_preferences
CREATE TRIGGER update_analytics_preferences_timestamp
  BEFORE UPDATE ON public.analytics_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analytics_preferences_timestamp();