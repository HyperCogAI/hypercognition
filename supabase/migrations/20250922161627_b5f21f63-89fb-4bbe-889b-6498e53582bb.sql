-- Create social trading and copy trading tables

-- User profiles for public trading (separate from private profiles)
CREATE TABLE public.trading_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  total_followers INTEGER NOT NULL DEFAULT 0,
  total_following INTEGER NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  max_drawdown NUMERIC NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC,
  risk_score INTEGER DEFAULT 5 CHECK (risk_score >= 1 AND risk_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Follow relationships
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Copy trading settings
CREATE TABLE public.copy_trading_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  trader_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  copy_percentage NUMERIC NOT NULL DEFAULT 10 CHECK (copy_percentage > 0 AND copy_percentage <= 100),
  max_amount_per_trade NUMERIC,
  stop_loss_percentage NUMERIC,
  take_profit_percentage NUMERIC,
  copy_types TEXT[] DEFAULT ARRAY['buy', 'sell'],
  agents_to_copy UUID[],
  agents_to_exclude UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, trader_id)
);

-- Trading signals (public trade announcements)
CREATE TABLE public.trading_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  price NUMERIC NOT NULL,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  reasoning TEXT,
  target_price NUMERIC,
  stop_loss_price NUMERIC,
  time_horizon TEXT CHECK (time_horizon IN ('short', 'medium', 'long')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Signal interactions (likes, views, etc.)
CREATE TABLE public.signal_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'view', 'copy', 'bookmark')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, signal_id, interaction_type)
);

-- Comments on signals
CREATE TABLE public.signal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trading competitions
CREATE TABLE public.trading_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  competition_type TEXT NOT NULL CHECK (competition_type IN ('pnl', 'win_rate', 'volume', 'roi')),
  rules JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Competition participants
CREATE TABLE public.competition_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL,
  user_id UUID NOT NULL,
  starting_balance NUMERIC NOT NULL DEFAULT 10000,
  current_balance NUMERIC NOT NULL DEFAULT 10000,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  pnl_percentage NUMERIC NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Social feed posts (general posts, trade updates, insights)
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('trade_update', 'market_insight', 'strategy_share', 'general')),
  content TEXT NOT NULL,
  media_urls TEXT[],
  related_agent_id UUID,
  related_order_id UUID,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post interactions
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'view', 'share', 'bookmark')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.trading_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_trading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.trading_profiles FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own profile" 
ON public.trading_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.trading_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.trading_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.user_follows FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own follows" 
ON public.user_follows FOR ALL 
USING (auth.uid() = follower_id);

-- RLS Policies for copy_trading_settings
CREATE POLICY "Users can manage their own copy trading settings" 
ON public.copy_trading_settings FOR ALL 
USING (auth.uid() = follower_id);

CREATE POLICY "Traders can view who copies them" 
ON public.copy_trading_settings FOR SELECT 
USING (auth.uid() = trader_id);

-- RLS Policies for trading_signals
CREATE POLICY "Public signals are viewable by everyone" 
ON public.trading_signals FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own signals" 
ON public.trading_signals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals" 
ON public.trading_signals FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for signal_interactions
CREATE POLICY "Users can view signal interactions" 
ON public.signal_interactions FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own interactions" 
ON public.signal_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions" 
ON public.signal_interactions FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for signal_comments
CREATE POLICY "Signal comments are viewable by everyone" 
ON public.signal_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.signal_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.signal_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for trading_competitions
CREATE POLICY "Active competitions are viewable by everyone" 
ON public.trading_competitions FOR SELECT 
USING (is_active = true);

-- RLS Policies for competition_participants
CREATE POLICY "Competition participants are viewable by everyone" 
ON public.competition_participants FOR SELECT 
USING (true);

CREATE POLICY "Users can join competitions" 
ON public.competition_participants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for social_posts
CREATE POLICY "Public posts are viewable by everyone" 
ON public.social_posts FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.social_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.social_posts FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for post_interactions
CREATE POLICY "Post interactions are viewable by everyone" 
ON public.post_interactions FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own interactions" 
ON public.post_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions" 
ON public.post_interactions FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for post_comments
CREATE POLICY "Post comments are viewable by everyone" 
ON public.post_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.post_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers for updated_at columns
CREATE TRIGGER update_trading_profiles_updated_at
BEFORE UPDATE ON public.trading_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_copy_trading_settings_updated_at
BEFORE UPDATE ON public.copy_trading_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signal_comments_updated_at
BEFORE UPDATE ON public.signal_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competition_participants_updated_at
BEFORE UPDATE ON public.competition_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_trading_profiles_user_id ON public.trading_profiles(user_id);
CREATE INDEX idx_trading_profiles_public ON public.trading_profiles(is_public) WHERE is_public = true;
CREATE INDEX idx_trading_profiles_pnl ON public.trading_profiles(total_pnl DESC);
CREATE INDEX idx_trading_profiles_win_rate ON public.trading_profiles(win_rate DESC);

CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

CREATE INDEX idx_copy_trading_follower ON public.copy_trading_settings(follower_id);
CREATE INDEX idx_copy_trading_trader ON public.copy_trading_settings(trader_id);
CREATE INDEX idx_copy_trading_active ON public.copy_trading_settings(is_active) WHERE is_active = true;

CREATE INDEX idx_trading_signals_user ON public.trading_signals(user_id);
CREATE INDEX idx_trading_signals_agent ON public.trading_signals(agent_id);
CREATE INDEX idx_trading_signals_created ON public.trading_signals(created_at DESC);
CREATE INDEX idx_trading_signals_type ON public.trading_signals(signal_type);

CREATE INDEX idx_signal_interactions_signal ON public.signal_interactions(signal_id);
CREATE INDEX idx_signal_interactions_user ON public.signal_interactions(user_id);

CREATE INDEX idx_signal_comments_signal ON public.signal_comments(signal_id);
CREATE INDEX idx_signal_comments_user ON public.signal_comments(user_id);

CREATE INDEX idx_competition_participants_competition ON public.competition_participants(competition_id);
CREATE INDEX idx_competition_participants_user ON public.competition_participants(user_id);
CREATE INDEX idx_competition_participants_rank ON public.competition_participants(rank);

CREATE INDEX idx_social_posts_user ON public.social_posts(user_id);
CREATE INDEX idx_social_posts_created ON public.social_posts(created_at DESC);
CREATE INDEX idx_social_posts_type ON public.social_posts(post_type);

CREATE INDEX idx_post_interactions_post ON public.post_interactions(post_id);
CREATE INDEX idx_post_interactions_user ON public.post_interactions(user_id);

CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user ON public.post_comments(user_id);