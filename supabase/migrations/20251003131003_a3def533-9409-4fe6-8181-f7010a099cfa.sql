-- Update with real top Solana tokens and their correct mint addresses
DELETE FROM solana_tokens;

INSERT INTO solana_tokens (mint_address, name, symbol, description, decimals, is_active) VALUES
  ('So11111111111111111111111111111111111111112', 'Solana', 'SOL', 'Native Solana token', 9, true),
  ('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'USD Coin', 'USDC', 'USDC on Solana', 6, true),
  ('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'Tether USD', 'USDT', 'USDT on Solana', 6, true),
  ('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', 'Jupiter', 'JUP', 'Jupiter Exchange aggregator token', 6, true),
  ('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', 'Jito', 'JTO', 'Jito staking protocol token', 9, true),
  ('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 'Bonk', 'BONK', 'Community-driven memecoin on Solana', 5, true),
  ('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', 'dogwifhat', 'WIF', 'Dog themed memecoin', 6, true),
  ('HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', 'Pyth Network', 'PYTH', 'Pyth oracle network token', 6, true),
  ('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', 'Raydium', 'RAY', 'Raydium DEX token', 6, true),
  ('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', 'Orca', 'ORCA', 'Orca DEX token', 6, true),
  ('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'Marinade Staked SOL', 'mSOL', 'Liquid staking token', 9, true),
  ('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj', 'Lido Staked SOL', 'stSOL', 'Lido liquid staking', 9, true),
  ('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', 'Ethereum (Portal)', 'ETH', 'Wormhole wrapped Ethereum', 8, true),
  ('Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1', 'Saber', 'SBR', 'Saber stableswap protocol', 6, true),
  ('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', 'Serum', 'SRM', 'Serum DEX token', 6, true);