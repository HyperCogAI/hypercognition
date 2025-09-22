-- Add advanced order types and features to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stop_loss_price numeric,
ADD COLUMN IF NOT EXISTS take_profit_price numeric,
ADD COLUMN IF NOT EXISTS trailing_stop_percent numeric,
ADD COLUMN IF NOT EXISTS trailing_stop_price numeric,
ADD COLUMN IF NOT EXISTS order_source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS parent_order_id uuid,
ADD COLUMN IF NOT EXISTS time_in_force text DEFAULT 'GTC',
ADD COLUMN IF NOT EXISTS reduce_only boolean DEFAULT false;

-- Create index for parent orders
CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON public.orders(parent_order_id);

-- Create order execution logs table
CREATE TABLE IF NOT EXISTS public.order_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  execution_type text NOT NULL, -- 'partial', 'full', 'cancelled', 'rejected'
  executed_amount numeric NOT NULL DEFAULT 0,
  executed_price numeric,
  fee_amount numeric DEFAULT 0,
  execution_time timestamp with time zone NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on order executions
ALTER TABLE public.order_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for order executions
CREATE POLICY "Users can view their own order executions" 
ON public.order_executions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_executions.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "System can create order executions" 
ON public.order_executions 
FOR INSERT 
WITH CHECK (true);

-- Create function to automatically create child orders for stop-loss/take-profit
CREATE OR REPLACE FUNCTION public.create_child_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Create trigger for automatic child order creation
DROP TRIGGER IF EXISTS trigger_create_child_orders ON public.orders;
CREATE TRIGGER trigger_create_child_orders
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status != NEW.status AND NEW.status = 'filled')
  EXECUTE FUNCTION public.create_child_orders();

-- Add foreign key constraint for parent orders
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_parent_order 
FOREIGN KEY (parent_order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Add constraint for time_in_force values
ALTER TABLE public.orders 
ADD CONSTRAINT check_time_in_force 
CHECK (time_in_force IN ('GTC', 'IOC', 'FOK', 'GTD'));

-- Add constraint for order_source values
ALTER TABLE public.orders 
ADD CONSTRAINT check_order_source 
CHECK (order_source IN ('manual', 'auto_sl', 'auto_tp', 'trailing_stop', 'api'));

-- Enable realtime for orders and order_executions
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_executions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_executions;