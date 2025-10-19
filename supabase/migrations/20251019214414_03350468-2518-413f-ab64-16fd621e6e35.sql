-- Add order execution tracking and matching engine functions

-- Table to track order executions/fills
CREATE TABLE IF NOT EXISTS public.defi_order_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.defi_limit_orders(id) ON DELETE CASCADE,
  executed_amount NUMERIC NOT NULL,
  execution_price NUMERIC NOT NULL,
  fee_amount NUMERIC DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.defi_order_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order executions
CREATE POLICY "Users can view their order executions"
  ON public.defi_order_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.defi_limit_orders
      WHERE defi_limit_orders.id = defi_order_executions.order_id
      AND defi_limit_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert executions"
  ON public.defi_order_executions FOR INSERT
  WITH CHECK (true);

-- Function to match and execute limit orders
CREATE OR REPLACE FUNCTION public.match_limit_orders(p_pool_id UUID)
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
  -- Get pending buy orders sorted by best price (highest first)
  FOR v_buy_order IN
    SELECT * FROM public.defi_limit_orders
    WHERE pool_id = p_pool_id
    AND order_type = 'buy'
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY limit_price DESC, created_at ASC
  LOOP
    -- Find matching sell orders (lowest price first)
    FOR v_sell_order IN
      SELECT * FROM public.defi_limit_orders
      WHERE pool_id = p_pool_id
      AND order_type = 'sell'
      AND status = 'pending'
      AND (expires_at IS NULL OR expires_at > now())
      AND limit_price <= v_buy_order.limit_price
      ORDER BY limit_price ASC, created_at ASC
    LOOP
      -- Calculate match amount (minimum of remaining amounts)
      v_match_amount := LEAST(
        v_buy_order.amount_in - v_buy_order.filled_amount,
        v_sell_order.amount_in - v_sell_order.filled_amount
      );
      
      -- Use the sell order's price (price taker gets better deal)
      v_execution_price := v_sell_order.limit_price;
      
      IF v_match_amount > 0 THEN
        -- Update buy order
        UPDATE public.defi_limit_orders
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
        
        -- Update sell order
        UPDATE public.defi_limit_orders
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
        
        -- Record executions
        INSERT INTO public.defi_order_executions (order_id, executed_amount, execution_price)
        VALUES 
          (v_buy_order.id, v_match_amount, v_execution_price),
          (v_sell_order.id, v_match_amount, v_execution_price);
        
        -- Add to results
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
CREATE OR REPLACE FUNCTION public.expire_limit_orders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.defi_limit_orders
  SET status = 'expired', updated_at = now()
  WHERE status IN ('pending', 'partial')
  AND expires_at IS NOT NULL
  AND expires_at < now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$;

-- Function to update order book from recent trades
CREATE OR REPLACE FUNCTION public.update_order_book_from_orders()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pool RECORD;
BEGIN
  FOR v_pool IN SELECT DISTINCT pool_id FROM public.defi_limit_orders LOOP
    INSERT INTO public.defi_order_book (pool_id, bid_price, ask_price, bid_volume, ask_volume, spread)
    SELECT 
      v_pool.pool_id,
      COALESCE((
        SELECT limit_price 
        FROM public.defi_limit_orders 
        WHERE pool_id = v_pool.pool_id 
        AND order_type = 'buy' 
        AND status = 'pending'
        ORDER BY limit_price DESC 
        LIMIT 1
      ), 0) as bid_price,
      COALESCE((
        SELECT limit_price 
        FROM public.defi_limit_orders 
        WHERE pool_id = v_pool.pool_id 
        AND order_type = 'sell' 
        AND status = 'pending'
        ORDER BY limit_price ASC 
        LIMIT 1
      ), 0) as ask_price,
      COALESCE((
        SELECT SUM(amount_in - filled_amount)
        FROM public.defi_limit_orders 
        WHERE pool_id = v_pool.pool_id 
        AND order_type = 'buy' 
        AND status = 'pending'
      ), 0) as bid_volume,
      COALESCE((
        SELECT SUM(amount_in - filled_amount)
        FROM public.defi_limit_orders 
        WHERE pool_id = v_pool.pool_id 
        AND order_type = 'sell' 
        AND status = 'pending'
      ), 0) as ask_volume,
      CASE 
        WHEN (
          SELECT limit_price FROM public.defi_limit_orders 
          WHERE pool_id = v_pool.pool_id AND order_type = 'buy' AND status = 'pending'
          ORDER BY limit_price DESC LIMIT 1
        ) > 0 THEN
          ABS((
            SELECT limit_price FROM public.defi_limit_orders 
            WHERE pool_id = v_pool.pool_id AND order_type = 'sell' AND status = 'pending'
            ORDER BY limit_price ASC LIMIT 1
          ) - (
            SELECT limit_price FROM public.defi_limit_orders 
            WHERE pool_id = v_pool.pool_id AND order_type = 'buy' AND status = 'pending'
            ORDER BY limit_price DESC LIMIT 1
          )) / (
            SELECT limit_price FROM public.defi_limit_orders 
            WHERE pool_id = v_pool.pool_id AND order_type = 'buy' AND status = 'pending'
            ORDER BY limit_price DESC LIMIT 1
          ) * 100
        ELSE 0
      END as spread
    ON CONFLICT (pool_id) DO UPDATE SET
      bid_price = EXCLUDED.bid_price,
      ask_price = EXCLUDED.ask_price,
      bid_volume = EXCLUDED.bid_volume,
      ask_volume = EXCLUDED.ask_volume,
      spread = EXCLUDED.spread,
      timestamp = now();
  END LOOP;
END;
$$;

-- Trigger to update order book after order changes
CREATE OR REPLACE FUNCTION public.trigger_update_order_book()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.update_order_book_from_orders();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_order_book_on_order_change ON public.defi_limit_orders;
CREATE TRIGGER update_order_book_on_order_change
  AFTER INSERT OR UPDATE ON public.defi_limit_orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_update_order_book();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_limit_orders_pool_type_status 
  ON public.defi_limit_orders(pool_id, order_type, status);
CREATE INDEX IF NOT EXISTS idx_limit_orders_expires_at 
  ON public.defi_limit_orders(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_executions_order_id 
  ON public.defi_order_executions(order_id);