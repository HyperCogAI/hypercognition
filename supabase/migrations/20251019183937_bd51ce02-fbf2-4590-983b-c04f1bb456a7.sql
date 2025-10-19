-- Insert sample order book data for all active pools
INSERT INTO public.defi_order_book (pool_id, token_pair, bid_price, ask_price, bid_volume, ask_volume, spread)
SELECT 
  id,
  base_token || '/' || quote_token,
  CASE 
    WHEN base_token = 'ETH' THEN 3950.00
    WHEN base_token = 'WBTC' THEN 65000.00
    WHEN base_token = 'USDC' THEN 1.0000
    WHEN base_token = 'DAI' THEN 0.9998
    ELSE 1.00
  END as bid_price,
  CASE 
    WHEN base_token = 'ETH' THEN 3955.00
    WHEN base_token = 'WBTC' THEN 65050.00
    WHEN base_token = 'USDC' THEN 1.0002
    WHEN base_token = 'DAI' THEN 1.0000
    ELSE 1.01
  END as ask_price,
  CASE 
    WHEN base_token = 'ETH' THEN 125000
    WHEN base_token = 'WBTC' THEN 85000
    WHEN base_token = 'USDC' THEN 2500000
    WHEN base_token = 'DAI' THEN 1800000
    ELSE 100000
  END as bid_volume,
  CASE 
    WHEN base_token = 'ETH' THEN 118000
    WHEN base_token = 'WBTC' THEN 79000
    WHEN base_token = 'USDC' THEN 2300000
    WHEN base_token = 'DAI' THEN 1700000
    ELSE 95000
  END as ask_volume,
  CASE 
    WHEN base_token = 'ETH' THEN 0.13
    WHEN base_token = 'WBTC' THEN 0.08
    WHEN base_token = 'USDC' THEN 0.02
    WHEN base_token = 'DAI' THEN 0.02
    ELSE 0.10
  END as spread
FROM public.defi_pools
WHERE is_active = true
ON CONFLICT DO NOTHING;