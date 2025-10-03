-- Create referral system tables

-- Table to store referral codes and stats
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Table to track individual referrals
CREATE TABLE public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, credited
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  credited_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(referred_user_id)
);

-- Table to track referral rewards/earnings
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversion_id UUID REFERENCES public.referral_conversions(id) ON DELETE SET NULL,
  reward_type TEXT NOT NULL, -- signup_bonus, trade_commission, etc
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_referrals
CREATE POLICY "Users can view their own referral data"
  ON public.user_referrals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
  ON public.user_referrals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral data"
  ON public.user_referrals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for referral_conversions
CREATE POLICY "Users can view their referrals"
  ON public.referral_conversions
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create conversions"
  ON public.referral_conversions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update conversions"
  ON public.referral_conversions
  FOR UPDATE
  USING (true);

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards"
  ON public.referral_rewards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rewards"
  ON public.referral_rewards
  FOR UPDATE
  USING (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM user_referrals WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_referrals (user_id, referral_code)
  VALUES (NEW.id, public.generate_referral_code());
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create referral code on user signup
CREATE TRIGGER on_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral_code();

-- Function to process referral conversion
CREATE OR REPLACE FUNCTION public.process_referral_conversion(
  p_referred_user_id UUID,
  p_referral_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_conversion_id UUID;
  v_reward_amount NUMERIC := 10.00; -- $10 signup bonus
BEGIN
  -- Find referrer by code
  SELECT user_id INTO v_referrer_id
  FROM user_referrals
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;
  
  -- Check if user already used a referral
  IF EXISTS(SELECT 1 FROM referral_conversions WHERE referred_user_id = p_referred_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already used a referral code');
  END IF;
  
  -- Create conversion record
  INSERT INTO referral_conversions (
    referrer_id,
    referred_user_id,
    referral_code,
    status,
    reward_amount
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    p_referral_code,
    'completed',
    v_reward_amount
  ) RETURNING id INTO v_conversion_id;
  
  -- Create reward for referrer
  INSERT INTO referral_rewards (
    user_id,
    conversion_id,
    reward_type,
    amount,
    status
  ) VALUES (
    v_referrer_id,
    v_conversion_id,
    'signup_bonus',
    v_reward_amount,
    'pending'
  );
  
  -- Update referrer stats
  UPDATE user_referrals
  SET 
    total_referrals = total_referrals + 1,
    total_earnings = total_earnings + v_reward_amount,
    updated_at = now()
  WHERE user_id = v_referrer_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'conversion_id', v_conversion_id,
    'reward_amount', v_reward_amount
  );
END;
$$;

-- Function to get referral leaderboard
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  referral_code TEXT,
  total_referrals INTEGER,
  total_earnings NUMERIC,
  rank INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.user_id,
    ur.referral_code,
    ur.total_referrals,
    ur.total_earnings,
    ROW_NUMBER() OVER (ORDER BY ur.total_earnings DESC, ur.total_referrals DESC)::INTEGER as rank
  FROM user_referrals ur
  ORDER BY ur.total_earnings DESC, ur.total_referrals DESC
  LIMIT limit_count;
$$;

-- Indexes for performance
CREATE INDEX idx_user_referrals_user_id ON public.user_referrals(user_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX idx_referral_conversions_referrer ON public.referral_conversions(referrer_id);
CREATE INDEX idx_referral_conversions_referred ON public.referral_conversions(referred_user_id);
CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_conversion ON public.referral_rewards(conversion_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_referral_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_referrals_updated_at
  BEFORE UPDATE ON public.user_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_updated_at();