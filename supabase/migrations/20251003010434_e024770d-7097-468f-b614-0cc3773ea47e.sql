-- Add ranking column to kaito_attention_scores table
ALTER TABLE public.kaito_attention_scores 
ADD COLUMN IF NOT EXISTS rank_30d integer;

-- Add index for faster ranking queries
CREATE INDEX IF NOT EXISTS idx_kaito_attention_rank_30d 
ON public.kaito_attention_scores(rank_30d) 
WHERE rank_30d IS NOT NULL;