-- Create table for manual chain overrides
CREATE TABLE public.token_chain_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT,
  coingecko_id TEXT,
  primary_chain TEXT NOT NULL,
  liquidity_chain TEXT,
  contract_address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique indexes
CREATE UNIQUE INDEX idx_token_overrides_symbol 
  ON public.token_chain_overrides (LOWER(symbol)) 
  WHERE symbol IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX idx_token_overrides_coingecko_id 
  ON public.token_chain_overrides (LOWER(coingecko_id)) 
  WHERE coingecko_id IS NOT NULL AND is_active = true;

-- Enable RLS
ALTER TABLE public.token_chain_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Chain overrides are viewable by everyone"
  ON public.token_chain_overrides
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert chain overrides"
  ON public.token_chain_overrides
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update chain overrides"
  ON public.token_chain_overrides
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete chain overrides"
  ON public.token_chain_overrides
  FOR DELETE
  USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_token_overrides_updated_at
  BEFORE UPDATE ON public.token_chain_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_updated_at();

-- Seed initial high-confidence mappings
INSERT INTO public.token_chain_overrides (symbol, coingecko_id, primary_chain, notes) VALUES
  ('NEAR', 'near', 'NEAR', 'NEAR Protocol native token'),
  ('GRT', 'the-graph', 'Ethereum', 'The Graph Protocol'),
  ('LPT', 'livepeer', 'Ethereum', 'Livepeer'),
  ('THETA', 'theta-token', 'Theta', 'Theta Network'),
  ('ICP', 'internet-computer', 'Internet Computer', 'Internet Computer Protocol'),
  ('AR', 'arweave', 'Arweave', 'Arweave'),
  ('TAO', 'bittensor', 'Bittensor', 'Bittensor'),
  ('AKT', 'akash-network', 'Cosmos', 'Akash Network on Cosmos'),
  ('ARKM', 'arkham', 'Ethereum', 'Arkham'),
  ('AIOZ', 'aioz-network', 'AIOZ Network', 'AIOZ Network'),
  ('RNDR', 'render-token', 'Solana', 'Render Token (migrated to Solana)'),
  ('FET', 'fetch-ai', 'Ethereum', 'Fetch.ai'),
  ('OCEAN', 'ocean-protocol', 'Ethereum', 'Ocean Protocol'),
  ('AGIX', 'singularitynet', 'Ethereum', 'SingularityNET')
ON CONFLICT DO NOTHING;