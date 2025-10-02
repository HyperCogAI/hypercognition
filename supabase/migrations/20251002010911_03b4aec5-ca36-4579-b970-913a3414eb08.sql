-- Fix 1: Drop and recreate marketplace_developers_public view
DROP VIEW IF EXISTS public.marketplace_developers_public CASCADE;

CREATE VIEW public.marketplace_developers_public AS
SELECT 
  id,
  company_name,
  description,
  website_url,
  logo_url,
  verified,
  total_apis,
  created_at
FROM public.marketplace_developers
WHERE verified = true;

-- Fix 2: Add public SELECT policy for marketplace_developers
DROP POLICY IF EXISTS "Public can view verified developers" ON public.marketplace_developers;
CREATE POLICY "Public can view verified developers"
ON public.marketplace_developers
FOR SELECT
TO public
USING (verified = true);

-- Fix 3: Create portfolio_holdings table for better portfolio tracking
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'crypto',
  asset_name TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_buy_price NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  realized_pnl NUMERIC NOT NULL DEFAULT 0,
  unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_id, asset_type)
);

ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holdings"
ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings"
ON public.portfolio_holdings FOR DELETE USING (auth.uid() = user_id);

-- Fix 4: Create portfolio_transactions table
CREATE TABLE IF NOT EXISTS public.portfolio_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  holding_id UUID REFERENCES public.portfolio_holdings(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  fees NUMERIC NOT NULL DEFAULT 0,
  exchange TEXT,
  notes TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.portfolio_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.portfolio_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_asset ON public.portfolio_holdings(asset_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_user_id ON public.portfolio_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_holding_id ON public.portfolio_transactions(holding_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_date ON public.portfolio_transactions(transaction_date DESC);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_portfolio_holdings_updated_at ON public.portfolio_holdings;
CREATE TRIGGER update_portfolio_holdings_updated_at
BEFORE UPDATE ON public.portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();