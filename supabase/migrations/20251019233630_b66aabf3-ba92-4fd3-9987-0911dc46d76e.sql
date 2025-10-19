-- Advanced AI Trading Backend Implementation

-- Create enum types
CREATE TYPE ai_strategy_type AS ENUM ('momentum', 'mean_reversion', 'arbitrage', 'sentiment', 'machine_learning', 'hybrid');
CREATE TYPE ai_model_type AS ENUM ('lstm', 'random_forest', 'transformer', 'reinforcement', 'gpt', 'hybrid');
CREATE TYPE ai_model_status AS ENUM ('active', 'training', 'testing', 'deprecated');
CREATE TYPE ai_session_type AS ENUM ('chat', 'strategy_creation', 'backtesting', 'signal_generation', 'portfolio_analysis');
CREATE TYPE backtest_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE signal_execution_status AS ENUM ('pending', 'active', 'executed', 'expired', 'cancelled');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'extreme');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');

-- AI Trading Strategies Table
CREATE TABLE public.ai_trading_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type ai_strategy_type NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  win_rate NUMERIC DEFAULT 0,
  avg_return NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_ai_strategies_user_id ON public.ai_trading_strategies(user_id);
CREATE INDEX idx_ai_strategies_type ON public.ai_trading_strategies(strategy_type);
CREATE INDEX idx_ai_strategies_system ON public.ai_trading_strategies(is_system) WHERE is_system = true;

-- AI Models Table
CREATE TABLE public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model_type ai_model_type NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  accuracy NUMERIC DEFAULT 0,
  training_data_description TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  status ai_model_status DEFAULT 'active',
  is_system BOOLEAN DEFAULT false,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_trained_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_models_type ON public.ai_models(model_type);
CREATE INDEX idx_ai_models_status ON public.ai_models(status);

-- AI Backtest Results Table
CREATE TABLE public.ai_backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES public.ai_trading_strategies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_return NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  profit_factor NUMERIC DEFAULT 0,
  detailed_results JSONB DEFAULT '{}'::jsonb,
  status backtest_status DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_backtest_strategy_id ON public.ai_backtest_results(strategy_id);
CREATE INDEX idx_backtest_user_id ON public.ai_backtest_results(user_id);
CREATE INDEX idx_backtest_status ON public.ai_backtest_results(status);

-- AI Trading Sessions Table
CREATE TABLE public.ai_trading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type ai_session_type NOT NULL,
  session_data JSONB DEFAULT '{}'::jsonb,
  tokens_used INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  duration_seconds INTEGER,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_sessions_user_id ON public.ai_trading_sessions(user_id);
CREATE INDEX idx_ai_sessions_type ON public.ai_trading_sessions(session_type);

-- AI Strategy Subscriptions Table
CREATE TABLE public.ai_strategy_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_id UUID REFERENCES public.ai_trading_strategies(id) ON DELETE CASCADE NOT NULL,
  is_auto_trade BOOLEAN DEFAULT false,
  max_position_size NUMERIC,
  risk_limit NUMERIC,
  status subscription_status DEFAULT 'active',
  total_pnl NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, strategy_id)
);

CREATE INDEX idx_strategy_subs_user_id ON public.ai_strategy_subscriptions(user_id);
CREATE INDEX idx_strategy_subs_strategy_id ON public.ai_strategy_subscriptions(strategy_id);

-- Enhance trading_signals table with AI columns
ALTER TABLE public.trading_signals
ADD COLUMN IF NOT EXISTS ai_model_id UUID REFERENCES public.ai_models(id),
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC,
ADD COLUMN IF NOT EXISTS technical_indicators JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS risk_level risk_level,
ADD COLUMN IF NOT EXISTS entry_price NUMERIC,
ADD COLUMN IF NOT EXISTS exit_price NUMERIC,
ADD COLUMN IF NOT EXISTS stop_loss_price NUMERIC,
ADD COLUMN IF NOT EXISTS take_profit_price NUMERIC,
ADD COLUMN IF NOT EXISTS execution_status signal_execution_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS actual_result NUMERIC;

CREATE INDEX IF NOT EXISTS idx_signals_ai_model ON public.trading_signals(ai_model_id);
CREATE INDEX IF NOT EXISTS idx_signals_execution_status ON public.trading_signals(execution_status);

-- Enhance ai_assistant_logs table
ALTER TABLE public.ai_assistant_logs
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS feedback_rating INTEGER;

-- Enable RLS on all tables
ALTER TABLE public.ai_trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_backtest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_strategy_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_trading_strategies
CREATE POLICY "Users can view their own strategies"
  ON public.ai_trading_strategies FOR SELECT
  USING (user_id = auth.uid() OR is_system = true);

CREATE POLICY "Users can create their own strategies"
  ON public.ai_trading_strategies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own strategies"
  ON public.ai_trading_strategies FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own strategies"
  ON public.ai_trading_strategies FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for ai_models
CREATE POLICY "AI models are publicly viewable"
  ON public.ai_models FOR SELECT
  USING (true);

-- RLS Policies for ai_backtest_results
CREATE POLICY "Users can view their own backtest results"
  ON public.ai_backtest_results FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create backtest results"
  ON public.ai_backtest_results FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ai_trading_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.ai_trading_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON public.ai_trading_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON public.ai_trading_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for ai_strategy_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.ai_strategy_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON public.ai_strategy_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON public.ai_strategy_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own subscriptions"
  ON public.ai_strategy_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- Database Functions

-- Calculate strategy performance
CREATE OR REPLACE FUNCTION public.calculate_strategy_performance(strategy_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_trading_strategies
  SET
    win_rate = (
      SELECT COALESCE(AVG(CASE WHEN win_rate > 50 THEN win_rate ELSE 0 END), 0)
      FROM public.ai_backtest_results
      WHERE strategy_id = strategy_id_param AND status = 'completed'
    ),
    avg_return = (
      SELECT COALESCE(AVG(total_return), 0)
      FROM public.ai_backtest_results
      WHERE strategy_id = strategy_id_param AND status = 'completed'
    ),
    sharpe_ratio = (
      SELECT COALESCE(AVG(sharpe_ratio), 0)
      FROM public.ai_backtest_results
      WHERE strategy_id = strategy_id_param AND status = 'completed'
    ),
    max_drawdown = (
      SELECT COALESCE(MAX(max_drawdown), 0)
      FROM public.ai_backtest_results
      WHERE strategy_id = strategy_id_param AND status = 'completed'
    ),
    total_trades = (
      SELECT COALESCE(SUM(total_trades), 0)
      FROM public.ai_backtest_results
      WHERE strategy_id = strategy_id_param AND status = 'completed'
    ),
    updated_at = now()
  WHERE id = strategy_id_param;
END;
$$;

-- Get user AI statistics
CREATE OR REPLACE FUNCTION public.get_user_ai_stats(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_strategies', (
      SELECT COUNT(*)
      FROM public.ai_trading_strategies
      WHERE user_id = user_id_param
    ),
    'active_strategies', (
      SELECT COUNT(*)
      FROM public.ai_trading_strategies
      WHERE user_id = user_id_param AND is_active = true
    ),
    'total_backtests', (
      SELECT COUNT(*)
      FROM public.ai_backtest_results
      WHERE user_id = user_id_param
    ),
    'completed_backtests', (
      SELECT COUNT(*)
      FROM public.ai_backtest_results
      WHERE user_id = user_id_param AND status = 'completed'
    ),
    'total_signals', (
      SELECT COUNT(*)
      FROM public.trading_signals
      WHERE user_id = user_id_param
    ),
    'active_subscriptions', (
      SELECT COUNT(*)
      FROM public.ai_strategy_subscriptions
      WHERE user_id = user_id_param AND status = 'active'
    ),
    'total_pnl', (
      SELECT COALESCE(SUM(total_pnl), 0)
      FROM public.ai_strategy_subscriptions
      WHERE user_id = user_id_param
    ),
    'best_strategy', (
      SELECT jsonb_build_object(
        'name', name,
        'win_rate', win_rate,
        'avg_return', avg_return
      )
      FROM public.ai_trading_strategies
      WHERE user_id = user_id_param
      ORDER BY avg_return DESC
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_ai_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_ai_strategies_updated_at
  BEFORE UPDATE ON public.ai_trading_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_updated_at();

CREATE TRIGGER update_ai_subscriptions_updated_at
  BEFORE UPDATE ON public.ai_strategy_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_updated_at();

-- Insert default AI models
INSERT INTO public.ai_models (name, model_type, description, version, accuracy, training_data_description, status, is_system, performance_metrics)
VALUES
  ('LSTM Price Predictor v3', 'lstm', 'Long Short-Term Memory network with attention for price forecasting', '3.0.0', 89.2, 'Historical price data from 15+ exchanges (2019-2024)', 'active', true, '{"precision": 0.91, "recall": 0.87, "f1_score": 0.89}'::jsonb),
  ('Random Forest Classifier Pro', 'random_forest', 'Ensemble model with 500 trees for market direction prediction', '2.1.0', 76.8, 'Technical indicators + on-chain metrics + sentiment data', 'active', true, '{"precision": 0.78, "recall": 0.75, "f1_score": 0.76}'::jsonb),
  ('Transformer Market Oracle', 'transformer', 'GPT-style architecture trained on financial time series', '1.5.0', 91.4, 'Multi-modal: price, news, social sentiment, macro indicators', 'active', true, '{"precision": 0.93, "recall": 0.90, "f1_score": 0.91}'::jsonb),
  ('Deep Q-Learning Trader', 'reinforcement', 'Reinforcement learning agent trained in live market simulation', '1.2.0', 82.1, 'Real trading environment with risk controls and backtesting', 'training', true, '{"precision": 0.84, "recall": 0.80, "f1_score": 0.82}'::jsonb),
  ('Hybrid Sentiment Engine', 'hybrid', 'Combines NLP sentiment with technical analysis', '2.0.0', 85.5, 'Social media, news, on-chain data + technical indicators', 'active', true, '{"precision": 0.87, "recall": 0.84, "f1_score": 0.85}'::jsonb);

-- Insert default trading strategies
INSERT INTO public.ai_trading_strategies (name, description, strategy_type, parameters, is_system, win_rate, avg_return, sharpe_ratio, max_drawdown, total_trades, model_version)
VALUES
  ('Neural Momentum Alpha', 'LSTM-based momentum detection with attention mechanisms', 'machine_learning', '{"lookback_period": 20, "confidence_threshold": 0.75, "risk_per_trade": 0.02}'::jsonb, true, 78.5, 12.3, 1.8, 8.2, 245, 'v2.1.3'),
  ('Sentiment Flow Engine', 'NLP-powered sentiment analysis with social media integration', 'sentiment', '{"sentiment_threshold": 0.6, "volume_filter": true, "time_decay": 0.9}'::jsonb, true, 72.1, 9.8, 1.4, 6.7, 189, 'v1.8.2'),
  ('Arbitrage Hunter Pro', 'Cross-exchange arbitrage detection with real-time execution', 'arbitrage', '{"min_spread": 0.005, "max_latency_ms": 100, "exchanges": ["binance", "coinbase", "kraken"]}'::jsonb, true, 94.2, 6.4, 2.7, 2.1, 1456, 'v3.0.1'),
  ('Mean Reversion Quantum', 'Statistical arbitrage using quantum-inspired algorithms', 'mean_reversion', '{"zscore_threshold": 2.5, "lookback_window": 30, "exit_zscore": 0.5}'::jsonb, true, 68.9, 15.2, 1.6, 12.4, 98, 'v1.2.0');