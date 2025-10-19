-- Create language preferences table
CREATE TABLE IF NOT EXISTS public.user_language_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  region_code TEXT NOT NULL DEFAULT 'global',
  rtl_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_translate BOOLEAN NOT NULL DEFAULT true,
  local_timezone BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create language request table
CREATE TABLE IF NOT EXISTS public.language_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  language_name TEXT NOT NULL,
  native_name TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  votes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supported languages table (admin managed)
CREATE TABLE IF NOT EXISTS public.supported_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL UNIQUE,
  language_name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_emoji TEXT,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_rtl BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create regions table (admin managed)
CREATE TABLE IF NOT EXISTS public.trading_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  supported_markets JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create language request votes table
CREATE TABLE IF NOT EXISTS public.language_request_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.language_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_request_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_language_preferences
CREATE POLICY "Users can view their own language preferences"
  ON public.user_language_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own language preferences"
  ON public.user_language_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own language preferences"
  ON public.user_language_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own language preferences"
  ON public.user_language_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for language_requests
CREATE POLICY "Anyone can view language requests"
  ON public.language_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create language requests"
  ON public.language_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own language requests"
  ON public.language_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any language request"
  ON public.language_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for supported_languages
CREATE POLICY "Anyone can view active supported languages"
  ON public.supported_languages FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage supported languages"
  ON public.supported_languages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for trading_regions
CREATE POLICY "Anyone can view active trading regions"
  ON public.trading_regions FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage trading regions"
  ON public.trading_regions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies for language_request_votes
CREATE POLICY "Anyone can view language request votes"
  ON public.language_request_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on language requests"
  ON public.language_request_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.language_request_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_language_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_language_preferences_timestamp
  BEFORE UPDATE ON public.user_language_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_language_preferences_timestamp();

CREATE TRIGGER update_language_requests_timestamp
  BEFORE UPDATE ON public.language_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_language_preferences_timestamp();

CREATE TRIGGER update_supported_languages_timestamp
  BEFORE UPDATE ON public.supported_languages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_language_preferences_timestamp();

CREATE TRIGGER update_trading_regions_timestamp
  BEFORE UPDATE ON public.trading_regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_language_preferences_timestamp();

-- Function to handle language request voting
CREATE OR REPLACE FUNCTION public.vote_language_request(request_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_vote UUID;
  result JSONB;
BEGIN
  -- Check if user already voted
  SELECT id INTO existing_vote
  FROM public.language_request_votes
  WHERE request_id = request_id_param
    AND user_id = auth.uid();
  
  IF existing_vote IS NOT NULL THEN
    -- Remove vote
    DELETE FROM public.language_request_votes
    WHERE id = existing_vote;
    
    -- Decrement vote count
    UPDATE public.language_requests
    SET votes = GREATEST(0, votes - 1),
        updated_at = now()
    WHERE id = request_id_param;
    
    result := jsonb_build_object('voted', false, 'message', 'Vote removed');
  ELSE
    -- Add vote
    INSERT INTO public.language_request_votes (request_id, user_id)
    VALUES (request_id_param, auth.uid());
    
    -- Increment vote count
    UPDATE public.language_requests
    SET votes = votes + 1,
        updated_at = now()
    WHERE id = request_id_param;
    
    result := jsonb_build_object('voted', true, 'message', 'Vote added');
  END IF;
  
  RETURN result;
END;
$$;

-- Insert default supported languages
INSERT INTO public.supported_languages (language_code, language_name, native_name, flag_emoji, completion_percentage, is_active, is_rtl, sort_order) VALUES
('en', 'English', 'English', '🇺🇸', 100, true, false, 1),
('es', 'Spanish', 'Español', '🇪🇸', 95, true, false, 2),
('fr', 'French', 'Français', '🇫🇷', 90, true, false, 3),
('de', 'German', 'Deutsch', '🇩🇪', 88, true, false, 4),
('zh', 'Chinese', '中文', '🇨🇳', 85, true, false, 5),
('ja', 'Japanese', '日本語', '🇯🇵', 82, true, false, 6),
('ko', 'Korean', '한국어', '🇰🇷', 80, true, false, 7),
('ar', 'Arabic', 'العربية', '🇸🇦', 75, true, true, 8),
('pt', 'Portuguese', 'Português', '🇵🇹', 78, true, false, 9),
('ru', 'Russian', 'Русский', '🇷🇺', 70, true, false, 10)
ON CONFLICT (language_code) DO NOTHING;

-- Insert default trading regions
INSERT INTO public.trading_regions (region_code, region_name, supported_markets, is_active, sort_order) VALUES
('global', 'Global', '["NYSE", "NASDAQ", "LSE", "TSE"]'::jsonb, true, 1),
('americas', 'Americas', '["NYSE", "NASDAQ", "TSX", "B3"]'::jsonb, true, 2),
('europe', 'Europe', '["LSE", "Euronext", "DAX", "SIX"]'::jsonb, true, 3),
('asia', 'Asia Pacific', '["TSE", "HKEX", "SGX", "ASX"]'::jsonb, true, 4),
('mena', 'MENA', '["TADAWUL", "DFM", "QE", "EGX"]'::jsonb, true, 5)
ON CONFLICT (region_code) DO NOTHING;