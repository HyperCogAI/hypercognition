-- Reactivate two existing tutorials and add one new tutorial to reach 10 active tutorials

-- 1) Reactivate the latest versions of these tutorials
UPDATE public.tutorials t
SET is_active = true
FROM (
  SELECT title, MAX(created_at) AS max_created
  FROM public.tutorials
  WHERE title IN ('Setting Up Your Account', 'Using AI Trading Signals')
  GROUP BY title
) latest
WHERE t.title = latest.title
  AND t.created_at = latest.max_created;

-- 2) Insert a new tutorial: Advanced Order Types
INSERT INTO public.tutorials (title, description, category, difficulty, duration, icon, steps, is_active)
VALUES (
  'Advanced Order Types',
  'Learn how to use advanced order types to execute precise trading strategies.',
  'trading',
  'intermediate',
  '12 minutes',
  'TrendingUp',
  '[
    {
      "id": "orders-1",
      "title": "Limit vs Market Orders",
      "description": "Choose the right order type for your entry",
      "content": "Market orders execute immediately at the best available price, suitable for fast entries but with slippage risk. Limit orders let you set the exact price you want to buy or sell, ensuring price control but no guarantee of execution. Use market orders for high-liquidity assets and urgent entries, and limit orders when precision matters.",
      "action": "Open Trading Page",
      "targetSelector": ".trading-page",
      "position": "right"
    },
    {
      "id": "orders-2",
      "title": "Stop Loss and Stop Market",
      "description": "Protect positions automatically",
      "content": "A stop order triggers when price crosses your stop level and turns into a market order, while a stop-limit order becomes a limit order at your specified price. Stop market ensures exit but can slip in volatile markets; stop-limit avoids slippage but may not fill. Choose based on volatility and risk tolerance.",
      "action": "Configure Stop",
      "targetSelector": ".stop-loss-settings",
      "position": "bottom"
    },
    {
      "id": "orders-3",
      "title": "Take Profit and OCO",
      "description": "Automate exits with One-Cancels-the-Other",
      "content": "Take-profit orders secure gains at your target. OCO pairs a take-profit with a stop-loss so that when one executes, the other is canceled. This helps enforce disciplined exits and avoids conflicting orders. Set OCO to bracket your position with clear risk and reward levels.",
      "action": "Set OCO",
      "targetSelector": ".oco-order",
      "position": "left"
    },
    {
      "id": "orders-4",
      "title": "Trailing Stops",
      "description": "Let winners run while protecting downside",
      "content": "Trailing stops move with the price to lock in profits as the asset moves in your favor. For example, a 5% trailing stop on a long position will adjust upward as price rises and will trigger if price falls 5% from the peak. Ideal for trend following while capping risk.",
      "action": "Enable Trailing Stop",
      "targetSelector": ".trailing-stop",
      "position": "top"
    }
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;