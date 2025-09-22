-- Create real-time market data tables
CREATE TABLE IF NOT EXISTS public.market_data_feeds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  volume_24h numeric DEFAULT 0,
  high_24h numeric DEFAULT 0,
  low_24h numeric DEFAULT 0,
  open_24h numeric DEFAULT 0,
  change_24h numeric DEFAULT 0,
  change_percent_24h numeric DEFAULT 0,
  bid_price numeric,
  ask_price numeric,
  spread numeric,
  last_trade_size numeric,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  source text DEFAULT 'internal',
  metadata jsonb DEFAULT '{}'
);

-- Create order book table for bid/ask data
CREATE TABLE IF NOT EXISTS public.order_book (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  price numeric NOT NULL,
  size numeric NOT NULL,
  total numeric NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  level_index integer NOT NULL DEFAULT 1
);

-- Create market tickers for real-time updates
CREATE TABLE IF NOT EXISTS public.market_tickers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  last_price numeric NOT NULL,
  best_bid numeric,
  best_ask numeric,
  volume_24h numeric DEFAULT 0,
  trades_count_24h integer DEFAULT 0,
  high_24h numeric DEFAULT 0,
  low_24h numeric DEFAULT 0,
  change_24h numeric DEFAULT 0,
  change_percent_24h numeric DEFAULT 0,
  vwap_24h numeric,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agent_id)
);

-- Create market trades table
CREATE TABLE IF NOT EXISTS public.market_trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  trade_id text UNIQUE,
  price numeric NOT NULL,
  size numeric NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  is_maker boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.market_data_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_trades ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Market data is viewable by everyone" 
ON public.market_data_feeds FOR SELECT USING (true);

CREATE POLICY "Order book is viewable by everyone" 
ON public.order_book FOR SELECT USING (true);

CREATE POLICY "Market tickers are viewable by everyone" 
ON public.market_tickers FOR SELECT USING (true);

CREATE POLICY "Market trades are viewable by everyone" 
ON public.market_trades FOR SELECT USING (true);

-- System policies for data insertion
CREATE POLICY "System can manage market data" 
ON public.market_data_feeds FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "System can manage order book" 
ON public.order_book FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "System can manage market tickers" 
ON public.market_tickers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "System can manage market trades" 
ON public.market_trades FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_data_agent_timestamp ON public.market_data_feeds(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_order_book_agent_side ON public.order_book(agent_id, side, price DESC);
CREATE INDEX IF NOT EXISTS idx_market_tickers_agent ON public.market_tickers(agent_id);
CREATE INDEX IF NOT EXISTS idx_market_trades_agent_timestamp ON public.market_trades(agent_id, timestamp DESC);

-- Function to update market ticker data
CREATE OR REPLACE FUNCTION public.update_market_ticker()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update or insert market ticker data
  INSERT INTO public.market_tickers (
    agent_id, last_price, volume_24h, high_24h, low_24h, 
    change_24h, change_percent_24h, updated_at
  ) VALUES (
    NEW.agent_id, NEW.price, NEW.volume_24h, NEW.high_24h, NEW.low_24h,
    NEW.change_24h, NEW.change_percent_24h, NEW.timestamp
  )
  ON CONFLICT (agent_id) 
  DO UPDATE SET
    last_price = NEW.price,
    volume_24h = NEW.volume_24h,
    high_24h = GREATEST(market_tickers.high_24h, NEW.high_24h),
    low_24h = LEAST(market_tickers.low_24h, NEW.low_24h),
    change_24h = NEW.change_24h,
    change_percent_24h = NEW.change_percent_24h,
    updated_at = NEW.timestamp;
    
  RETURN NEW;
END;
$function$;

-- Create trigger for ticker updates
DROP TRIGGER IF EXISTS trigger_update_market_ticker ON public.market_data_feeds;
CREATE TRIGGER trigger_update_market_ticker
  AFTER INSERT ON public.market_data_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_market_ticker();

-- Function to clean old market data
CREATE OR REPLACE FUNCTION public.cleanup_old_market_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Keep only last 24 hours of market data feeds
  DELETE FROM public.market_data_feeds 
  WHERE timestamp < now() - INTERVAL '24 hours';
  
  -- Keep only last 1 hour of order book data
  DELETE FROM public.order_book 
  WHERE timestamp < now() - INTERVAL '1 hour';
  
  -- Keep only last 24 hours of trades
  DELETE FROM public.market_trades 
  WHERE timestamp < now() - INTERVAL '24 hours';
END;
$function$;

-- Enable realtime for market data
ALTER TABLE public.market_data_feeds REPLICA IDENTITY FULL;
ALTER TABLE public.order_book REPLICA IDENTITY FULL;
ALTER TABLE public.market_tickers REPLICA IDENTITY FULL;
ALTER TABLE public.market_trades REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.market_data_feeds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_book;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_tickers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market_trades;