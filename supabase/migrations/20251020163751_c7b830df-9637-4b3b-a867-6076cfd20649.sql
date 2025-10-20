-- Phase 1: Create Community Tables for Signal Voting and Sharing

-- Create signal_votes table
CREATE TABLE IF NOT EXISTS public.signal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.twitter_kol_signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(signal_id, user_id)
);

-- Create signal_shares table
CREATE TABLE IF NOT EXISTS public.signal_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.twitter_kol_signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_signal_votes_signal_id ON public.signal_votes(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_votes_user_id ON public.signal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_shares_signal_id ON public.signal_shares(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_shares_user_id ON public.signal_shares(user_id);

-- Enable RLS
ALTER TABLE public.signal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signal_votes
CREATE POLICY "Anyone can view signal votes"
  ON public.signal_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own votes"
  ON public.signal_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON public.signal_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.signal_votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for signal_shares
CREATE POLICY "Anyone can view signal shares"
  ON public.signal_shares FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own shares"
  ON public.signal_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares"
  ON public.signal_shares FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares"
  ON public.signal_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Fix signal_comments column name if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'signal_comments' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE public.signal_comments RENAME COLUMN content TO comment_text;
  END IF;
END $$;

-- Phase 4: Setup cron job for refresh-signal-analyses
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule refresh-signal-analyses to run every 6 hours
SELECT cron.schedule(
  'refresh-signal-analyses',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/refresh-signal-analyses',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);