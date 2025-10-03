-- Add indexes for faster Solana token queries
CREATE INDEX IF NOT EXISTS idx_solana_tokens_market_cap ON solana_tokens(market_cap DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_solana_tokens_active ON solana_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_solana_price_history_mint_timestamp ON solana_price_history(mint_address, timestamp DESC);