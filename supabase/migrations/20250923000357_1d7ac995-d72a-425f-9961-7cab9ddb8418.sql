-- Seed some sample competitions
INSERT INTO public.competitions (name, description, type, status, start_date, end_date, entry_fee, max_participants, total_prize_pool, rules) VALUES
('Weekly Trading Championship', 'Compete for the highest returns in a week-long trading battle', 'trading', 'active', now() - interval '2 days', now() + interval '5 days', 100, 100, 10000, '{"max_position_size": 0.1}'),
('Risk Management Masters', 'Achieve the best risk-adjusted returns', 'trading', 'upcoming', now() + interval '7 days', now() + interval '14 days', 250, 50, 25000, '{"max_drawdown": 0.05}'),
('DeFi Strategy Battle', 'Build the best DeFi yield strategy', 'defi', 'active', now() - interval '1 day', now() + interval '30 days', 50, 200, 15000, '{"min_liquidity": 1000}');