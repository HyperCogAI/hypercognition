-- Add performance indexes for kaito_attention_scores table
-- These indexes will speed up the top agents queries and filtering

-- Index for ordering by yaps_30d (most common query)
CREATE INDEX IF NOT EXISTS idx_kaito_attention_yaps_30d 
ON public.kaito_attention_scores (yaps_30d DESC NULLS LAST);

-- Index for ordering by yaps_all (fallback query)
CREATE INDEX IF NOT EXISTS idx_kaito_attention_yaps_all 
ON public.kaito_attention_scores (yaps_all DESC NULLS LAST);

-- Index for filtering by twitter_username (used in upserts and lookups)
CREATE INDEX IF NOT EXISTS idx_kaito_attention_username 
ON public.kaito_attention_scores (twitter_username);

-- Index for updated_at to quickly check freshness
CREATE INDEX IF NOT EXISTS idx_kaito_attention_updated_at 
ON public.kaito_attention_scores (updated_at DESC);

-- Composite index for the common query pattern: WHERE yaps_30d > 0 AND NOT NULL ORDER BY yaps_30d
CREATE INDEX IF NOT EXISTS idx_kaito_attention_yaps_30d_filter 
ON public.kaito_attention_scores (yaps_30d DESC) 
WHERE yaps_30d IS NOT NULL AND yaps_30d > 0;