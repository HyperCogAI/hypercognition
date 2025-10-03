-- Insert remaining 2 tutorials to complete the set of 10

INSERT INTO public.tutorials (title, description, category, difficulty, duration, icon, steps, is_active) VALUES
(
  'Securing Your Account',
  'Learn essential security practices to protect your account and assets from unauthorized access.',
  'security',
  'beginner',
  '10 minutes',
  'Shield',
  '[
    {
      "id": "security-1",
      "title": "Enable Two-Factor Authentication",
      "description": "Add an extra layer of security to your account",
      "content": "Two-factor authentication (2FA) significantly increases your account security by requiring a second form of verification. Navigate to Settings > Security to enable 2FA using an authenticator app like Google Authenticator or Authy. This ensures that even if someone obtains your password, they cannot access your account without your mobile device.",
      "action": "Go to Security Settings",
      "targetSelector": ".security-settings",
      "position": "right"
    },
    {
      "id": "security-2",
      "title": "Set Up Recovery Options",
      "description": "Ensure you can recover your account if needed",
      "content": "Configure backup recovery methods including a recovery email and backup codes. Store your backup codes in a secure location - consider using a password manager or writing them down and storing them in a safe place. Never share these codes with anyone, and keep them separate from your regular login credentials.",
      "action": "Configure Recovery",
      "targetSelector": ".recovery-options",
      "position": "bottom"
    },
    {
      "id": "security-3",
      "title": "Review Active Sessions",
      "description": "Monitor and manage devices accessing your account",
      "content": "Regularly check your active sessions to ensure only your devices are logged in. You can view all active sessions, including device type, location, and last activity. If you notice any suspicious activity, immediately revoke those sessions and change your password. Consider setting up login notifications to be alerted of new sign-ins.",
      "action": "View Sessions",
      "targetSelector": ".active-sessions",
      "position": "left"
    },
    {
      "id": "security-4",
      "title": "Enable Withdrawal Protection",
      "description": "Add extra verification for fund withdrawals",
      "content": "Set up withdrawal whitelist addresses and require additional authentication for all withdrawal requests. This prevents unauthorized withdrawals even if someone gains access to your account. You can configure a time delay for new withdrawal addresses and require email/2FA confirmation for each withdrawal transaction.",
      "action": "Setup Withdrawal Protection",
      "targetSelector": ".withdrawal-settings",
      "position": "top"
    }
  ]'::jsonb,
  true
),
(
  'Risk Management Essentials',
  'Master risk management techniques to protect your portfolio and maximize long-term success.',
  'trading',
  'intermediate',
  '15 minutes',
  'TrendingDown',
  '[
    {
      "id": "risk-1",
      "title": "Understanding Position Sizing",
      "description": "Learn how to determine optimal trade sizes",
      "content": "Position sizing is crucial for managing risk. A common rule is the 1-2% rule: never risk more than 1-2% of your total portfolio on a single trade. For example, with a $10,000 portfolio, you should risk no more than $100-200 per trade. Calculate your position size based on your stop-loss distance and risk tolerance. This approach ensures that even a series of losses won''t significantly damage your portfolio.",
      "action": "Open Position Calculator",
      "targetSelector": ".position-calculator",
      "position": "right"
    },
    {
      "id": "risk-2",
      "title": "Setting Stop-Loss Orders",
      "description": "Protect yourself from excessive losses",
      "content": "Stop-loss orders automatically close your position when the price reaches a predetermined level. Place stop-losses based on technical levels (support/resistance) or a fixed percentage (typically 5-10% below your entry for swing trades). Never move your stop-loss further away from your entry price - this defeats its purpose. A good stop-loss protects your capital while giving your trade room to breathe.",
      "action": "Practice Setting Stops",
      "targetSelector": ".stop-loss-settings",
      "position": "bottom"
    },
    {
      "id": "risk-3",
      "title": "Risk-Reward Ratios",
      "description": "Evaluate trade potential before entering",
      "content": "Always assess the risk-reward ratio before taking a trade. A minimum 1:2 ratio means for every $1 you risk, you aim to make $2. Professional traders often target 1:3 or higher ratios. Calculate this by dividing your potential profit (distance to take-profit) by your potential loss (distance to stop-loss). Only take trades with favorable risk-reward ratios to ensure profitability even with a lower win rate.",
      "action": "View Trade Examples",
      "targetSelector": ".risk-reward-examples",
      "position": "left"
    },
    {
      "id": "risk-4",
      "title": "Portfolio Diversification",
      "description": "Spread risk across multiple assets",
      "content": "Never put all your eggs in one basket. Diversify across different asset classes, sectors, and market caps. A balanced portfolio might include 40% large-cap agents, 30% mid-cap, 20% small-cap, and 10% in stablecoins. Avoid overconcentration - no single position should exceed 10-15% of your portfolio. Rebalance regularly to maintain your target allocations and manage risk effectively.",
      "action": "Review Portfolio Mix",
      "targetSelector": ".portfolio-allocation",
      "position": "top"
    }
  ]'::jsonb,
  true
);