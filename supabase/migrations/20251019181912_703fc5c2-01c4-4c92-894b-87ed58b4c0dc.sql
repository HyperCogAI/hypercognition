-- Clear existing tutorials to start fresh
TRUNCATE TABLE tutorials CASCADE;

-- Getting Started Category
INSERT INTO tutorials (title, description, category, difficulty, duration, icon, is_active, steps) VALUES
('Platform Overview', 'Get familiar with the HyperCognition trading platform and its key features', 'getting-started', 'beginner', '8 minutes', 'Layout', true, 
'[
  {
    "id": "welcome",
    "title": "Welcome to HyperCognition",
    "description": "Your gateway to AI-powered trading",
    "content": "HyperCognition is a next-generation trading platform that combines advanced AI technology with user-friendly design. You''ll have access to real-time market data, AI trading agents, portfolio analytics, and social trading features. This tutorial will guide you through the main sections of the platform so you can start trading with confidence.",
    "action": "Explore the dashboard",
    "targetSelector": ".dashboard-container"
  },
  {
    "id": "navigation",
    "title": "Main Navigation",
    "description": "Understanding the navigation menu",
    "content": "The sidebar navigation gives you quick access to all platform features. Key sections include: Dashboard (overview), Trading (buy/sell), Portfolio (holdings), AI Agents (automated trading), Community (social features), and Analytics (performance metrics). Each section is designed to help you make informed trading decisions.",
    "action": "Click through each navigation item",
    "targetSelector": ".sidebar-nav"
  },
  {
    "id": "dashboard-overview",
    "title": "Dashboard Layout",
    "description": "Your command center",
    "content": "The dashboard provides a comprehensive overview of your trading activity. You''ll see your portfolio value, recent trades, market trends, active AI agents, and important alerts. The layout is customizable - you can rearrange widgets to match your workflow. Key metrics are updated in real-time to keep you informed.",
    "action": "Navigate to Dashboard",
    "targetSelector": ".dashboard-widgets"
  },
  {
    "id": "quick-actions",
    "title": "Quick Actions",
    "description": "Fast access to common tasks",
    "content": "Quick action buttons are located at the top of most pages for instant access to frequently used features. You can quickly place trades, create AI agents, check notifications, access your wallet, and adjust settings. These shortcuts save time and streamline your workflow.",
    "action": "Try a quick action",
    "targetSelector": ".quick-actions"
  },
  {
    "id": "search-feature",
    "title": "Global Search",
    "description": "Find anything instantly",
    "content": "Use the search bar to quickly find agents, markets, users, or features. The search supports fuzzy matching and provides relevant suggestions as you type. You can filter results by category and access detailed information with a single click. Press Cmd+K (Mac) or Ctrl+K (Windows) for quick access.",
    "action": "Try searching for an agent",
    "targetSelector": ".search-input"
  },
  {
    "id": "notifications",
    "title": "Notification Center",
    "description": "Stay informed",
    "content": "The notification center keeps you updated on important events: price alerts, trade executions, AI agent activities, social mentions, and system updates. You can customize which notifications you receive and how you''re alerted. Critical notifications are highlighted for immediate attention.",
    "action": "Open notification center",
    "targetSelector": ".notification-bell"
  }
]'::jsonb),

('Account Setup & Security', 'Secure your account and configure essential settings', 'getting-started', 'beginner', '12 minutes', 'Shield', true,
'[
  {
    "id": "profile-setup",
    "title": "Complete Your Profile",
    "description": "Add your details",
    "content": "A complete profile helps build trust in the community and unlocks all platform features. Add a display name, avatar, bio, and trading preferences. Your profile visibility settings let you control what information is public. Verified profiles get special badges and increased trading limits.",
    "action": "Go to Profile Settings",
    "targetSelector": ".profile-settings"
  },
  {
    "id": "wallet-connection",
    "title": "Connect Your Wallet",
    "description": "Link your crypto wallet",
    "content": "Connect a Web3 wallet to start trading. We support MetaMask, WalletConnect, Coinbase Wallet, and other popular options. Your wallet is used for authentication and transaction signing - we never have access to your private keys. Make sure you''re using a secure wallet with proper backup.",
    "action": "Connect wallet",
    "targetSelector": ".wallet-connect-button"
  },
  {
    "id": "2fa-setup",
    "title": "Enable Two-Factor Authentication",
    "description": "Add an extra security layer",
    "content": "Two-factor authentication (2FA) significantly increases account security. Download an authenticator app like Google Authenticator or Authy, scan the QR code, and save your backup codes in a secure location. 2FA will be required for withdrawals and sensitive account changes.",
    "action": "Enable 2FA",
    "targetSelector": ".security-settings"
  },
  {
    "id": "backup-codes",
    "title": "Save Backup Codes",
    "description": "Never lose access",
    "content": "Backup codes let you access your account if you lose your 2FA device. Download and print these codes, then store them securely offline. Each code can only be used once. You can generate new backup codes at any time from security settings.",
    "action": "Download backup codes",
    "targetSelector": ".backup-codes"
  },
  {
    "id": "password-security",
    "title": "Password Best Practices",
    "description": "Protect your account",
    "content": "Use a strong, unique password for your HyperCognition account. Requirements: minimum 14 characters, including uppercase, lowercase, numbers, and special characters. Avoid common patterns and never reuse passwords from other services. Consider using a password manager for maximum security.",
    "action": "Update password if needed",
    "targetSelector": ".password-change"
  },
  {
    "id": "privacy-settings",
    "title": "Privacy Configuration",
    "description": "Control your data",
    "content": "Configure what information is visible to other users. Options include: public portfolio, trading activity, AI agent strategies, and social interactions. You can also manage data collection preferences and opt-out of analytics. Review these settings periodically as your needs change.",
    "action": "Review privacy settings",
    "targetSelector": ".privacy-settings"
  },
  {
    "id": "session-management",
    "title": "Active Sessions",
    "description": "Monitor account access",
    "content": "View all active sessions and recent login activity from the security page. Each session shows device type, location, and last activity. You can remotely log out from any device if you notice suspicious activity. Enable email notifications for new login attempts.",
    "action": "Check active sessions",
    "targetSelector": ".session-management"
  }
]'::jsonb),

-- Trading Basics Category
('Understanding Order Types', 'Master different order types to execute trades effectively', 'trading-basics', 'beginner', '15 minutes', 'TrendingUp', true,
'[
  {
    "id": "market-orders",
    "title": "Market Orders",
    "description": "Execute immediately at current price",
    "content": "Market orders buy or sell immediately at the best available price. They guarantee execution but not price - you might pay slightly more (buying) or receive slightly less (selling) than expected during volatile conditions. Use market orders when speed is more important than price, such as entering or exiting positions quickly.",
    "action": "View market order form",
    "targetSelector": ".trading-panel"
  },
  {
    "id": "limit-orders",
    "title": "Limit Orders",
    "description": "Set your desired price",
    "content": "Limit orders specify the maximum price you''ll pay (buy) or minimum you''ll accept (sell). They give price control but don''t guarantee execution - if the market never reaches your price, the order won''t fill. Example: If an agent trades at $10, a buy limit at $9.50 only executes if the price drops to $9.50 or below.",
    "action": "Practice setting a limit order",
    "targetSelector": ".order-form"
  },
  {
    "id": "stop-loss",
    "title": "Stop-Loss Orders",
    "description": "Protect against losses",
    "content": "Stop-loss orders automatically sell when price drops to a specified level, limiting potential losses. Example: Buy at $10, set stop-loss at $9 - if price falls to $9, the position automatically closes, capping your loss at 10%. Always use stop-losses to manage risk, especially with volatile assets.",
    "action": "Set up a stop-loss",
    "targetSelector": ".stop-loss-input"
  },
  {
    "id": "take-profit",
    "title": "Take-Profit Orders",
    "description": "Lock in gains automatically",
    "content": "Take-profit orders automatically sell when price reaches your profit target. Example: Buy at $10, set take-profit at $12 - when price hits $12, position closes automatically, securing 20% gain. This removes emotion from profit-taking and ensures you capitalize on favorable moves.",
    "action": "Configure take-profit level",
    "targetSelector": ".take-profit-input"
  },
  {
    "id": "stop-limit",
    "title": "Stop-Limit Orders",
    "description": "Combine stop and limit features",
    "content": "Stop-limit orders trigger a limit order when stop price is reached. Example: Set stop at $9, limit at $8.90. When price hits $9, a limit sell at $8.90 activates. This prevents selling too low during flash crashes but risks not executing if price gaps below your limit.",
    "action": "Learn advanced order types",
    "targetSelector": ".advanced-orders"
  },
  {
    "id": "trailing-stop",
    "title": "Trailing Stop Orders",
    "description": "Follow price movements",
    "content": "Trailing stops move with favorable price action. Set a trailing distance (e.g., 5%) - if price rises, stop moves up maintaining the gap; if price falls, stop stays fixed. Example: Buy at $10 with 5% trail. Price rises to $15, stop now at $14.25. If price drops to $14.25, position closes, locking in 42.5% gain.",
    "action": "Try a trailing stop",
    "targetSelector": ".trailing-stop"
  },
  {
    "id": "order-common-mistakes",
    "title": "Common Mistakes to Avoid",
    "description": "Learn from others'' errors",
    "content": "Common order mistakes: 1) Using market orders during low liquidity (leads to slippage), 2) Setting stop-losses too tight (getting stopped out prematurely), 3) Not using stop-losses at all (unlimited downside risk), 4) Placing limit orders far from current price (tying up capital). Always review orders before submission and understand execution risks.",
    "action": "Review order checklist",
    "targetSelector": ".order-validation"
  }
]'::jsonb),

('Risk Management Fundamentals', 'Learn essential risk management strategies to protect your capital', 'trading-basics', 'intermediate', '18 minutes', 'Shield', true,
'[
  {
    "id": "risk-intro",
    "title": "Why Risk Management Matters",
    "description": "Protect your capital first",
    "content": "Successful trading isn''t about making money - it''s about not losing it. Professional traders focus on risk management above all else. The 1% rule: Never risk more than 1-2% of total capital on a single trade. With proper risk management, you can survive losing streaks and stay in the game long enough to profit from winning strategies.",
    "action": "Calculate your risk tolerance",
    "targetSelector": ".risk-calculator"
  },
  {
    "id": "position-sizing",
    "title": "Position Sizing Strategy",
    "description": "How much to invest per trade",
    "content": "Position size determines how many tokens to buy based on risk tolerance. Formula: Position Size = (Account Risk %) × (Total Capital) ÷ (Distance to Stop-Loss). Example: $10,000 account, 1% risk ($100), entry $10, stop $9. Distance = $1. Position = $100 ÷ $1 = 100 tokens. This ensures each trade risks exactly $100.",
    "action": "Use position size calculator",
    "targetSelector": ".position-calculator"
  },
  {
    "id": "risk-reward-ratio",
    "title": "Risk/Reward Ratios",
    "description": "Evaluate trade quality",
    "content": "Risk/Reward ratio compares potential profit to potential loss. Minimum acceptable: 1:2 (risk $1 to make $2). Example: Buy at $10, stop at $9 (risk $1), target $13 (reward $3) = 1:3 ratio. With 1:3 ratio, you only need 25% win rate to break even. Always calculate R:R before entering trades.",
    "action": "Analyze risk/reward scenarios",
    "targetSelector": ".rr-calculator"
  },
  {
    "id": "diversification",
    "title": "Portfolio Diversification",
    "description": "Don''t put all eggs in one basket",
    "content": "Spread capital across multiple agents and strategies to reduce risk. Correlation matters - holding 10 similar AI agents isn''t diversified. Aim for different categories, chains, and trading styles. Example allocation: 40% conservative agents, 40% moderate, 20% aggressive. Rebalance quarterly to maintain target allocation.",
    "action": "Review portfolio allocation",
    "targetSelector": ".portfolio-allocation"
  },
  {
    "id": "drawdown-management",
    "title": "Managing Drawdowns",
    "description": "Handle losing periods",
    "content": "Drawdown is peak-to-trough decline in account value. Example: Account grows to $12,000, drops to $10,000 = 16.7% drawdown. If drawdown exceeds 10%, reduce position sizes by 50%. At 20% drawdown, stop trading and reassess strategy. Recovering from large drawdowns is mathematically difficult - 50% loss requires 100% gain to break even.",
    "action": "Monitor current drawdown",
    "targetSelector": ".drawdown-tracker"
  },
  {
    "id": "leverage-risks",
    "title": "Understanding Leverage",
    "description": "Amplified gains and losses",
    "content": "Leverage magnifies both profits and losses. 5x leverage means a 10% price move results in 50% gain/loss. While tempting, leverage is the fastest way to lose capital. Recommendation: Start with no leverage. If experienced, use maximum 2-3x and only on high-confidence trades. Never use leverage without stop-losses.",
    "action": "Learn about leverage settings",
    "targetSelector": ".leverage-controls"
  },
  {
    "id": "emotional-discipline",
    "title": "Emotional Control",
    "description": "Stick to your plan",
    "content": "Emotions destroy trading accounts. Fear leads to premature exits (missing profits), greed causes oversized positions (amplified losses), revenge trading after losses compounds mistakes. Solution: Create a trading plan with rules for entry, exit, and position sizing. Follow it mechanically. Journal trades to identify emotional patterns. Take breaks after significant wins or losses.",
    "action": "Create your trading plan",
    "targetSelector": ".trading-plan"
  },
  {
    "id": "risk-checklist",
    "title": "Pre-Trade Risk Checklist",
    "description": "Verify before executing",
    "content": "Before every trade, verify: 1) Position size calculated and within limits, 2) Stop-loss set at logical level, 3) Risk/reward ratio minimum 1:2, 4) Total portfolio risk under 5%, 5) No emotional decision-making, 6) Trade aligns with strategy, 7) Sufficient liquidity to exit. Missing any item? Don''t take the trade.",
    "action": "Use the risk checklist",
    "targetSelector": ".risk-checklist"
  }
]'::jsonb),

-- AI Features Category
('Introduction to AI Agents', 'Understand how AI trading agents work and their capabilities', 'ai-features', 'beginner', '10 minutes', 'Bot', true,
'[
  {
    "id": "what-are-agents",
    "title": "What Are AI Agents?",
    "description": "Autonomous trading assistants",
    "content": "AI agents are autonomous programs that analyze markets and execute trades based on predefined strategies. They process thousands of data points instantly, identify patterns humans miss, and trade 24/7 without emotion. Each agent specializes in specific strategies (arbitrage, trend-following, market-making) and can be customized to match your risk tolerance.",
    "action": "Browse available agents",
    "targetSelector": ".agents-marketplace"
  },
  {
    "id": "agent-categories",
    "title": "Agent Categories",
    "description": "Different types for different strategies",
    "content": "Agent categories: Conservative (low risk, steady returns), Moderate (balanced risk/reward), Aggressive (high risk, high potential), Arbitrage (exploit price differences), Market Making (provide liquidity), Trend Following (ride market momentum). Each category has distinct characteristics - choose based on goals and risk tolerance.",
    "action": "Explore agent categories",
    "targetSelector": ".agent-categories"
  },
  {
    "id": "agent-metrics",
    "title": "Key Performance Metrics",
    "description": "How to evaluate agents",
    "content": "Important metrics: Total Return (overall profit/loss %), Sharpe Ratio (risk-adjusted returns, higher is better), Max Drawdown (largest peak-to-trough decline), Win Rate (% profitable trades), Average R:R (risk/reward ratio), Trading Frequency (trades per day). Compare metrics across similar agents. Past performance doesn''t guarantee future results.",
    "action": "Analyze agent metrics",
    "targetSelector": ".agent-metrics"
  },
  {
    "id": "activating-agents",
    "title": "Activating Your First Agent",
    "description": "Start automated trading",
    "content": "To activate an agent: 1) Select from marketplace, 2) Review strategy and historical performance, 3) Allocate capital (start small - test with 1-5% of portfolio), 4) Configure risk parameters (max position size, stop-loss levels), 5) Activate and monitor. You can pause or adjust settings anytime. Agents work independently but you maintain full control.",
    "action": "Activate an agent",
    "targetSelector": ".activate-agent"
  },
  {
    "id": "monitoring-agents",
    "title": "Monitoring Active Agents",
    "description": "Track performance in real-time",
    "content": "Monitor agents from the dashboard. View: current positions, recent trades, P&L (profit/loss), active orders, performance graphs. Set up alerts for significant events (large drawdowns, unusual activity, position changes). Check daily initially, then weekly once comfortable. Intervene if performance deviates significantly from historical patterns.",
    "action": "Go to agent dashboard",
    "targetSelector": ".agent-dashboard"
  },
  {
    "id": "agent-safety",
    "title": "Safety and Risk Controls",
    "description": "Built-in protections",
    "content": "Safety features: Maximum position limits (prevents over-concentration), Circuit breakers (pause trading during extreme volatility), Daily loss limits (stops agent after threshold), Automatic stop-losses (limits per-trade risk). You can customize all limits. Recommended: Start with conservative limits and gradually increase as you gain confidence.",
    "action": "Configure safety limits",
    "targetSelector": ".safety-settings"
  }
]'::jsonb),

-- Portfolio Management Category
('Portfolio Tracking & Analytics', 'Monitor and analyze your investment performance', 'portfolio', 'intermediate', '12 minutes', 'PieChart', true,
'[
  {
    "id": "portfolio-overview",
    "title": "Portfolio Dashboard Overview",
    "description": "Your financial command center",
    "content": "The portfolio dashboard provides a comprehensive view of your holdings. See total value, asset allocation, unrealized P&L, daily/weekly/monthly returns, and top performers/losers. The dashboard updates in real-time as prices change and trades execute. Customize widget layout to prioritize information most relevant to your strategy.",
    "action": "Open portfolio dashboard",
    "targetSelector": ".portfolio-dashboard"
  },
  {
    "id": "asset-allocation",
    "title": "Asset Allocation Analysis",
    "description": "Understand your portfolio composition",
    "content": "View allocation by agent category, chain, market cap, and risk level. Ideal allocation depends on goals: Conservative (70% low-risk, 30% moderate), Balanced (40% low, 40% moderate, 20% high), Aggressive (20% low, 30% moderate, 50% high). Rebalance when allocation drifts 5%+ from targets. Diversification reduces portfolio volatility.",
    "action": "View allocation breakdown",
    "targetSelector": ".allocation-chart"
  },
  {
    "id": "performance-metrics",
    "title": "Performance Metrics",
    "description": "Measure your success",
    "content": "Key metrics: Total Return (overall %), Annualized Return (yearly rate), Sharpe Ratio (return per unit of risk), Max Drawdown (worst decline), Volatility (price fluctuation), Beta (market correlation). Compare against benchmarks. Good performance: Positive returns with low volatility. Sharpe >1 is good, >2 is excellent.",
    "action": "Analyze performance metrics",
    "targetSelector": ".performance-metrics"
  },
  {
    "id": "transaction-history",
    "title": "Transaction History",
    "description": "Review all trading activity",
    "content": "Access complete transaction history: buys, sells, transfers, fees. Filter by date, agent, type, status. Export for tax purposes or external analysis. Each transaction shows: timestamp, agent, amount, price, fees, total cost, P&L. Use history to identify patterns in your trading behavior and optimize future decisions.",
    "action": "View transaction history",
    "targetSelector": ".transaction-history"
  },
  {
    "id": "tax-reporting",
    "title": "Tax Reporting Tools",
    "description": "Simplify tax preparation",
    "content": "Generate tax reports for your jurisdiction. The platform calculates: realized gains/losses, holding periods, cost basis. Export in common formats (CSV, PDF) for accountants. Track wash sales and harvest tax losses. Note: Consult a tax professional for specific advice. Requirements vary by country/region.",
    "action": "Generate tax report",
    "targetSelector": ".tax-reports"
  },
  {
    "id": "portfolio-insights",
    "title": "AI-Powered Insights",
    "description": "Get personalized recommendations",
    "content": "AI analyzes your portfolio and provides insights: over-concentrated positions, underperforming assets, rebalancing suggestions, risk warnings. Insights are personalized based on your holdings and market conditions. Review weekly to identify opportunities and risks. Act on high-priority recommendations to optimize performance.",
    "action": "View AI insights",
    "targetSelector": ".ai-insights"
  }
]'::jsonb),

-- Advanced Features Category
('Advanced Analytics Dashboard', 'Leverage data and analytics for better trading decisions', 'advanced', 'advanced', '20 minutes', 'LineChart', true,
'[
  {
    "id": "analytics-intro",
    "title": "Advanced Analytics Overview",
    "description": "Data-driven trading",
    "content": "Advanced analytics unlock deeper insights into markets and your performance. Access: sentiment analysis, on-chain metrics, whale tracking, correlation matrices, volatility indicators, volume profiles. These tools help identify trends before they''re obvious, time entries/exits better, and understand market structure. Used by professional traders for edge.",
    "action": "Open analytics dashboard",
    "targetSelector": ".analytics-dashboard"
  },
  {
    "id": "sentiment-analysis",
    "title": "Market Sentiment Analysis",
    "description": "Gauge market mood",
    "content": "Sentiment indicators aggregate social media, news, and trading activity to measure market emotion. Scale: -1 (extreme fear) to +1 (extreme greed). Strategy: Be contrarian - buy when fear is high, sell when greed peaks. Combine with technical analysis for confirmation. Sentiment often precedes price by 6-48 hours.",
    "action": "View sentiment indicators",
    "targetSelector": ".sentiment-analysis"
  },
  {
    "id": "correlation-matrix",
    "title": "Asset Correlation Analysis",
    "description": "Understand relationships",
    "content": "Correlation shows how assets move together (+1 = perfect correlation, 0 = independent, -1 = inverse). For diversification, hold assets with low/negative correlation. Example: If all your agents have +0.9 correlation, you''re not diversified. Aim for mix of correlations. Correlation changes over time - monitor monthly.",
    "action": "Analyze correlations",
    "targetSelector": ".correlation-matrix"
  },
  {
    "id": "volume-analysis",
    "title": "Volume Profile Analysis",
    "description": "Follow the smart money",
    "content": "Volume shows market participation - where big players are active. High volume areas indicate strong support/resistance. Volume precedes price - rising volume suggests incoming move. Volume patterns: Accumulation (rising volume, flat price = smart money buying), Distribution (rising volume, flat price at top = institutions selling).",
    "action": "Study volume profiles",
    "targetSelector": ".volume-analysis"
  },
  {
    "id": "whale-tracking",
    "title": "Whale Wallet Tracking",
    "description": "Monitor large holders",
    "content": "Track wallets holding significant positions (whales). Large transfers often precede price moves. Whale accumulation (buying) is bullish, distribution (selling) is bearish. Set alerts for whale activity in your holdings. Note: Whales can manipulate markets - don''t blindly follow. Use as one data point among many.",
    "action": "Monitor whale activity",
    "targetSelector": ".whale-tracker"
  },
  {
    "id": "custom-indicators",
    "title": "Custom Indicators",
    "description": "Build your own metrics",
    "content": "Create custom indicators combining multiple data sources. Examples: Combine sentiment + volume + price for trend strength score. Ratio of whale buys to sells. Portfolio correlation to market. Save and share indicators with community. Advanced users can code complex formulas. Start simple and iterate.",
    "action": "Create custom indicator",
    "targetSelector": ".custom-indicators"
  },
  {
    "id": "backtesting",
    "title": "Strategy Backtesting",
    "description": "Test before risking capital",
    "content": "Backtest strategies against historical data to validate before live trading. Input: entry rules, exit rules, position sizing, time period. Output: returns, drawdown, win rate, Sharpe ratio. Caution: Past performance doesn''t guarantee future results. Beware overfitting (too optimized for history). Test on different time periods.",
    "action": "Run a backtest",
    "targetSelector": ".backtesting-tool"
  }
]'::jsonb),

-- Security & Compliance Category
('Two-Factor Authentication Setup', 'Secure your account with 2FA protection', 'security', 'beginner', '8 minutes', 'Lock', true,
'[
  {
    "id": "2fa-importance",
    "title": "Why 2FA Matters",
    "description": "Essential security layer",
    "content": "Two-factor authentication (2FA) prevents unauthorized access even if your password is compromised. It requires both something you know (password) and something you have (phone/device). Without 2FA, accounts are vulnerable to phishing, keyloggers, and database breaches. Enable 2FA on all financial accounts - it takes 5 minutes and prevents 99.9% of account takeovers.",
    "action": "Go to security settings",
    "targetSelector": ".security-settings"
  },
  {
    "id": "authenticator-app",
    "title": "Choose Authenticator App",
    "description": "Download and install",
    "content": "Recommended authenticator apps: Google Authenticator (simple, reliable), Authy (cloud backup, multi-device), 1Password (integrates with password manager). Avoid SMS-based 2FA when possible - it''s vulnerable to SIM-swapping attacks. Download your chosen app from official app stores only. Never use third-party or modded versions.",
    "action": "Download authenticator app",
    "targetSelector": ".authenticator-links"
  },
  {
    "id": "enable-2fa",
    "title": "Enable 2FA on Your Account",
    "description": "Scan QR code",
    "content": "To enable 2FA: 1) Click ''Enable 2FA'' in security settings, 2) Open authenticator app, 3) Tap ''+'' or ''Add account'', 4) Scan QR code displayed, 5) Enter 6-digit code from app to verify, 6) Save backup codes (critical!). Your account now requires both password and code for login. Keep your device secure.",
    "action": "Enable 2FA now",
    "targetSelector": ".enable-2fa-button"
  },
  {
    "id": "backup-codes-save",
    "title": "Save Backup Codes",
    "description": "Critical recovery method",
    "content": "Backup codes are your lifeline if you lose your authenticator device. You''ll receive 10 single-use codes. Save them: 1) Download as text file, 2) Print physical copy, 3) Store in password manager. Keep offline in secure location (safe, lockbox). NEVER share codes or store in email/cloud. Each code works once. Generate new codes if compromised.",
    "action": "Download backup codes",
    "targetSelector": ".backup-codes-download"
  },
  {
    "id": "test-2fa",
    "title": "Test Your 2FA Setup",
    "description": "Verify it works",
    "content": "Test 2FA by logging out and back in. You should be prompted for authenticator code after password. Enter 6-digit code from app. If it works, you''re protected. If it fails: Check device time is synchronized, ensure you''re reading latest code, verify you scanned correct QR code. Contact support if issues persist. Don''t disable 2FA during testing.",
    "action": "Test 2FA login",
    "targetSelector": ".logout-button"
  },
  {
    "id": "recovery-process",
    "title": "Account Recovery Process",
    "description": "What if you lose access?",
    "content": "Lost authenticator device? Use backup codes to log in, then disable/re-enable 2FA with new device. Lost backup codes too? Contact support with account verification (ID, transaction history, wallet address). Recovery takes 24-72 hours for security. This delay protects you from attackers trying social engineering. Prevent this: Keep backup codes updated and accessible.",
    "action": "Review recovery options",
    "targetSelector": ".recovery-info"
  }
]'::jsonb);

-- Set created_at timestamps to have variety
UPDATE tutorials SET created_at = now() - (random() * interval '30 days');