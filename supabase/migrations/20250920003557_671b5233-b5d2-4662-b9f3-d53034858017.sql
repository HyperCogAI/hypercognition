-- Insert sample AI agents
INSERT INTO public.agents (id, name, symbol, description, price, market_cap, volume_24h, change_24h, chain, avatar_url) VALUES
(gen_random_uuid(), 'GPT Trader', 'GPTX', 'Advanced AI agent specialized in cryptocurrency trading using GPT-4 technology', 2.45, 12500000, 850000, 15.3, 'Base', '/placeholder.svg'),
(gen_random_uuid(), 'DeFi Oracle', 'DEFI', 'Decentralized finance prediction AI with real-time market analysis capabilities', 1.87, 9800000, 620000, -3.2, 'Base', '/placeholder.svg'),
(gen_random_uuid(), 'Quant Alpha', 'QALP', 'Quantitative analysis AI for high-frequency trading and risk management', 4.12, 18200000, 1200000, 8.7, 'Base', '/placeholder.svg'),
(gen_random_uuid(), 'Social Sentinel', 'SOCL', 'AI agent that analyzes social media sentiment for trading signals', 0.95, 4300000, 310000, -1.5, 'Base', '/placeholder.svg'),
(gen_random_uuid(), 'Arbitrage Bot', 'ARBT', 'Cross-exchange arbitrage opportunities detector with automated execution', 3.28, 15600000, 980000, 12.1, 'Base', '/placeholder.svg'),
(gen_random_uuid(), 'Risk Guardian', 'RISK', 'Portfolio risk assessment and management AI with predictive analytics', 2.76, 11400000, 720000, 5.8, 'Base', '/placeholder.svg');

-- Insert sample price history for each agent (last 24 hours)
WITH agent_ids AS (
  SELECT id FROM public.agents LIMIT 6
)
INSERT INTO public.price_history (agent_id, price, volume, market_cap, timestamp)
SELECT 
  a.id,
  (SELECT price FROM public.agents WHERE id = a.id) * (0.8 + random() * 0.4), -- Random price variation ±20%
  (SELECT volume_24h FROM public.agents WHERE id = a.id) / 24 * (0.5 + random() * 1.5), -- Random hourly volume
  (SELECT market_cap FROM public.agents WHERE id = a.id) * (0.9 + random() * 0.2), -- Random market cap variation
  now() - interval '1 hour' * generate_series(0, 23)
FROM agent_ids a
CROSS JOIN generate_series(0, 23);