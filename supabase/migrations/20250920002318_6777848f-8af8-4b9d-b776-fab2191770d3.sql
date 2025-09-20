-- Insert sample price history data for existing agents
INSERT INTO price_history (agent_id, timestamp, price, volume, market_cap) VALUES
-- NeuralFlow (NFLW) - trending up
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '7 days', 0.00630, 180000, 6300000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '6 days', 0.00640, 195000, 6400000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '5 days', 0.00655, 210000, 6550000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '4 days', 0.00670, 225000, 6700000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '3 days', 0.00685, 235000, 6850000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '2 days', 0.00705, 240000, 7050000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW() - INTERVAL '1 day', 0.00725, 242000, 7250000),
((SELECT id FROM agents WHERE symbol = 'NFLW'), NOW(), 0.00740, 245000, 7410000),

-- CogniCore (COGN) - volatile
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '7 days', 0.01875, 750000, 23437500),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '6 days', 0.01820, 780000, 22750000),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '5 days', 0.01795, 820000, 22437500),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '4 days', 0.01740, 850000, 21750000),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '3 days', 0.01695, 870000, 21187500),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '2 days', 0.01670, 885000, 20875000),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW() - INTERVAL '1 day', 0.01645, 890000, 20562500),
((SELECT id FROM agents WHERE symbol = 'COGN'), NOW(), 0.01630, 892000, 20370000),

-- SynthMind (SYNT) - declining
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '7 days', 0.01048, 480000, 17300000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '6 days', 0.01025, 500000, 16900000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '5 days', 0.00995, 520000, 16420000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '4 days', 0.00975, 535000, 16075000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '3 days', 0.00955, 545000, 15750000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '2 days', 0.00940, 555000, 15490000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW() - INTERVAL '1 day', 0.00930, 560000, 15330000),
((SELECT id FROM agents WHERE symbol = 'SYNT'), NOW(), 0.00920, 567000, 15190000),

-- HyperLink (HLINK) - stable high value
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '7 days', 0.12900, 1420000, 214350000),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '6 days', 0.12850, 1435000, 213517500),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '5 days', 0.12780, 1450000, 212490000),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '4 days', 0.12720, 1465000, 211740000),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '3 days', 0.12680, 1480000, 211080000),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '2 days', 0.12550, 1520000, 208737500),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW() - INTERVAL '1 day', 0.12500, 1540000, 207812500),
((SELECT id FROM agents WHERE symbol = 'HLINK'), NOW(), 0.12450, 1560000, 206930000);