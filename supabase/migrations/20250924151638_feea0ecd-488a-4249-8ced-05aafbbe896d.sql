-- Create missing tables for critical business logic (excluding existing ones)

-- Agent earnings tracking
CREATE TABLE public.agents_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  earnings_type TEXT NOT NULL CHECK (earnings_type IN ('payment', 'commission', 'subscription', 'service_fee', 'trading_fee')),
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  source_transaction_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Agent interactions (engagements)
CREATE TABLE public.agent_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('payment', 'job', 'consultation', 'data_request', 'signal_subscription')),
  amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed', 'cancelled', 'failed')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Trading positions
CREATE TABLE public.trading_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  position_type TEXT NOT NULL CHECK (position_type IN ('long', 'short')),
  size NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  leverage NUMERIC DEFAULT 1,
  margin NUMERIC NOT NULL,
  unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
  realized_pnl NUMERIC NOT NULL DEFAULT 0,
  stop_loss_price NUMERIC,
  take_profit_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Execution strategies for trading engine
CREATE TABLE public.execution_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('market', 'limit', 'stop_loss', 'take_profit', 'dca', 'grid')),
  parameters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_executions INTEGER NOT NULL DEFAULT 0,
  successful_executions INTEGER NOT NULL DEFAULT 0,
  total_volume NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order executions for tracking
CREATE TABLE public.execution_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES public.execution_strategies(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  price NUMERIC,
  executed_price NUMERIC,
  executed_amount NUMERIC DEFAULT 0,
  fees NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'filled', 'cancelled', 'failed')),
  execution_time TIMESTAMP WITH TIME ZONE,
  latency_ms INTEGER,
  exchange_order_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trader profiles for social trading
CREATE TABLE public.trader_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  total_followers INTEGER NOT NULL DEFAULT 0,
  total_following INTEGER NOT NULL DEFAULT 0,
  risk_score NUMERIC DEFAULT 50,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  monthly_return NUMERIC NOT NULL DEFAULT 0,
  avg_hold_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_agents_earnings_agent_id ON public.agents_earnings(agent_id);
CREATE INDEX idx_agents_earnings_user_id ON public.agents_earnings(user_id);
CREATE INDEX idx_agents_earnings_created_at ON public.agents_earnings(created_at DESC);

CREATE INDEX idx_agent_interactions_agent_id ON public.agent_interactions(agent_id);
CREATE INDEX idx_agent_interactions_from_user ON public.agent_interactions(from_user_id);
CREATE INDEX idx_agent_interactions_status ON public.agent_interactions(status);

CREATE INDEX idx_trading_positions_user_id ON public.trading_positions(user_id);
CREATE INDEX idx_trading_positions_status ON public.trading_positions(status);

CREATE INDEX idx_execution_orders_user_id ON public.execution_orders(user_id);
CREATE INDEX idx_execution_orders_status ON public.execution_orders(status);

-- Enable RLS on all tables
ALTER TABLE public.agents_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trader_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Agents earnings policies
CREATE POLICY "Users can view earnings for their agents" ON public.agents_earnings
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid())
);

CREATE POLICY "System can create earnings records" ON public.agents_earnings
FOR INSERT WITH CHECK (true);

-- Agent interactions policies
CREATE POLICY "Users can view their interactions" ON public.agent_interactions
FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create interactions" ON public.agent_interactions
FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update their interactions" ON public.agent_interactions
FOR UPDATE USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Trading positions policies
CREATE POLICY "Users can manage their own positions" ON public.trading_positions
FOR ALL USING (user_id = auth.uid());

-- Execution strategies policies
CREATE POLICY "Users can manage their own strategies" ON public.execution_strategies
FOR ALL USING (user_id = auth.uid());

-- Execution orders policies
CREATE POLICY "Users can manage their own orders" ON public.execution_orders
FOR ALL USING (user_id = auth.uid());

-- Trader profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.trader_profiles
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own profile" ON public.trader_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own profile" ON public.trader_profiles
FOR ALL USING (user_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_agent_interactions_updated_at
BEFORE UPDATE ON public.agent_interactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_positions_updated_at
BEFORE UPDATE ON public.trading_positions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_strategies_updated_at
BEFORE UPDATE ON public.execution_strategies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_execution_orders_updated_at
BEFORE UPDATE ON public.execution_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trader_profiles_updated_at
BEFORE UPDATE ON public.trader_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();