-- Insert comprehensive tutorial data with proper JSON formatting
INSERT INTO public.tutorials (title, description, category, difficulty, duration, icon, steps) VALUES
(
  'Welcome to HyperCognition',
  'Get familiar with the platform interface and basic navigation',
  'Getting Started',
  'beginner',
  '5 min',
  'User',
  '[
    {
      "id": "step1",
      "title": "Welcome to HyperCognition",
      "description": "Welcome to the future of AI-powered trading",
      "content": "HyperCognition is a comprehensive trading platform that combines artificial intelligence with advanced market analysis. This tutorial will help you get started with the platform.",
      "action": "Click the dashboard icon in the navigation"
    },
    {
      "id": "step2",
      "title": "Navigation Overview", 
      "description": "Learn about the main navigation areas",
      "content": "The platform is organized into several key sections: Dashboard for overview, Trading for active trading, Portfolio for managing your investments, Analytics for market insights, and Social for community features.",
      "action": "Explore the navigation menu"
    },
    {
      "id": "step3",
      "title": "User Menu",
      "description": "Access your account settings and profile", 
      "content": "Click on your profile avatar in the top right to access account settings, preferences, and logout options.",
      "action": "Click on your profile avatar"
    }
  ]'::jsonb
),
(
  'Trading Fundamentals',
  'Understand basic trading concepts, order types, and market mechanics',
  'Trading Basics',
  'beginner',
  '15 min',
  'TrendingUp',
  '[
    {
      "id": "step1",
      "title": "What is Trading?",
      "description": "Understanding the basics of financial trading",
      "content": "Trading involves buying and selling financial instruments like stocks, cryptocurrencies, or forex with the goal of making a profit. It requires understanding market movements, timing, and risk management.",
      "action": "Open the Trading Dashboard"
    },
    {
      "id": "step2", 
      "title": "Market Orders vs Limit Orders",
      "description": "Learn the difference between order types",
      "content": "Market orders execute immediately at current market price. Limit orders only execute when the price reaches your specified level. Each has different uses depending on your trading strategy.",
      "action": "Explore the order form"
    },
    {
      "id": "step3",
      "title": "Reading Price Charts",
      "description": "Understand how to interpret trading charts", 
      "content": "Price charts show historical price movements and help identify trends. Learn to read candlestick patterns, support and resistance levels, and basic technical indicators.",
      "action": "Examine the price chart"
    },
    {
      "id": "step4",
      "title": "Risk Management Basics",
      "description": "Protect your capital with proper risk management",
      "content": "Never risk more than you can afford to lose. Use stop-loss orders to limit potential losses and position sizing to manage risk across your portfolio.",
      "action": "Review risk management settings"
    }
  ]'::jsonb
),
(
  'Portfolio Diversification', 
  'Learn how to build a balanced and diversified investment portfolio',
  'Portfolio Management',
  'intermediate',
  '18 min',
  'BarChart3',
  '[
    {
      "id": "step1",
      "title": "What is Diversification?",
      "description": "Understanding the importance of portfolio diversification",
      "content": "Diversification means spreading your investments across different assets, sectors, and markets to reduce risk. It is one of the most important principles of successful investing.",
      "action": "Open your Portfolio overview"
    },
    {
      "id": "step2",
      "title": "Asset Allocation",
      "description": "How to allocate capital across different asset classes",
      "content": "A typical portfolio might include stocks, bonds, cryptocurrencies, and commodities. The right allocation depends on your risk tolerance, investment timeline, and financial goals.",
      "action": "Review your current allocation"
    },
    {
      "id": "step3",
      "title": "Rebalancing Your Portfolio",
      "description": "Maintaining your target allocation over time",
      "content": "Markets move differently, causing your allocation to drift from targets. Regular rebalancing involves selling overweight positions and buying underweight ones to maintain your desired allocation.",
      "action": "Use the rebalancing tool"
    }
  ]'::jsonb
),
(
  'Copy Trading Basics',
  'Learn how to follow and copy successful traders',
  'Social Trading', 
  'beginner',
  '10 min',
  'Users',
  '[
    {
      "id": "step1",
      "title": "What is Copy Trading?",
      "description": "Understanding social trading and copy trading",
      "content": "Copy trading allows you to automatically replicate the trades of experienced traders. It is a great way to learn from professionals while potentially earning returns.",
      "action": "Open the Social Trading section"
    },
    {
      "id": "step2",
      "title": "Finding Traders to Follow",
      "description": "How to research and select traders to copy",
      "content": "Look for traders with consistent performance, reasonable risk levels, and trading styles that match your goals. Check their track record, drawdown periods, and strategy descriptions.",
      "action": "Browse top traders"
    }
  ]'::jsonb
),
(
  'Advanced Analytics',
  'Master the comprehensive analytics and reporting tools',
  'Advanced Features',
  'advanced', 
  '25 min',
  'Brain',
  '[
    {
      "id": "step1",
      "title": "Technical Analysis Tools",
      "description": "Using advanced charting and technical indicators",
      "content": "Access powerful technical analysis tools including custom indicators, drawing tools, and multiple timeframe analysis. Learn to identify patterns and trends that inform trading decisions.",
      "action": "Open Advanced Analytics"
    },
    {
      "id": "step2",
      "title": "Risk Analytics", 
      "description": "Understanding portfolio risk metrics",
      "content": "Analyze Value at Risk (VaR), Sharpe ratio, maximum drawdown, and correlation matrices. These metrics help you understand and manage the risk in your portfolio.",
      "action": "Explore risk metrics"
    }
  ]'::jsonb
),
(
  'Using AI Trading Signals',
  'Learn how to interpret and act on AI-generated trading signals',
  'Trading Basics',
  'intermediate',
  '12 min',
  'Bot',
  '[
    {
      "id": "step1",
      "title": "Understanding AI Signals",
      "description": "What are AI trading signals and how they work",
      "content": "Our AI analyzes market data, news sentiment, and technical patterns to generate trading signals. These signals indicate potential trading opportunities with probability scores.",
      "action": "Open the AI Signals panel"
    },
    {
      "id": "step2",
      "title": "Signal Confidence Levels",
      "description": "Interpreting signal strength and confidence",
      "content": "Each signal comes with a confidence level (Low, Medium, High). Higher confidence signals have historically been more accurate, but always consider multiple factors before trading.",
      "action": "Review current signals"
    }
  ]'::jsonb
),
(
  'Setting Up Your Account',
  'Complete your profile, enable security features, and customize preferences',
  'Getting Started',
  'beginner',
  '8 min',
  'Shield',
  '[
    {
      "id": "step1",
      "title": "Profile Completion",
      "description": "Complete your profile information",
      "content": "A complete profile helps us provide better personalized recommendations and enables all platform features. Add your trading experience level and investment goals.",
      "action": "Navigate to Profile Settings"
    },
    {
      "id": "step2",
      "title": "Enable Two-Factor Authentication",
      "description": "Secure your account with 2FA",
      "content": "Two-factor authentication adds an extra layer of security to your account. We recommend enabling it to protect your trading activities and portfolio data.",
      "action": "Enable 2FA in Security Settings"
    }
  ]'::jsonb
);