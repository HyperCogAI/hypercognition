-- Create analytics and trading tables
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  description TEXT,
  price DECIMAL(20, 8) NOT NULL DEFAULT 0,
  market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
  volume_24h DECIMAL(20, 2) NOT NULL DEFAULT 0,
  change_24h DECIMAL(5, 2) NOT NULL DEFAULT 0,
  chain TEXT NOT NULL DEFAULT 'Base',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Create trading transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  amount DECIMAL(20, 8) NOT NULL,
  price_per_token DECIMAL(20, 8) NOT NULL,
  total_value DECIMAL(20, 8) NOT NULL,
  gas_fee DECIMAL(20, 8) DEFAULT 0,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user portfolio holdings table
CREATE TABLE public.user_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents ON DELETE CASCADE,
  total_amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
  average_cost DECIMAL(20, 8) NOT NULL DEFAULT 0,
  total_invested DECIMAL(20, 8) NOT NULL DEFAULT 0,
  unrealized_pnl DECIMAL(20, 8) NOT NULL DEFAULT 0,
  realized_pnl DECIMAL(20, 8) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Create price history table for analytics
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(20, 2) NOT NULL DEFAULT 0,
  market_cap DECIMAL(20, 2) NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create policies for agents (public read, admin write)
CREATE POLICY "Agents are viewable by everyone" 
ON public.agents 
FOR SELECT 
USING (true);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user holdings
CREATE POLICY "Users can view their own holdings" 
ON public.user_holdings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own holdings" 
ON public.user_holdings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for price history (public read)
CREATE POLICY "Price history is viewable by everyone" 
ON public.price_history 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample agents
INSERT INTO public.agents (name, symbol, avatar_url, description, price, market_cap, volume_24h, change_24h) VALUES
('NeuralFlow', 'NFLW', '/placeholder.svg', 'Advanced neural network AI for decentralized trading', 0.0074, 7410000, 245000, 15.55),
('CogniCore', 'COGN', '/placeholder.svg', 'Cognitive AI agent for smart contract optimization', 0.0163, 20370000, 892000, -13.12),
('SynthMind', 'SYNT', '/placeholder.svg', 'Synthetic intelligence for market analysis', 0.0092, 15190000, 567000, -12.24),
('QuantBot', 'QBOT', '/placeholder.svg', 'Quantitative trading AI with deep learning', 0.0048, 7360000, 334000, -21.22),
('HyperLink', 'HLINK', '/placeholder.svg', 'Hyperconnected AI network protocol', 0.1245, 206930000, 1560000, -3.66),
('MetaBrain', 'MBRAIN', '/placeholder.svg', 'Meta-cognitive AI for predictive analytics', 0.0021, 3430000, 123000, -12.95),
('CryptoSage', 'SAGE', '/placeholder.svg', 'Sage AI for crypto market wisdom', 0.0894, 13391000, 456000, 8.73),
('AlphaNode', 'ALPHA', '/placeholder.svg', 'Alpha-generating AI trading node', 0.0567, 16545000, 789000, 4.21);

-- Insert sample price history for charts
INSERT INTO public.price_history (agent_id, price, volume, market_cap, timestamp) 
SELECT 
  id,
  price * (1 + (random() - 0.5) * 0.1),
  volume_24h * (0.8 + random() * 0.4),
  market_cap * (1 + (random() - 0.5) * 0.1),
  now() - interval '1 hour' * generate_series(1, 24)
FROM public.agents;