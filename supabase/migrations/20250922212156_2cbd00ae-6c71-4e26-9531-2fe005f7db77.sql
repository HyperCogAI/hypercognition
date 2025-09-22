-- Enable realtime for Solana tables
ALTER TABLE public.solana_tokens REPLICA IDENTITY FULL;
ALTER TABLE public.solana_portfolios REPLICA IDENTITY FULL;
ALTER TABLE public.solana_price_history REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.solana_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solana_portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solana_price_history;

-- Insert some sample Solana tokens for testing
INSERT INTO public.solana_tokens (mint_address, name, symbol, description, decimals, price, market_cap, volume_24h, change_24h) VALUES
('So11111111111111111111111111111111111111112', 'Wrapped SOL', 'SOL', 'Native Solana token wrapped for SPL compatibility', 9, 100.50, 45000000000, 2500000000, 2.5),
('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USD Coin', 'USDC', 'Fully reserved digital dollar backed by short-term US Treasuries', 6, 1.00, 28000000000, 8500000000, 0.1),
('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'Tether USD', 'USDT', 'Digital currency backed by traditional fiat currencies', 6, 1.00, 83000000000, 42000000000, -0.05),
('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'Bonk', 'BONK', 'The first Solana dog coin for the people, by the people', 5, 0.000025, 1800000000, 125000000, 15.2),
('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', 'Ether', 'ETH', 'Ethereum wrapped for Solana', 8, 2650.00, 318000000000, 15000000000, 1.8),
('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'Marinade staked SOL', 'mSOL', 'Liquid staking token representing staked SOL', 9, 102.30, 1200000000, 45000000, 2.8);

-- Insert sample price history
INSERT INTO public.solana_price_history (token_id, mint_address, price, volume, market_cap, timestamp) 
SELECT 
    st.id,
    st.mint_address,
    st.price * (0.95 + random() * 0.1), -- Random price variation
    st.volume_24h * (0.8 + random() * 0.4), -- Random volume variation
    st.market_cap * (0.95 + random() * 0.1), -- Random market cap variation
    now() - (interval '1 hour' * generate_series(1, 24))
FROM public.solana_tokens st;