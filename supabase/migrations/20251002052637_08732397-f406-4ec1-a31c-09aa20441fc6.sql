-- Create Kaito attention scores table for social influence data
CREATE TABLE IF NOT EXISTS public.kaito_attention_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NULL,
  twitter_user_id TEXT NOT NULL,
  twitter_username TEXT NOT NULL,
  yaps_24h NUMERIC NOT NULL DEFAULT 0,
  yaps_48h NUMERIC NOT NULL DEFAULT 0,
  yaps_7d NUMERIC NOT NULL DEFAULT 0,
  yaps_30d NUMERIC NOT NULL DEFAULT 0,
  yaps_3m NUMERIC NOT NULL DEFAULT 0,
  yaps_6m NUMERIC NOT NULL DEFAULT 0,
  yaps_12m NUMERIC NOT NULL DEFAULT 0,
  yaps_all NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional foreign key to agents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'kaito_attention_scores_agent_fk'
  ) THEN
    ALTER TABLE public.kaito_attention_scores
      ADD CONSTRAINT kaito_attention_scores_agent_fk
      FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Uniqueness to support upserts by username and user id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_kaito_twitter_username'
  ) THEN
    ALTER TABLE public.kaito_attention_scores
      ADD CONSTRAINT uniq_kaito_twitter_username UNIQUE (twitter_username);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_kaito_twitter_user_id'
  ) THEN
    ALTER TABLE public.kaito_attention_scores
      ADD CONSTRAINT uniq_kaito_twitter_user_id UNIQUE (twitter_user_id);
  END IF;
END $$;

-- Enable RLS and allow public reads
ALTER TABLE public.kaito_attention_scores ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'kaito_attention_scores' AND policyname = 'Kaito scores are viewable by everyone'
  ) THEN
    CREATE POLICY "Kaito scores are viewable by everyone"
    ON public.kaito_attention_scores
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Timestamps trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_kaito_attention_updated_at'
  ) THEN
    CREATE TRIGGER update_kaito_attention_updated_at
    BEFORE UPDATE ON public.kaito_attention_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_kaito_yaps_30d ON public.kaito_attention_scores (yaps_30d);
CREATE INDEX IF NOT EXISTS idx_kaito_updated_at ON public.kaito_attention_scores (updated_at);
