-- Create only missing tables
DO $$ 
BEGIN
  -- Check if social_posts exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_posts') THEN
    CREATE TABLE public.social_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      content TEXT NOT NULL,
      post_type TEXT NOT NULL DEFAULT 'general',
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
    
    ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Social posts are viewable by everyone" 
    ON public.social_posts FOR SELECT USING (true);
    
    CREATE POLICY "Users can create their own posts" 
    ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own posts" 
    ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own posts" 
    ON public.social_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Check if social_follows exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'social_follows') THEN
    CREATE TABLE public.social_follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id UUID NOT NULL,
      following_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(follower_id, following_id)
    );
    
    ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Follows are viewable by everyone" 
    ON public.social_follows FOR SELECT USING (true);
    
    CREATE POLICY "Users can manage their own follows" 
    ON public.social_follows FOR ALL USING (auth.uid() = follower_id);
  END IF;

  -- Check if post_likes exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_likes') THEN
    CREATE TABLE public.post_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(user_id, post_id)
    );
    
    ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Post likes are viewable by everyone" 
    ON public.post_likes FOR SELECT USING (true);
    
    CREATE POLICY "Users can manage their own likes" 
    ON public.post_likes FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Check if trading_signals exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trading_signals') THEN
    CREATE TABLE public.trading_signals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      agent_id UUID NOT NULL REFERENCES public.agents(id),
      signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
      price NUMERIC NOT NULL,
      target_price NUMERIC,
      stop_loss_price NUMERIC,
      confidence_level INTEGER NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 10),
      time_horizon TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      is_premium BOOLEAN NOT NULL DEFAULT false,
      likes_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
    
    ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Trading signals are viewable by everyone" 
    ON public.trading_signals FOR SELECT USING (true);
    
    CREATE POLICY "Users can create their own signals" 
    ON public.trading_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own signals" 
    ON public.trading_signals FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own signals" 
    ON public.trading_signals FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Check if signal_likes exists, if not create it
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'signal_likes') THEN
    CREATE TABLE public.signal_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      signal_id UUID NOT NULL REFERENCES public.trading_signals(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(user_id, signal_id)
    );
    
    ALTER TABLE public.signal_likes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Signal likes are viewable by everyone" 
    ON public.signal_likes FOR SELECT USING (true);
    
    CREATE POLICY "Users can manage their own signal likes" 
    ON public.signal_likes FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;