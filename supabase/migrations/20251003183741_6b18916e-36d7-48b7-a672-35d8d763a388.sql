-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'pro', 'elite');

-- Create enum for billing periods
CREATE TYPE public.billing_period AS ENUM ('monthly', 'annual');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier public.subscription_tier NOT NULL DEFAULT 'basic',
  billing_period public.billing_period DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method TEXT,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  next_payment_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id_param UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  tier public.subscription_tier,
  billing_period public.billing_period,
  status TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tier, billing_period, status, expires_at
  FROM public.user_subscriptions
  WHERE user_id = user_id_param
  LIMIT 1;
$$;

-- Create function to upgrade subscription
CREATE OR REPLACE FUNCTION public.upgrade_subscription(
  new_tier public.subscription_tier,
  new_billing_period public.billing_period
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  current_user_id UUID := auth.uid();
BEGIN
  -- Validate elite tier is not available yet
  IF new_tier = 'elite' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Elite tier is not available yet'
    );
  END IF;

  -- Insert or update subscription
  INSERT INTO public.user_subscriptions (
    user_id,
    tier,
    billing_period,
    status,
    started_at
  ) VALUES (
    current_user_id,
    new_tier,
    new_billing_period,
    'active',
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    tier = new_tier,
    billing_period = new_billing_period,
    status = 'active',
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'tier', new_tier,
    'billing_period', new_billing_period
  );
END;
$$;