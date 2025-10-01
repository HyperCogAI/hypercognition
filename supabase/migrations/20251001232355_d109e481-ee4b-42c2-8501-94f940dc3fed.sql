-- Create crypto watchlist table for favorites
CREATE TABLE IF NOT EXISTS public.crypto_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crypto_id TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  crypto_symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, crypto_id)
);

-- Create crypto price alerts table
CREATE TABLE IF NOT EXISTS public.crypto_price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crypto_id TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  crypto_symbol TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC,
  is_active BOOLEAN DEFAULT true,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create crypto portfolio table
CREATE TABLE IF NOT EXISTS public.crypto_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crypto_id TEXT NOT NULL,
  crypto_name TEXT NOT NULL,
  crypto_symbol TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  purchase_price NUMERIC NOT NULL CHECK (purchase_price > 0),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  exchange TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crypto_watchlist
CREATE POLICY "Users can manage their own watchlist"
  ON public.crypto_watchlist
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crypto_price_alerts
CREATE POLICY "Users can manage their own price alerts"
  ON public.crypto_price_alerts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for crypto_portfolio
CREATE POLICY "Users can manage their own portfolio"
  ON public.crypto_portfolio
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crypto_watchlist_user ON public.crypto_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_price_alerts_user ON public.crypto_price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_user ON public.crypto_portfolio(user_id);

-- Create updated_at trigger for portfolio
CREATE OR REPLACE TRIGGER update_crypto_portfolio_updated_at
  BEFORE UPDATE ON public.crypto_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();