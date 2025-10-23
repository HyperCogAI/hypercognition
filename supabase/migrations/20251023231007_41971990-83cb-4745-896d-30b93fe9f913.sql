-- Track authentication methods for users
CREATE TABLE IF NOT EXISTS public.user_auth_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('email', 'magic_link', 'google', 'twitter', 'wallet_evm', 'wallet_solana')),
  provider_id TEXT,
  first_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, auth_method, provider_id)
);

-- Enable RLS
ALTER TABLE public.user_auth_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own auth methods
CREATE POLICY "Users can view their own auth methods"
  ON public.user_auth_methods
  FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert auth methods
CREATE POLICY "System can insert auth methods"
  ON public.user_auth_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- System can update last_used_at
CREATE POLICY "System can update auth methods"
  ON public.user_auth_methods
  FOR UPDATE
  USING (auth.uid() = user_id);