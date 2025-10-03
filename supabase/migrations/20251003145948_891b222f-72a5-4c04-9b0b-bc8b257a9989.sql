-- Create custom_solana_tokens table for user-added tokens
CREATE TABLE IF NOT EXISTS public.custom_solana_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mint_address TEXT NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 9,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mint_address)
);

-- Enable RLS
ALTER TABLE public.custom_solana_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own custom tokens
CREATE POLICY "Users can view their custom tokens"
  ON public.custom_solana_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own custom tokens
CREATE POLICY "Users can add custom tokens"
  ON public.custom_solana_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom tokens
CREATE POLICY "Users can update their custom tokens"
  ON public.custom_solana_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own custom tokens
CREATE POLICY "Users can delete their custom tokens"
  ON public.custom_solana_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_solana_tokens_user_id ON public.custom_solana_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_solana_tokens_mint_address ON public.custom_solana_tokens(mint_address);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_custom_solana_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_solana_tokens_updated_at
  BEFORE UPDATE ON public.custom_solana_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_solana_tokens_updated_at();