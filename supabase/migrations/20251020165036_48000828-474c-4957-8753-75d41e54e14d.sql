-- Create push_subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create watchlist sync errors table for error tracking
CREATE TABLE IF NOT EXISTS public.watchlist_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.twitter_kol_watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  function_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_sync_errors_watchlist_id ON public.watchlist_sync_errors(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_sync_errors_user_id ON public.watchlist_sync_errors(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_sync_errors_resolved ON public.watchlist_sync_errors(resolved) WHERE resolved = false;

-- Enable RLS
ALTER TABLE public.watchlist_sync_errors ENABLE ROW LEVEL SECURITY;

-- Users can view their own errors
CREATE POLICY "Users can view their own sync errors"
  ON public.watchlist_sync_errors FOR SELECT
  USING (auth.uid() = user_id);

-- System can create sync errors
CREATE POLICY "System can create sync errors"
  ON public.watchlist_sync_errors FOR INSERT
  WITH CHECK (true);

-- Users can mark errors as resolved
CREATE POLICY "Users can update their own sync errors"
  ON public.watchlist_sync_errors FOR UPDATE
  USING (auth.uid() = user_id);