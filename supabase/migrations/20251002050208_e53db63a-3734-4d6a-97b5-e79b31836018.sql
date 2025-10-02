-- Create table for Kaito attention scores (Yaps data)
CREATE TABLE IF NOT EXISTS public.kaito_attention_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  twitter_user_id TEXT,
  twitter_username TEXT NOT NULL,
  yaps_24h NUMERIC DEFAULT 0,
  yaps_48h NUMERIC DEFAULT 0,
  yaps_7d NUMERIC DEFAULT 0,
  yaps_30d NUMERIC DEFAULT 0,
  yaps_3m NUMERIC DEFAULT 0,
  yaps_6m NUMERIC DEFAULT 0,
  yaps_12m NUMERIC DEFAULT 0,
  yaps_all NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, twitter_username)
);

-- Enable RLS
ALTER TABLE public.kaito_attention_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access
CREATE POLICY "Kaito attention scores are viewable by everyone"
  ON public.kaito_attention_scores
  FOR SELECT
  USING (true);

-- System can insert/update
CREATE POLICY "System can manage Kaito attention scores"
  ON public.kaito_attention_scores
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_kaito_attention_agent_id ON public.kaito_attention_scores(agent_id);
CREATE INDEX idx_kaito_attention_twitter_username ON public.kaito_attention_scores(twitter_username);
CREATE INDEX idx_kaito_attention_created_at ON public.kaito_attention_scores(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_kaito_attention_scores_updated_at
  BEFORE UPDATE ON public.kaito_attention_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();