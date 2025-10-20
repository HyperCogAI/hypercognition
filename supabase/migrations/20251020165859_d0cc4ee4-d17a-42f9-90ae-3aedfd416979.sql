-- Phase 3: Signal Performance Tracking, User Reputation, and KOL Analytics

-- ============================================================================
-- 1. Signal Performance Tracking
-- ============================================================================

CREATE TABLE public.signal_performance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES twitter_kol_signals(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  contract_address TEXT,
  chain TEXT,
  
  -- Price tracking
  price_at_signal NUMERIC NOT NULL,
  price_1h NUMERIC,
  price_4h NUMERIC,
  price_24h NUMERIC,
  price_7d NUMERIC,
  
  -- Performance metrics
  return_1h NUMERIC,
  return_4h NUMERIC,
  return_24h NUMERIC,
  return_7d NUMERIC,
  peak_price NUMERIC,
  peak_return NUMERIC,
  peak_reached_at TIMESTAMPTZ,
  
  -- Classification
  outcome TEXT CHECK (outcome IN ('bullish', 'bearish', 'neutral', 'pending')) DEFAULT 'pending',
  performance_score INTEGER,
  
  -- Metadata
  data_source TEXT DEFAULT 'coingecko',
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(signal_id)
);

CREATE INDEX idx_signal_perf_ticker ON signal_performance_tracking(ticker);
CREATE INDEX idx_signal_perf_outcome ON signal_performance_tracking(outcome);
CREATE INDEX idx_signal_perf_score ON signal_performance_tracking(performance_score DESC);
CREATE INDEX idx_signal_perf_pending ON signal_performance_tracking(outcome) WHERE outcome = 'pending';

-- Enable RLS
ALTER TABLE signal_performance_tracking ENABLE ROW LEVEL SECURITY;

-- Allow users to read all performance data
CREATE POLICY "Users can view signal performance"
  ON signal_performance_tracking
  FOR SELECT
  USING (true);

-- ============================================================================
-- 2. User Reputation System
-- ============================================================================

CREATE TABLE public.user_reputation (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reputation metrics
  total_votes_cast INTEGER DEFAULT 0,
  correct_votes INTEGER DEFAULT 0,
  accuracy_rate NUMERIC DEFAULT 0,
  
  -- Signal interaction
  signals_bookmarked INTEGER DEFAULT 0,
  signals_shared INTEGER DEFAULT 0,
  comments_posted INTEGER DEFAULT 0,
  
  -- Calculated reputation
  reputation_score INTEGER DEFAULT 50,
  reputation_tier TEXT DEFAULT 'newcomer' CHECK (reputation_tier IN ('newcomer', 'contributor', 'expert', 'legend')),
  
  -- Badges earned
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_rep_score ON user_reputation(reputation_score DESC);
CREATE INDEX idx_user_rep_tier ON user_reputation(reputation_tier);

-- Enable RLS
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- Users can view all reputations
CREATE POLICY "Users can view all reputations"
  ON user_reputation
  FOR SELECT
  USING (true);

-- Add vote_weight column to signal_votes if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'signal_votes') THEN
    ALTER TABLE signal_votes ADD COLUMN IF NOT EXISTS vote_weight NUMERIC DEFAULT 1.0;
  END IF;
END $$;

-- ============================================================================
-- 3. Reputation Calculation Function
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_user_reputation(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_votes INTEGER;
  v_correct_votes INTEGER;
  v_accuracy NUMERIC;
  v_reputation_score INTEGER;
  v_tier TEXT;
  v_signals_bookmarked INTEGER;
  v_signals_shared INTEGER;
  v_comments_posted INTEGER;
BEGIN
  -- Count total votes where signal outcome is determined
  SELECT COUNT(*) INTO v_total_votes
  FROM signal_votes sv
  JOIN twitter_kol_signals s ON sv.signal_id = s.id
  JOIN signal_performance_tracking spt ON s.id = spt.signal_id
  WHERE sv.user_id = p_user_id
    AND spt.outcome != 'pending';
  
  -- Count correct votes (upvote on bullish, downvote on bearish)
  SELECT COUNT(*) INTO v_correct_votes
  FROM signal_votes sv
  JOIN twitter_kol_signals s ON sv.signal_id = s.id
  JOIN signal_performance_tracking spt ON s.id = spt.signal_id
  WHERE sv.user_id = p_user_id
    AND (
      (sv.vote_type = 'up' AND spt.outcome = 'bullish') OR
      (sv.vote_type = 'down' AND spt.outcome = 'bearish')
    );
  
  -- Count user activities
  SELECT COUNT(DISTINCT signal_id) INTO v_signals_bookmarked
  FROM twitter_kol_signals
  WHERE user_action = 'bookmarked' AND id IN (
    SELECT signal_id FROM signal_votes WHERE user_id = p_user_id
  );
  
  SELECT COUNT(*) INTO v_signals_shared
  FROM signal_shares
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_comments_posted
  FROM signal_comments
  WHERE user_id = p_user_id;
  
  -- Calculate accuracy
  v_accuracy := CASE WHEN v_total_votes > 0 
    THEN (v_correct_votes::NUMERIC / v_total_votes::NUMERIC * 100)
    ELSE 50 
  END;
  
  -- Calculate reputation score (0-100)
  v_reputation_score := LEAST(100, GREATEST(0,
    50 + -- base score
    (v_accuracy - 50) * 0.5 + -- accuracy bonus/penalty
    (v_total_votes * 0.1) + -- participation bonus
    (v_comments_posted * 0.2) + -- engagement bonus
    (v_signals_shared * 0.3) -- sharing bonus
  ))::INTEGER;
  
  -- Assign tier
  v_tier := CASE
    WHEN v_reputation_score >= 90 THEN 'legend'
    WHEN v_reputation_score >= 75 THEN 'expert'
    WHEN v_reputation_score >= 60 THEN 'contributor'
    ELSE 'newcomer'
  END;
  
  -- Update or insert reputation
  INSERT INTO user_reputation (
    user_id, total_votes_cast, correct_votes, accuracy_rate,
    signals_bookmarked, signals_shared, comments_posted,
    reputation_score, reputation_tier, last_calculated_at
  ) VALUES (
    p_user_id, v_total_votes, v_correct_votes, v_accuracy,
    v_signals_bookmarked, v_signals_shared, v_comments_posted,
    v_reputation_score, v_tier, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_votes_cast = v_total_votes,
    correct_votes = v_correct_votes,
    accuracy_rate = v_accuracy,
    signals_bookmarked = v_signals_bookmarked,
    signals_shared = v_signals_shared,
    comments_posted = v_comments_posted,
    reputation_score = v_reputation_score,
    reputation_tier = v_tier,
    last_calculated_at = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. KOL Performance Summary View
-- ============================================================================

CREATE OR REPLACE VIEW kol_performance_summary AS
SELECT 
  ka.id AS kol_account_id,
  ka.twitter_username,
  ka.watchlist_id,
  
  -- Signal counts
  COUNT(DISTINCT s.id) AS total_signals,
  COUNT(DISTINCT CASE WHEN spt.outcome = 'bullish' THEN s.id END) AS bullish_signals,
  COUNT(DISTINCT CASE WHEN spt.outcome = 'bearish' THEN s.id END) AS bearish_signals,
  COUNT(DISTINCT CASE WHEN spt.outcome = 'pending' THEN s.id END) AS pending_signals,
  
  -- Performance metrics
  AVG(spt.return_24h) AS avg_return_24h,
  AVG(spt.peak_return) AS avg_peak_return,
  MAX(spt.peak_return) AS best_signal_return,
  AVG(spt.performance_score) AS avg_performance_score,
  
  -- Success rate
  ROUND(
    COUNT(DISTINCT CASE WHEN spt.outcome = 'bullish' THEN s.id END)::NUMERIC / 
    NULLIF(COUNT(DISTINCT CASE WHEN spt.outcome IN ('bullish', 'bearish', 'neutral') THEN s.id END), 0) * 100,
    2
  ) AS success_rate,
  
  -- Confidence accuracy
  AVG(s.confidence_score) AS avg_confidence_score,
  AVG(s.enhanced_confidence_score) AS avg_enhanced_confidence,
  
  -- Kaito influence
  kas.yaps_30d,
  kas.yaps_7d,
  
  -- Timestamps
  MAX(s.detected_at) AS last_signal_at,
  MIN(s.detected_at) AS first_signal_at
  
FROM twitter_kol_accounts ka
LEFT JOIN twitter_kol_signals s ON ka.id = s.kol_account_id
LEFT JOIN signal_performance_tracking spt ON s.id = spt.signal_id
LEFT JOIN kaito_attention_scores kas ON ka.twitter_username = kas.twitter_username
GROUP BY ka.id, ka.twitter_username, ka.watchlist_id, kas.yaps_30d, kas.yaps_7d;