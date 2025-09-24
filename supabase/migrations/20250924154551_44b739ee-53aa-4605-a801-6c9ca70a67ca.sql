-- Create marketplace developers table
CREATE TABLE public.marketplace_developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  total_apis INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace API endpoints table
CREATE TABLE public.marketplace_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL REFERENCES marketplace_developers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  base_url TEXT NOT NULL,
  pricing_model TEXT NOT NULL DEFAULT 'freemium',
  price_per_request NUMERIC DEFAULT 0,
  monthly_price NUMERIC DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_subscribers INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user relationships table for social features
CREATE TABLE public.user_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create social activity feed table
CREATE TABLE public.social_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  privacy_level TEXT NOT NULL DEFAULT 'public',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Marketplace data is viewable by everyone" 
ON public.marketplace_developers 
FOR SELECT 
USING (true);

CREATE POLICY "Developers can manage their own data" 
ON public.marketplace_developers 
FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Endpoints are viewable by everyone" 
ON public.marketplace_endpoints 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Developers can manage their endpoints" 
ON public.marketplace_endpoints 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM marketplace_developers 
  WHERE id = marketplace_endpoints.developer_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can view relationships" 
ON public.user_relationships 
FOR SELECT 
USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "Users can manage their relationships" 
ON public.user_relationships 
FOR ALL 
USING (follower_id = auth.uid());

CREATE POLICY "Social activities are viewable based on privacy" 
ON public.social_activities 
FOR SELECT 
USING (
  privacy_level = 'public' OR 
  user_id = auth.uid() OR
  (privacy_level = 'followers' AND EXISTS (
    SELECT 1 FROM user_relationships 
    WHERE following_id = social_activities.user_id 
    AND follower_id = auth.uid() 
    AND status = 'active'
  ))
);

CREATE POLICY "Users can manage their activities" 
ON public.social_activities 
FOR ALL 
USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_marketplace_developers_updated_at
BEFORE UPDATE ON public.marketplace_developers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_endpoints_updated_at
BEFORE UPDATE ON public.marketplace_endpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.marketplace_developers (user_id, company_name, description, website_url, verified, total_apis, total_revenue) VALUES
('00000000-0000-0000-0000-000000000001', 'CryptoAPI Solutions', 'Leading provider of cryptocurrency data APIs', 'https://cryptoapi.com', true, 12, 50000),
('00000000-0000-0000-0000-000000000002', 'TradingData Inc', 'Real-time trading data and analytics', 'https://tradingdata.io', true, 8, 75000),
('00000000-0000-0000-0000-000000000003', 'BlockchainTools', 'Blockchain infrastructure APIs', 'https://blockchaintools.dev', false, 5, 25000);

INSERT INTO public.marketplace_endpoints (developer_id, name, description, category, base_url, pricing_model, price_per_request, monthly_price, rate_limit_per_minute, total_subscribers, average_rating) VALUES
((SELECT id FROM marketplace_developers WHERE company_name = 'CryptoAPI Solutions'), 'Crypto Price Feed', 'Real-time cryptocurrency prices', 'Market Data', 'https://api.cryptoapi.com/v1/prices', 'pay-per-use', 0.001, NULL, 1000, 1250, 4.8),
((SELECT id FROM marketplace_developers WHERE company_name = 'CryptoAPI Solutions'), 'Portfolio Analytics', 'Advanced portfolio analysis tools', 'Analytics', 'https://api.cryptoapi.com/v1/portfolio', 'subscription', NULL, 99.99, 500, 890, 4.6),
((SELECT id FROM marketplace_developers WHERE company_name = 'TradingData Inc'), 'Order Book Stream', 'Real-time order book data', 'Trading', 'https://api.tradingdata.io/v2/orderbook', 'freemium', 0.002, 49.99, 2000, 2100, 4.9),
((SELECT id FROM marketplace_developers WHERE company_name = 'BlockchainTools'), 'Transaction Monitor', 'Blockchain transaction monitoring', 'Monitoring', 'https://api.blockchaintools.dev/v1/monitor', 'subscription', NULL, 199.99, 100, 150, 4.2);