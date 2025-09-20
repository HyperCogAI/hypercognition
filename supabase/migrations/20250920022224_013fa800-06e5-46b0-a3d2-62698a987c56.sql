-- Update agents table to include generated logo data
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS logo_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS logo_style TEXT;

-- Insert some mock agents with better data for logo generation
INSERT INTO public.agents (
  name, 
  symbol, 
  description, 
  price, 
  market_cap, 
  volume_24h, 
  change_24h, 
  chain,
  avatar_url,
  logo_generated,
  logo_style
) VALUES 
(
  'AI Prophet', 
  'AIPT', 
  'Advanced AI agent specializing in predictive market analysis using neural networks and sentiment analysis',
  0.0074, 
  7410000, 
  2500000, 
  15.7, 
  'Ethereum',
  '/api/placeholder/agent-aipt.png',
  false,
  'futuristic tech'
),
(
  'Quantum Trader', 
  'QTRD', 
  'Quantum computing-powered trading agent with advanced portfolio optimization algorithms',
  0.0156, 
  15600000, 
  5800000, 
  -3.2, 
  'Solana',
  '/api/placeholder/agent-qtrd.png',
  false,
  'quantum geometric'
),
(
  'DeFi Sage', 
  'DSGE', 
  'Decentralized finance specialist agent for yield farming and liquidity management strategies',
  0.0089, 
  8900000, 
  3200000, 
  8.9, 
  'Polygon',
  '/api/placeholder/agent-dsge.png',
  false,
  'defi minimalist'
),
(
  'Crypto Phoenix', 
  'CPNX', 
  'Recovery-focused trading agent that specializes in identifying undervalued assets and market rebounds',
  0.0203, 
  20300000, 
  7100000, 
  22.4, 
  'Binance Smart Chain',
  '/api/placeholder/agent-cpnx.png',
  false,
  'phoenix rising'
),
(
  'Neural Network', 
  'NNET', 
  'Deep learning AI agent utilizing complex neural architectures for pattern recognition in market data',
  0.0134, 
  13400000, 
  4600000, 
  -1.8, 
  'Avalanche',
  '/api/placeholder/agent-nnet.png',
  false,
  'neural network'
),
(
  'Alpha Hunter', 
  'ALPH', 
  'High-frequency trading agent designed to capture alpha through arbitrage and momentum strategies',
  0.0287, 
  28700000, 
  9800000, 
  12.6, 
  'Ethereum',
  '/api/placeholder/agent-alph.png',
  false,
  'predator elegant'
)
ON CONFLICT (symbol) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  market_cap = EXCLUDED.market_cap,
  volume_24h = EXCLUDED.volume_24h,
  change_24h = EXCLUDED.change_24h,
  chain = EXCLUDED.chain,
  logo_style = EXCLUDED.logo_style;