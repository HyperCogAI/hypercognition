-- Create competitions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'trading',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_fee NUMERIC DEFAULT 0,
  max_participants INTEGER,
  total_prize_pool NUMERIC DEFAULT 0,
  rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trading_signals table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  price_target NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  analysis TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competitions') THEN
    ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Competitions are viewable by everyone" 
    ON public.competitions FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trading_signals') THEN
    ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Trading signals are viewable by everyone"
    ON public.trading_signals FOR SELECT
    USING (is_active = true);
  END IF;
END $$;