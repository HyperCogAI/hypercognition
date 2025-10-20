-- Phase 1.2: Add missing RLS policy for signal creation
CREATE POLICY "Service role can insert signals"
  ON telegram_kol_signals FOR INSERT
  WITH CHECK (true);

-- Phase 3.3: Optimize database queries with composite indexes
CREATE INDEX IF NOT EXISTS idx_telegram_signals_user_status 
  ON telegram_kol_signals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_telegram_signals_user_confidence 
  ON telegram_kol_signals(user_id, confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_telegram_signals_watchlist_posted 
  ON telegram_kol_signals(watchlist_id, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_telegram_signals_gem_type 
  ON telegram_kol_signals(gem_type) WHERE gem_type IS NOT NULL;