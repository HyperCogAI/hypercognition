-- First, drop the old tables
DROP TABLE IF EXISTS public.trading_signals CASCADE;
DROP TABLE IF EXISTS public.signal_interactions CASCADE;

-- Create all required functions first (if they don't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Audit function for trading signals
CREATE OR REPLACE FUNCTION public.audit_trading_signal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if the function log_sensitive_data_access exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_sensitive_data_access') THEN
    PERFORM public.log_sensitive_data_access(
      'trading_signals',
      TG_OP,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'signal_type', COALESCE(NEW.signal_type, OLD.signal_type),
        'agent_id', COALESCE(NEW.agent_id, OLD.agent_id),
        'confidence', COALESCE(NEW.confidence, OLD.confidence),
        'status', COALESCE(NEW.status, OLD.status)
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update signal interaction counts
CREATE OR REPLACE FUNCTION public.update_signal_interaction_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE public.trading_signals
      SET likes_count = likes_count + 1
      WHERE id = NEW.signal_id;
    ELSIF NEW.interaction_type = 'share' THEN
      UPDATE public.trading_signals
      SET shares_count = shares_count + 1
      WHERE id = NEW.signal_id;
    ELSIF NEW.interaction_type = 'view' THEN
      UPDATE public.trading_signals
      SET views_count = views_count + 1
      WHERE id = NEW.signal_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE public.trading_signals
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = OLD.signal_id;
    ELSIF OLD.interaction_type = 'share' THEN
      UPDATE public.trading_signals
      SET shares_count = GREATEST(0, shares_count - 1)
      WHERE id = OLD.signal_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Now create the trading signals table with correct schema
CREATE TABLE public.trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  entry_price NUMERIC NOT NULL CHECK (entry_price > 0),
  target_price NUMERIC CHECK (target_price > 0),
  stop_loss NUMERIC CHECK (stop_loss > 0),
  reasoning TEXT NOT NULL,
  timeframe TEXT NOT NULL DEFAULT '1h',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'triggered', 'cancelled')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signal interactions table
CREATE TABLE public.signal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.trading_signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'share', 'follow')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(signal_id, user_id, interaction_type)
);

-- Create indexes
CREATE INDEX idx_trading_signals_agent_id ON public.trading_signals(agent_id);
CREATE INDEX idx_trading_signals_user_id ON public.trading_signals(user_id);
CREATE INDEX idx_trading_signals_status ON public.trading_signals(status);
CREATE INDEX idx_trading_signals_created_at ON public.trading_signals(created_at DESC);
CREATE INDEX idx_signal_interactions_signal_id ON public.signal_interactions(signal_id);
CREATE INDEX idx_signal_interactions_user_id ON public.signal_interactions(user_id);

-- Enable RLS
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_signals
CREATE POLICY "Active signals are viewable by everyone"
  ON public.trading_signals FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own signals"
  ON public.trading_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals"
  ON public.trading_signals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signals"
  ON public.trading_signals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for signal_interactions
CREATE POLICY "Users can view all interactions"
  ON public.signal_interactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own interactions"
  ON public.signal_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
  ON public.signal_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers
CREATE TRIGGER audit_trading_signal_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.trading_signals
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trading_signal();

CREATE TRIGGER update_trading_signals_updated_at
  BEFORE UPDATE ON public.trading_signals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signal_counts
  AFTER INSERT OR DELETE ON public.signal_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_signal_interaction_counts();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signal_interactions;

-- Set replica identity
ALTER TABLE public.trading_signals REPLICA IDENTITY FULL;
ALTER TABLE public.signal_interactions REPLICA IDENTITY FULL;