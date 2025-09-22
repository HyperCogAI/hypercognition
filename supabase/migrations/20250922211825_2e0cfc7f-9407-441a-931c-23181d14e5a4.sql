-- Create table for Solana tokens/agents
CREATE TABLE public.solana_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mint_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  decimals INTEGER NOT NULL DEFAULT 9,
  price NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  change_24h NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.solana_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing tokens (public)
CREATE POLICY "Solana tokens are viewable by everyone" 
ON public.solana_tokens 
FOR SELECT 
USING (is_active = true);

-- Create table for Solana portfolios
CREATE TABLE public.solana_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_id UUID NOT NULL REFERENCES public.solana_tokens(id),
  mint_address TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solana_portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for solana portfolios
CREATE POLICY "Users can manage their own Solana portfolio" 
ON public.solana_portfolios 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create table for Solana price history
CREATE TABLE public.solana_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.solana_tokens(id),
  mint_address TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solana_price_history ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing price history
CREATE POLICY "Solana price history is viewable by everyone" 
ON public.solana_price_history 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_solana_tokens_symbol ON public.solana_tokens(symbol);
CREATE INDEX idx_solana_tokens_mint_address ON public.solana_tokens(mint_address);
CREATE INDEX idx_solana_portfolios_user_id ON public.solana_portfolios(user_id);
CREATE INDEX idx_solana_portfolios_token_id ON public.solana_portfolios(token_id);
CREATE INDEX idx_solana_price_history_token_id ON public.solana_price_history(token_id);
CREATE INDEX idx_solana_price_history_timestamp ON public.solana_price_history(timestamp);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_solana_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_solana_tokens_updated_at
  BEFORE UPDATE ON public.solana_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solana_updated_at_column();

CREATE TRIGGER update_solana_portfolios_updated_at
  BEFORE UPDATE ON public.solana_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solana_updated_at_column();