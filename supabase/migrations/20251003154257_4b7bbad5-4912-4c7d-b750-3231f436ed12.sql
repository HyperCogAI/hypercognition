-- Create table for tracking EVM DEX swaps
CREATE TABLE IF NOT EXISTS public.dex_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token information
  from_token_address TEXT NOT NULL,
  to_token_address TEXT NOT NULL,
  from_token_symbol TEXT NOT NULL,
  to_token_symbol TEXT NOT NULL,
  from_token_decimals INTEGER NOT NULL DEFAULT 18,
  to_token_decimals INTEGER NOT NULL DEFAULT 18,
  
  -- Swap amounts
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  
  -- Chain and transaction info
  chain_id INTEGER NOT NULL,
  chain_name TEXT,
  transaction_hash TEXT,
  
  -- Quote and execution data
  quote_data JSONB,
  slippage_percentage NUMERIC DEFAULT 1,
  price_impact_percentage NUMERIC,
  estimated_gas TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'completed', 'failed')),
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for custom EVM tokens added by users
CREATE TABLE IF NOT EXISTS public.custom_evm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token details
  token_address TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  
  -- Chain info
  chain_id INTEGER NOT NULL,
  chain_name TEXT,
  
  -- Optional metadata
  logo_uri TEXT,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate tokens per user per chain
  UNIQUE(user_id, token_address, chain_id)
);

-- Enable RLS
ALTER TABLE public.dex_swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_evm_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dex_swaps
CREATE POLICY "Users can view their own swaps"
  ON public.dex_swaps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swaps"
  ON public.dex_swaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swaps"
  ON public.dex_swaps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for custom_evm_tokens
CREATE POLICY "Users can view their own custom tokens"
  ON public.custom_evm_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom tokens"
  ON public.custom_evm_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom tokens"
  ON public.custom_evm_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom tokens"
  ON public.custom_evm_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_dex_swaps_user_id ON public.dex_swaps(user_id);
CREATE INDEX idx_dex_swaps_status ON public.dex_swaps(status);
CREATE INDEX idx_dex_swaps_chain_id ON public.dex_swaps(chain_id);
CREATE INDEX idx_dex_swaps_created_at ON public.dex_swaps(created_at DESC);
CREATE INDEX idx_custom_evm_tokens_user_id ON public.custom_evm_tokens(user_id);
CREATE INDEX idx_custom_evm_tokens_chain_id ON public.custom_evm_tokens(chain_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dex_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dex_swaps_updated_at
  BEFORE UPDATE ON public.dex_swaps
  FOR EACH ROW
  EXECUTE FUNCTION update_dex_updated_at();

CREATE TRIGGER update_custom_evm_tokens_updated_at
  BEFORE UPDATE ON public.custom_evm_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_dex_updated_at();

-- Create function to get user's swap history with stats
CREATE OR REPLACE FUNCTION get_user_dex_stats(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_swaps', COUNT(*),
    'completed_swaps', COUNT(*) FILTER (WHERE status = 'completed'),
    'total_volume_usd', COALESCE(SUM(from_amount), 0),
    'chains_used', jsonb_agg(DISTINCT chain_name),
    'recent_swaps', (
      SELECT jsonb_agg(row_to_json(recent.*))
      FROM (
        SELECT id, from_token_symbol, to_token_symbol, from_amount, to_amount, status, created_at
        FROM public.dex_swaps
        WHERE user_id = user_id_param
        ORDER BY created_at DESC
        LIMIT 10
      ) recent
    )
  ) INTO result
  FROM public.dex_swaps
  WHERE user_id = user_id_param;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;