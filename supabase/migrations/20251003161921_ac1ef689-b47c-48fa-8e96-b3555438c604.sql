-- =====================================================
-- COMMUNITY BACKEND INFRASTRUCTURE
-- =====================================================

-- Community categories for organizing discussions
CREATE TABLE IF NOT EXISTS public.community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum posts with full discussion capabilities
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post replies/comments
CREATE TABLE IF NOT EXISTS public.community_post_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Live chat messages
CREATE TABLE IF NOT EXISTS public.community_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User engagement tracking for leaderboard
CREATE TABLE IF NOT EXISTS public.community_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  posts_created INTEGER DEFAULT 0,
  replies_created INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  solutions_provided INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  rank INTEGER,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post likes tracking
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Reply likes tracking
CREATE TABLE IF NOT EXISTS public.community_reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES public.community_post_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_last_activity ON public.community_posts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts(is_pinned, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_post_replies_post_id ON public.community_post_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_replies_user_id ON public.community_post_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_community_post_replies_created_at ON public.community_post_replies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_chat_messages_created_at ON public.community_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_chat_messages_user_id ON public.community_chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_community_user_stats_reputation ON public.community_user_stats(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_community_user_stats_rank ON public.community_user_stats(rank);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reply_likes ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone"
  ON public.community_categories FOR SELECT
  USING (is_active = true);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Replies policies
CREATE POLICY "Replies are viewable by everyone"
  ON public.community_post_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON public.community_post_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
  ON public.community_post_replies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON public.community_post_replies FOR DELETE
  USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Chat messages are viewable by everyone"
  ON public.community_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.community_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "User stats are viewable by everyone"
  ON public.community_user_stats FOR SELECT
  USING (true);

CREATE POLICY "System can manage user stats"
  ON public.community_user_stats FOR ALL
  USING (true);

-- Likes policies
CREATE POLICY "Post likes are viewable by everyone"
  ON public.community_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own post likes"
  ON public.community_post_likes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Reply likes are viewable by everyone"
  ON public.community_reply_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own reply likes"
  ON public.community_reply_likes FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update post reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET reply_count = reply_count + 1,
        last_activity_at = now()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_post_reply_count_trigger
AFTER INSERT OR DELETE ON public.community_post_replies
FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET like_count = like_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_post_like_count_trigger
AFTER INSERT OR DELETE ON public.community_post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Function to update reply like count
CREATE OR REPLACE FUNCTION update_reply_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_post_replies
    SET like_count = like_count + 1
    WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_post_replies
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.reply_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_reply_like_count_trigger
AFTER INSERT OR DELETE ON public.community_reply_likes
FOR EACH ROW EXECUTE FUNCTION update_reply_like_count();

-- Function to initialize or update user stats
CREATE OR REPLACE FUNCTION update_community_user_stats(
  p_user_id UUID,
  p_stat_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.community_user_stats (user_id, last_active_at)
  VALUES (p_user_id, now())
  ON CONFLICT (user_id) DO UPDATE
  SET last_active_at = now();

  CASE p_stat_type
    WHEN 'post_created' THEN
      UPDATE public.community_user_stats
      SET posts_created = posts_created + p_increment
      WHERE user_id = p_user_id;
    WHEN 'reply_created' THEN
      UPDATE public.community_user_stats
      SET replies_created = replies_created + p_increment
      WHERE user_id = p_user_id;
    WHEN 'like_received' THEN
      UPDATE public.community_user_stats
      SET likes_received = likes_received + p_increment
      WHERE user_id = p_user_id;
    WHEN 'like_given' THEN
      UPDATE public.community_user_stats
      SET likes_given = likes_given + p_increment
      WHERE user_id = p_user_id;
    WHEN 'solution_provided' THEN
      UPDATE public.community_user_stats
      SET solutions_provided = solutions_provided + p_increment
      WHERE user_id = p_user_id;
  END CASE;

  -- Update reputation score (weighted calculation)
  UPDATE public.community_user_stats
  SET reputation_score = (
    (posts_created * 5) +
    (replies_created * 3) +
    (likes_received * 2) +
    (solutions_provided * 10)
  )
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user stats when posts are created
CREATE OR REPLACE FUNCTION track_post_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_community_user_stats(NEW.user_id, 'post_created', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_post_creation_trigger
AFTER INSERT ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION track_post_creation();

-- Trigger to update user stats when replies are created
CREATE OR REPLACE FUNCTION track_reply_creation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_community_user_stats(NEW.user_id, 'reply_created', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_reply_creation_trigger
AFTER INSERT ON public.community_post_replies
FOR EACH ROW EXECUTE FUNCTION track_reply_creation();

-- =====================================================
-- ENABLE REALTIME FOR LIVE UPDATES
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_replies;

-- =====================================================
-- SEED DEFAULT CATEGORIES
-- =====================================================

INSERT INTO public.community_categories (name, description, icon, sort_order) VALUES
  ('General Discussion', 'General trading and AI agent discussions', '💬', 1),
  ('Trading Strategies', 'Share and discuss trading strategies', '📊', 2),
  ('Technical Analysis', 'Charts, indicators, and market analysis', '📈', 3),
  ('AI Agents', 'AI agent development and optimization', '🤖', 4),
  ('Support', 'Get help with platform features', '🆘', 5)
ON CONFLICT DO NOTHING;