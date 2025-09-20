-- Create orders table for limit/stop orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'take_profit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  price NUMERIC,
  trigger_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'expired')),
  filled_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  fill_or_kill BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own orders" 
ON public.orders 
FOR ALL 
USING (auth.uid() = user_id);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Create analytics views table
CREATE TABLE public.agent_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('1h', '24h', '7d', '30d')),
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for analytics
ALTER TABLE public.agent_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics are viewable by everyone
CREATE POLICY "Analytics are viewable by everyone" 
ON public.agent_analytics 
FOR SELECT 
USING (true);

-- Create trigger for order updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();