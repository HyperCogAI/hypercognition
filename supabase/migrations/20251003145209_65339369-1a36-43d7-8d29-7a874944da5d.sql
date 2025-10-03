-- Create table for tracking Solana swaps
CREATE TABLE IF NOT EXISTS public.solana_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  input_mint TEXT NOT NULL,
  output_mint TEXT NOT NULL,
  input_amount NUMERIC NOT NULL,
  output_amount NUMERIC NOT NULL,
  input_symbol TEXT,
  output_symbol TEXT,
  slippage_bps INTEGER NOT NULL DEFAULT 50,
  price_impact NUMERIC,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  route_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.solana_swaps ENABLE ROW LEVEL SECURITY;

-- Users can view their own swaps
CREATE POLICY "Users can view their own swaps"
ON public.solana_swaps
FOR SELECT
USING (auth.uid() = user_id OR wallet_address = auth.jwt()->>'wallet_address');

-- Users can create swaps
CREATE POLICY "Users can create swaps"
ON public.solana_swaps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_solana_swaps_user_id ON public.solana_swaps(user_id);
CREATE INDEX idx_solana_swaps_wallet ON public.solana_swaps(wallet_address);
CREATE INDEX idx_solana_swaps_created_at ON public.solana_swaps(created_at DESC);