-- Create enum for access modes
CREATE TYPE access_mode AS ENUM ('personal_api', 'platform_shared');

-- Create enum for gem types
CREATE TYPE gem_type AS ENUM ('token', 'nft', 'protocol', 'airdrop', 'alpha');

-- Create enum for signal status
CREATE TYPE signal_status AS ENUM ('new', 'reviewed', 'dismissed');

-- Create enum for KOL priority
CREATE TYPE kol_priority AS ENUM ('high', 'medium', 'low');

-- Table 1: Twitter KOL Watchlists
CREATE TABLE public.twitter_kol_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  access_mode access_mode NOT NULL DEFAULT 'platform_shared',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 2: Twitter KOL Accounts
CREATE TABLE public.twitter_kol_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.twitter_kol_watchlists(id) ON DELETE CASCADE,
  twitter_username TEXT NOT NULL,
  twitter_user_id TEXT,
  priority kol_priority NOT NULL DEFAULT 'medium',
  last_checked_at TIMESTAMP WITH TIME ZONE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table 3: Twitter KOL Signals
CREATE TABLE public.twitter_kol_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kol_account_id UUID NOT NULL REFERENCES public.twitter_kol_accounts(id) ON DELETE CASCADE,
  watchlist_id UUID NOT NULL REFERENCES public.twitter_kol_watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tweet_id TEXT NOT NULL UNIQUE,
  tweet_text TEXT NOT NULL,
  tweet_url TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  gem_type gem_type,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  status signal_status NOT NULL DEFAULT 'new',
  user_action TEXT
);

-- Table 4: Twitter User Credentials (Personal API mode)
CREATE TABLE public.twitter_user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  twitter_api_key_encrypted TEXT NOT NULL,
  twitter_api_secret_encrypted TEXT NOT NULL,
  twitter_access_token_encrypted TEXT NOT NULL,
  twitter_access_secret_encrypted TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  rate_limit_remaining INTEGER DEFAULT 450,
  rate_limit_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add twitter_kol_alerts_enabled to notification_preferences
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS twitter_kol_alerts_enabled BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX idx_twitter_kol_watchlists_user_id ON public.twitter_kol_watchlists(user_id);
CREATE INDEX idx_twitter_kol_accounts_watchlist_id ON public.twitter_kol_accounts(watchlist_id);
CREATE INDEX idx_twitter_kol_signals_user_id ON public.twitter_kol_signals(user_id);
CREATE INDEX idx_twitter_kol_signals_watchlist_id ON public.twitter_kol_signals(watchlist_id);
CREATE INDEX idx_twitter_kol_signals_tweet_id ON public.twitter_kol_signals(tweet_id);
CREATE INDEX idx_twitter_kol_signals_detected_at ON public.twitter_kol_signals(detected_at DESC);

-- Enable Row Level Security
ALTER TABLE public.twitter_kol_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitter_kol_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitter_kol_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitter_user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for twitter_kol_watchlists
CREATE POLICY "Users can manage their own watchlists"
ON public.twitter_kol_watchlists FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for twitter_kol_accounts
CREATE POLICY "Users can manage KOL accounts in their watchlists"
ON public.twitter_kol_accounts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.twitter_kol_watchlists
    WHERE id = twitter_kol_accounts.watchlist_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for twitter_kol_signals
CREATE POLICY "Users can view their own signals"
ON public.twitter_kol_signals FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can create signals"
ON public.twitter_kol_signals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own signals"
ON public.twitter_kol_signals FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS Policies for twitter_user_credentials
CREATE POLICY "Users can manage their own credentials"
ON public.twitter_user_credentials FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on twitter_kol_watchlists
CREATE OR REPLACE FUNCTION update_twitter_kol_watchlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_twitter_kol_watchlists_timestamp
BEFORE UPDATE ON public.twitter_kol_watchlists
FOR EACH ROW
EXECUTE FUNCTION update_twitter_kol_watchlists_updated_at();

-- Create trigger for updated_at on twitter_user_credentials
CREATE OR REPLACE FUNCTION update_twitter_user_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_twitter_user_credentials_timestamp
BEFORE UPDATE ON public.twitter_user_credentials
FOR EACH ROW
EXECUTE FUNCTION update_twitter_user_credentials_updated_at();