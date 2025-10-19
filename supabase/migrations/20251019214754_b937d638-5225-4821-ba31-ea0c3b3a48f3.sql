-- Create Solana limit orders tables and functions

-- Solana liquidity pools table
CREATE TABLE IF NOT EXISTS public.solana_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_token TEXT NOT NULL,
  quote_token TEXT NOT NULL,
  base_mint TEXT NOT NULL,
  quote_mint TEXT NOT NULL,
  pool_address TEXT,
  tvl NUMERIC DEFAULT 0,
  volume_24h NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Solana limit orders table
CREATE TABLE IF NOT EXISTS public.solana_limit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pool_id UUID REFERENCES public.solana_pools(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  mint_in TEXT NOT NULL,
  mint_out TEXT NOT NULL,
  amount_in NUMERIC NOT NULL,
  limit_price NUMERIC NOT NULL,
  amount_out NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'expired', 'partial')),
  filled_amount NUMERIC DEFAULT 0,
  filled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  slippage_tolerance NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Solana order book table
CREATE TABLE IF NOT EXISTS public.solana_order_book (
  pool_id UUID PRIMARY KEY REFERENCES public.solana_pools(id),
  bid_price NUMERIC DEFAULT 0,
  ask_price NUMERIC DEFAULT 0,
  bid_volume NUMERIC DEFAULT 0,
  ask_volume NUMERIC DEFAULT 0,
  spread NUMERIC DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Solana order executions table
CREATE TABLE IF NOT EXISTS public.solana_order_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.solana_limit_orders(id) ON DELETE CASCADE,
  executed_amount NUMERIC NOT NULL,
  execution_price NUMERIC NOT NULL,
  fee_amount NUMERIC DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.solana_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_limit_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_order_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solana_order_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for solana_pools
CREATE POLICY "Pools are viewable by everyone"
  ON public.solana_pools FOR SELECT
  USING (is_active = true);

-- RLS Policies for solana_limit_orders
CREATE POLICY "Users can view their own orders"
  ON public.solana_limit_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON public.solana_limit_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders"
  ON public.solana_limit_orders FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own orders"
  ON public.solana_limit_orders FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for order book
CREATE POLICY "Order book is publicly viewable"
  ON public.solana_order_book FOR SELECT
  USING (true);

-- RLS Policies for order executions
CREATE POLICY "Users can view their order executions"
  ON public.solana_order_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solana_limit_orders
      WHERE solana_limit_orders.id = solana_order_executions.order_id
      AND solana_limit_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert executions"
  ON public.solana_order_executions FOR INSERT
  WITH CHECK (true);

-- Function to get order book summary
CREATE OR REPLACE FUNCTION public.get_solana_order_book_summary(p_pool_id UUID)
RETURNS TABLE(bid_price NUMERIC, ask_price NUMERIC, bid_volume NUMERIC, ask_volume NUMERIC, spread NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ob.bid_price,
    ob.ask_price,
    ob.bid_volume,
    ob.ask_volume,
    ob.spread
  FROM public.solana_order_book ob
  WHERE ob.pool_id = p_pool_id;
END;
$$;

-- Function to match Solana limit orders
CREATE OR REPLACE FUNCTION public.match_solana_limit_orders(p_pool_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_buy_order RECORD;
  v_sell_order RECORD;
  v_match_amount NUMERIC;
  v_execution_price NUMERIC;
  v_executions JSONB := '[]'::jsonb;
BEGIN
  FOR v_buy_order IN
    SELECT * FROM public.solana_limit_orders
    WHERE pool_id = p_pool_id
    AND order_type = 'buy'
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY limit_price DESC, created_at ASC
  LOOP
    FOR v_sell_order IN
      SELECT * FROM public.solana_limit_orders
      WHERE pool_id = p_pool_id
      AND order_type = 'sell'
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > now())
      AND limit_price <= v_buy_order.limit_price
      ORDER BY limit_price ASC, created_at ASC
    LOOP
      v_match_amount := LEAST(
        v_buy_order.amount_in - v_buy_order.filled_amount,
        v_sell_order.amount_in - v_sell_order.filled_amount
      );
      
      v_execution_price := v_sell_order.limit_price;
      
      IF v_match_amount > 0 THEN
        UPDATE public.solana_limit_orders
        SET 
          filled_amount = filled_amount + v_match_amount,
          status = CASE 
            WHEN filled_amount + v_match_amount >= amount_in THEN 'filled'
            ELSE 'partial'
          END,
          filled_at = CASE 
            WHEN filled_amount + v_match_amount >= amount_in THEN now()
            ELSE filled_at
          END,
          updated_at = now()
        WHERE id = v_buy_order.id;
        
        UPDATE public.solana_limit_orders
        SET 
          filled_amount = filled_amount + v_match_amount,
          status = CASE 
            WHEN filled_amount + v_match_amount >= amount_in THEN 'filled'
            ELSE 'partial'
          END,
          filled_at = CASE 
            WHEN filled_amount + v_match_amount >= amount_in THEN now()
            ELSE filled_at
          END,
          updated_at = now()
        WHERE id = v_sell_order.id;
        
        INSERT INTO public.solana_order_executions (order_id, executed_amount, execution_price)
        VALUES 
          (v_buy_order.id, v_match_amount, v_execution_price),
          (v_sell_order.id, v_match_amount, v_execution_price);
        
        v_executions := v_executions || jsonb_build_object(
          'buy_order_id', v_buy_order.id,
          'sell_order_id', v_sell_order.id,
          'amount', v_match_amount,
          'price', v_execution_price
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'executions', v_executions,
    'count', jsonb_array_length(v_executions)
  );
END;
$$;

-- Function to expire old orders
CREATE OR REPLACE FUNCTION public.expire_solana_limit_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.solana_limit_orders
  SET status = 'expired', updated_at = now()
  WHERE status IN ('pending', 'partial')
  AND expires_at IS NOT NULL
  AND expires_at < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$;

-- Function to update order book
CREATE OR REPLACE FUNCTION public.update_solana_order_book()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pool RECORD;
BEGIN
  FOR v_pool IN SELECT DISTINCT pool_id FROM public.solana_limit_orders WHERE pool_id IS NOT NULL LOOP
    INSERT INTO public.solana_order_book (pool_id, bid_price, ask_price, bid_volume, ask_volume, spread)
    SELECT 
      v_pool.pool_id,
      COALESCE((
        SELECT limit_price FROM public.solana_limit_orders 
        WHERE pool_id = v_pool.pool_id AND order_type = 'buy' AND status = 'pending'
        ORDER BY limit_price DESC LIMIT 1
      ), 0),
      COALESCE((
        SELECT limit_price FROM public.solana_limit_orders 
        WHERE pool_id = v_pool.pool_id AND order_type = 'sell' AND status = 'pending'
        ORDER BY limit_price ASC LIMIT 1
      ), 0),
      COALESCE((
        SELECT SUM(amount_in - filled_amount) FROM public.solana_limit_orders 
        WHERE pool_id = v_pool.pool_id AND order_type = 'buy' AND status = 'pending'
      ), 0),
      COALESCE((
        SELECT SUM(amount_in - filled_amount) FROM public.solana_limit_orders 
        WHERE pool_id = v_pool.pool_id AND order_type = 'sell' AND status = 'pending'
      ), 0),
      0
    ON CONFLICT (pool_id) DO UPDATE SET
      bid_price = EXCLUDED.bid_price,
      ask_price = EXCLUDED.ask_price,
      bid_volume = EXCLUDED.bid_volume,
      ask_volume = EXCLUDED.ask_volume,
      timestamp = now();
  END LOOP;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_solana_limit_orders_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_solana_limit_orders_updated_at
  BEFORE UPDATE ON public.solana_limit_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solana_limit_orders_updated_at();

-- Trigger to update order book
CREATE OR REPLACE FUNCTION public.trigger_update_solana_order_book()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.update_solana_order_book();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_solana_order_book_on_order_change
  AFTER INSERT OR UPDATE ON public.solana_limit_orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_update_solana_order_book();

-- Insert sample pools
INSERT INTO public.solana_pools (name, base_token, quote_token, base_mint, quote_mint, tvl, volume_24h)
VALUES
  ('SOL/USDC', 'SOL', 'USDC', 'So11111111111111111111111111111111111111112', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 85000000, 12500000),
  ('SOL/USDT', 'SOL', 'USDT', 'So11111111111111111111111111111111111111112', 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 42000000, 8200000),
  ('RAY/SOL', 'RAY', 'SOL', '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'So11111111111111111111111111111111111111112', 18000000, 3500000),
  ('ORCA/USDC', 'ORCA', 'USDC', 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6500000, 950000),
  ('BONK/SOL', 'BONK', 'SOL', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'So11111111111111111111111111111111111111112', 12000000, 2100000)
ON CONFLICT DO NOTHING;

-- Insert sample order book data
INSERT INTO public.solana_order_book (pool_id, bid_price, ask_price, bid_volume, ask_volume, spread)
SELECT 
  id,
  CASE name
    WHEN 'SOL/USDC' THEN 142.50
    WHEN 'SOL/USDT' THEN 142.45
    WHEN 'RAY/SOL' THEN 0.0045
    WHEN 'ORCA/USDC' THEN 2.85
    WHEN 'BONK/SOL' THEN 0.0000012
  END,
  CASE name
    WHEN 'SOL/USDC' THEN 142.55
    WHEN 'SOL/USDT' THEN 142.52
    WHEN 'RAY/SOL' THEN 0.0046
    WHEN 'ORCA/USDC' THEN 2.87
    WHEN 'BONK/SOL' THEN 0.0000013
  END,
  CASE name
    WHEN 'SOL/USDC' THEN 25000
    WHEN 'SOL/USDT' THEN 18000
    WHEN 'RAY/SOL' THEN 125000
    WHEN 'ORCA/USDC' THEN 45000
    WHEN 'BONK/SOL' THEN 5000000000
  END,
  CASE name
    WHEN 'SOL/USDC' THEN 23000
    WHEN 'SOL/USDT' THEN 16500
    WHEN 'RAY/SOL' THEN 118000
    WHEN 'ORCA/USDC' THEN 42000
    WHEN 'BONK/SOL' THEN 4800000000
  END,
  0.035
FROM public.solana_pools
ON CONFLICT (pool_id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_solana_limit_orders_user ON public.solana_limit_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_solana_limit_orders_pool_type_status ON public.solana_limit_orders(pool_id, order_type, status);
CREATE INDEX IF NOT EXISTS idx_solana_limit_orders_expires ON public.solana_limit_orders(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_solana_order_executions_order ON public.solana_order_executions(order_id);