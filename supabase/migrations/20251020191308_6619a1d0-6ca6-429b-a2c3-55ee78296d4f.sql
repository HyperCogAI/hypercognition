-- Create telegram_user_credentials table
CREATE TABLE telegram_user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users NOT NULL,
  api_id_encrypted TEXT NOT NULL,
  api_hash_encrypted TEXT NOT NULL,
  phone_number_encrypted TEXT NOT NULL,
  session_string_encrypted TEXT,
  phone_code_hash TEXT,
  is_authenticated BOOLEAN DEFAULT false,
  telegram_user_id TEXT,
  telegram_username TEXT,
  telegram_first_name TEXT,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create telegram_kol_watchlists table
CREATE TABLE telegram_kol_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create telegram_kol_channels table
CREATE TABLE telegram_kol_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES telegram_kol_watchlists ON DELETE CASCADE,
  channel_username TEXT,
  channel_id TEXT,
  channel_title TEXT,
  channel_type TEXT CHECK (channel_type IN ('channel', 'supergroup', 'group')),
  is_user_member BOOLEAN DEFAULT false,
  last_message_id INTEGER,
  last_checked_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  added_at TIMESTAMPTZ DEFAULT now()
);

-- Create telegram_kol_signals table
CREATE TABLE telegram_kol_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES telegram_kol_channels NOT NULL,
  watchlist_id UUID REFERENCES telegram_kol_watchlists NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  message_id INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  message_url TEXT,
  posted_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now(),
  has_photo BOOLEAN DEFAULT false,
  has_video BOOLEAN DEFAULT false,
  has_document BOOLEAN DEFAULT false,
  media_urls JSONB DEFAULT '[]',
  forward_from_chat_id TEXT,
  forward_from_chat_title TEXT,
  forward_date TIMESTAMPTZ,
  confidence_score NUMERIC(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  gem_type TEXT CHECK (gem_type IN ('token', 'nft', 'protocol', 'airdrop', 'alpha')),
  extracted_data JSONB DEFAULT '{}',
  ai_reasoning TEXT,
  status TEXT CHECK (status IN ('new', 'reviewed', 'dismissed')) DEFAULT 'new',
  user_notes TEXT,
  bookmarked BOOLEAN DEFAULT false,
  UNIQUE(channel_id, message_id)
);

-- Create telegram_signal_comments table
CREATE TABLE telegram_signal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES telegram_kol_signals ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create telegram_signal_votes table
CREATE TABLE telegram_signal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES telegram_kol_signals ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(signal_id, user_id)
);

-- Create indexes
CREATE INDEX idx_telegram_credentials_user ON telegram_user_credentials(user_id);
CREATE INDEX idx_telegram_watchlists_user ON telegram_kol_watchlists(user_id);
CREATE INDEX idx_telegram_channels_watchlist ON telegram_kol_channels(watchlist_id);
CREATE INDEX idx_telegram_channels_username ON telegram_kol_channels(channel_username);
CREATE INDEX idx_telegram_signals_user ON telegram_kol_signals(user_id);
CREATE INDEX idx_telegram_signals_watchlist ON telegram_kol_signals(watchlist_id);
CREATE INDEX idx_telegram_signals_status ON telegram_kol_signals(status);
CREATE INDEX idx_telegram_signals_confidence ON telegram_kol_signals(confidence_score DESC);
CREATE INDEX idx_telegram_signals_posted ON telegram_kol_signals(posted_at DESC);
CREATE INDEX idx_telegram_comments_signal ON telegram_signal_comments(signal_id);
CREATE INDEX idx_telegram_votes_signal ON telegram_signal_votes(signal_id);

-- Enable RLS
ALTER TABLE telegram_user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_kol_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_kol_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_kol_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_signal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_signal_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telegram_user_credentials
CREATE POLICY "Users can view own credentials"
  ON telegram_user_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON telegram_user_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON telegram_user_credentials FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for telegram_kol_watchlists
CREATE POLICY "Users can view own watchlists"
  ON telegram_kol_watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists"
  ON telegram_kol_watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON telegram_kol_watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON telegram_kol_watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for telegram_kol_channels
CREATE POLICY "Users can view channels in own watchlists"
  ON telegram_kol_channels FOR SELECT
  USING (
    watchlist_id IN (
      SELECT id FROM telegram_kol_watchlists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert channels in own watchlists"
  ON telegram_kol_channels FOR INSERT
  WITH CHECK (
    watchlist_id IN (
      SELECT id FROM telegram_kol_watchlists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update channels in own watchlists"
  ON telegram_kol_channels FOR UPDATE
  USING (
    watchlist_id IN (
      SELECT id FROM telegram_kol_watchlists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete channels in own watchlists"
  ON telegram_kol_channels FOR DELETE
  USING (
    watchlist_id IN (
      SELECT id FROM telegram_kol_watchlists WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for telegram_kol_signals
CREATE POLICY "Users can view own signals"
  ON telegram_kol_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own signals"
  ON telegram_kol_signals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for telegram_signal_comments
CREATE POLICY "Users can view all comments"
  ON telegram_signal_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON telegram_signal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON telegram_signal_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON telegram_signal_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for telegram_signal_votes
CREATE POLICY "Users can view all votes"
  ON telegram_signal_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON telegram_signal_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON telegram_signal_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON telegram_signal_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Add telegram alerts to notification_preferences
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS telegram_kol_alerts_enabled BOOLEAN DEFAULT true;