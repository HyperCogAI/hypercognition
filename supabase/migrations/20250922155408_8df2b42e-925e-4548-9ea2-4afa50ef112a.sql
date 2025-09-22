-- Create advanced order execution tracking
CREATE TABLE IF NOT EXISTS public.order_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  execution_type TEXT NOT NULL CHECK (execution_type IN ('partial', 'full', 'cancelled', 'expired')),
  executed_amount NUMERIC NOT NULL DEFAULT 0,
  executed_price NUMERIC,
  fee_amount NUMERIC DEFAULT 0,
  execution_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order execution triggers
CREATE INDEX IF NOT EXISTS idx_order_executions_order_id ON public.order_executions(order_id);
CREATE INDEX IF NOT EXISTS idx_order_executions_execution_time ON public.order_executions(execution_time);

-- Update orders table with additional fields for advanced trading
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS time_in_force TEXT DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK', 'DAY')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trigger_price NUMERIC,
ADD COLUMN IF NOT EXISTS stop_loss_price NUMERIC,
ADD COLUMN IF NOT EXISTS take_profit_price NUMERIC,
ADD COLUMN IF NOT EXISTS trailing_stop_price NUMERIC,
ADD COLUMN IF NOT EXISTS trailing_stop_percent NUMERIC,
ADD COLUMN IF NOT EXISTS fill_or_kill BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reduce_only BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_order_id UUID REFERENCES public.orders(id),
ADD COLUMN IF NOT EXISTS order_source TEXT DEFAULT 'manual' CHECK (order_source IN ('manual', 'auto_sl', 'auto_tp', 'trailing_stop', 'api', 'algorithm'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_agent_type ON public.orders(agent_id, type);
CREATE INDEX IF NOT EXISTS idx_orders_parent_order ON public.orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON public.orders(expires_at) WHERE expires_at IS NOT NULL;

-- Create trigger function for child order creation (stop-loss/take-profit)
CREATE OR REPLACE FUNCTION public.create_child_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create stop-loss order if specified
  IF NEW.stop_loss_price IS NOT NULL AND NEW.status = 'filled' THEN
    INSERT INTO public.orders (
      user_id, agent_id, type, side, amount, price, 
      parent_order_id, order_source, reduce_only, status
    ) VALUES (
      NEW.user_id, 
      NEW.agent_id, 
      'stop_market', 
      CASE WHEN NEW.side = 'buy' THEN 'sell' ELSE 'buy' END,
      NEW.filled_amount,
      NEW.stop_loss_price,
      NEW.id,
      'auto_sl',
      true,
      'pending'
    );
  END IF;
  
  -- Create take-profit order if specified
  IF NEW.take_profit_price IS NOT NULL AND NEW.status = 'filled' THEN
    INSERT INTO public.orders (
      user_id, agent_id, type, side, amount, price,
      parent_order_id, order_source, reduce_only, status
    ) VALUES (
      NEW.user_id,
      NEW.agent_id,
      'limit',
      CASE WHEN NEW.side = 'buy' THEN 'sell' ELSE 'buy' END,
      NEW.filled_amount,
      NEW.take_profit_price,
      NEW.id,
      'auto_tp',
      true,
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_create_child_orders ON public.orders;
CREATE TRIGGER trigger_create_child_orders
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'filled' AND OLD.status != 'filled')
  EXECUTE FUNCTION public.create_child_orders();

-- RLS Policies for order executions
ALTER TABLE public.order_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order executions" ON public.order_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_executions.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create order executions" ON public.order_executions
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.order_executions TO authenticated;
GRANT INSERT ON public.order_executions TO service_role;