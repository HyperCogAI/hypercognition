-- Chain Metrics Table
CREATE TABLE IF NOT EXISTS public.chain_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain TEXT NOT NULL CHECK (chain IN ('solana', 'ethereum', 'base', 'polygon')),
  tvl NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  transactions_24h INTEGER NOT NULL DEFAULT 0,
  active_addresses_24h INTEGER NOT NULL DEFAULT 0,
  avg_gas_price NUMERIC NOT NULL DEFAULT 0,
  block_time NUMERIC NOT NULL DEFAULT 0,
  tps NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(chain, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_chain_metrics_chain ON public.chain_metrics(chain);
CREATE INDEX IF NOT EXISTS idx_chain_metrics_timestamp ON public.chain_metrics(timestamp DESC);

-- Token Metrics Table
CREATE TABLE IF NOT EXISTS public.token_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  price_change_24h NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  liquidity NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC NOT NULL DEFAULT 0,
  holders INTEGER NOT NULL DEFAULT 0,
  transactions_24h INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_token_metrics_chain ON public.token_metrics(chain);
CREATE INDEX IF NOT EXISTS idx_token_metrics_symbol ON public.token_metrics(symbol);
CREATE INDEX IF NOT EXISTS idx_token_metrics_timestamp ON public.token_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_token_metrics_volume ON public.token_metrics(volume_24h DESC);

-- Liquidity Pools Table
CREATE TABLE IF NOT EXISTS public.liquidity_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair TEXT NOT NULL,
  chain TEXT NOT NULL,
  liquidity NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  apy NUMERIC NOT NULL DEFAULT 0,
  fees_24h NUMERIC NOT NULL DEFAULT 0,
  token_a_address TEXT,
  token_b_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_liquidity_pools_chain ON public.liquidity_pools(chain);
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_pair ON public.liquidity_pools(pair);
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_liquidity ON public.liquidity_pools(liquidity DESC);

-- Market News Table
CREATE TABLE IF NOT EXISTS public.market_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  source TEXT NOT NULL,
  url TEXT,
  category TEXT NOT NULL,
  sentiment_score NUMERIC CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
  related_tokens TEXT[],
  related_chains TEXT[],
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_market_news_published ON public.market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_category ON public.market_news(category);
CREATE INDEX IF NOT EXISTS idx_market_news_sentiment ON public.market_news(sentiment_score);

-- Market Sentiment Table
CREATE TABLE IF NOT EXISTS public.market_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeframe TEXT NOT NULL CHECK (timeframe IN ('1h', '4h', '24h', '7d')),
  overall_sentiment NUMERIC NOT NULL CHECK (overall_sentiment >= -1 AND overall_sentiment <= 1),
  fear_greed_index INTEGER CHECK (fear_greed_index >= 0 AND fear_greed_index <= 100),
  bullish_percentage NUMERIC CHECK (bullish_percentage >= 0 AND bullish_percentage <= 100),
  bearish_percentage NUMERIC CHECK (bearish_percentage >= 0 AND bearish_percentage <= 100),
  neutral_percentage NUMERIC CHECK (neutral_percentage >= 0 AND neutral_percentage <= 100),
  volume_sentiment TEXT,
  social_sentiment TEXT,
  market_cap_change NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(timeframe, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_market_sentiment_timeframe ON public.market_sentiment(timeframe);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_timestamp ON public.market_sentiment(timestamp DESC);

-- Cross-Chain Analytics Table
CREATE TABLE IF NOT EXISTS public.cross_chain_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_tvl NUMERIC NOT NULL DEFAULT 0,
  total_volume_24h NUMERIC NOT NULL DEFAULT 0,
  chain_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
  dominant_chain TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cross_chain_timestamp ON public.cross_chain_analytics(timestamp DESC);

-- Enable RLS
ALTER TABLE public.chain_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_chain_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public read access for analytics data)
CREATE POLICY "Chain metrics are publicly viewable"
  ON public.chain_metrics FOR SELECT
  USING (true);

CREATE POLICY "Token metrics are publicly viewable"
  ON public.token_metrics FOR SELECT
  USING (true);

CREATE POLICY "Liquidity pools are publicly viewable"
  ON public.liquidity_pools FOR SELECT
  USING (true);

CREATE POLICY "Market news is publicly viewable"
  ON public.market_news FOR SELECT
  USING (true);

CREATE POLICY "Market sentiment is publicly viewable"
  ON public.market_sentiment FOR SELECT
  USING (true);

CREATE POLICY "Cross-chain analytics are publicly viewable"
  ON public.cross_chain_analytics FOR SELECT
  USING (true);

-- System policies for data ingestion
CREATE POLICY "System can insert chain metrics"
  ON public.chain_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert token metrics"
  ON public.token_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert liquidity pools"
  ON public.liquidity_pools FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert market news"
  ON public.market_news FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert market sentiment"
  ON public.market_sentiment FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can insert cross-chain analytics"
  ON public.cross_chain_analytics FOR INSERT
  WITH CHECK (true);