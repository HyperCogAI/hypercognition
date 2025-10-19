-- Create limit orders table for DeFi trading
CREATE TABLE IF NOT EXISTS public.defi_limit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.defi_pools(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  amount_in NUMERIC NOT NULL CHECK (amount_in > 0),
  limit_price NUMERIC NOT NULL CHECK (limit_price > 0),
  amount_out NUMERIC NOT NULL CHECK (amount_out > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'expired', 'partial')),
  filled_amount NUMERIC DEFAULT 0 CHECK (filled_amount >= 0),
  filled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  slippage_tolerance NUMERIC DEFAULT 1 CHECK (slippage_tolerance >= 0 AND slippage_tolerance <= 100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_defi_limit_orders_user_id ON public.defi_limit_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_defi_limit_orders_pool_id ON public.defi_limit_orders(pool_id);
CREATE INDEX IF NOT EXISTS idx_defi_limit_orders_status ON public.defi_limit_orders(status);

-- Enable RLS
ALTER TABLE public.defi_limit_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own limit orders"
  ON public.defi_limit_orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own limit orders"
  ON public.defi_limit_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own limit orders"
  ON public.defi_limit_orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own limit orders"
  ON public.defi_limit_orders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create order book table for real-time price tracking
CREATE TABLE IF NOT EXISTS public.defi_order_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.defi_pools(id) ON DELETE CASCADE,
  token_pair TEXT NOT NULL,
  bid_price NUMERIC NOT NULL,
  ask_price NUMERIC NOT NULL,
  bid_volume NUMERIC NOT NULL DEFAULT 0,
  ask_volume NUMERIC NOT NULL DEFAULT 0,
  spread NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for order book
CREATE INDEX IF NOT EXISTS idx_defi_order_book_pool_id ON public.defi_order_book(pool_id);
CREATE INDEX IF NOT EXISTS idx_defi_order_book_timestamp ON public.defi_order_book(timestamp DESC);

-- Enable RLS for order book (public read)
ALTER TABLE public.defi_order_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order book is publicly readable"
  ON public.defi_order_book
  FOR SELECT
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_defi_limit_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_defi_limit_orders_updated_at
  BEFORE UPDATE ON public.defi_limit_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_defi_limit_orders_updated_at();

-- Create function to get order book summary
CREATE OR REPLACE FUNCTION get_order_book_summary(p_pool_id UUID)
RETURNS TABLE (
  bid_price NUMERIC,
  ask_price NUMERIC,
  bid_volume NUMERIC,
  ask_volume NUMERIC,
  spread NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ob.bid_price,
    ob.ask_price,
    ob.bid_volume,
    ob.ask_volume,
    ob.spread
  FROM public.defi_order_book ob
  WHERE ob.pool_id = p_pool_id
  ORDER BY ob.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample pools if none exist
INSERT INTO public.defi_pools (name, type, base_token, quote_token, apy, tvl, rewards_token, is_active)
SELECT * FROM (VALUES
  ('ETH/USDC Liquidity Pool', 'liquidity_mining', 'ETH', 'USDC', 12.5, 5200000, 'HCG', true),
  ('WBTC/ETH Liquidity Pool', 'liquidity_mining', 'WBTC', 'ETH', 14.2, 4100000, 'HCG', true),
  ('USDC/USDT Stable Pool', 'yield_farming', 'USDC', 'USDT', 8.5, 7500000, 'HCG', true),
  ('ETH/USDT Liquidity Pool', 'liquidity_mining', 'ETH', 'USDT', 13.8, 3800000, 'HCG', true),
  ('DAI/USDC Stable Pool', 'yield_farming', 'DAI', 'USDC', 9.2, 2900000, 'HCG', true)
) AS v(name, type, base_token, quote_token, apy, tvl, rewards_token, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.defi_pools LIMIT 1);