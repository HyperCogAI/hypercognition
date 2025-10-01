-- Add wallet columns to existing profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS wallet_address text UNIQUE,
  ADD COLUMN IF NOT EXISTS wallet_type text; -- 'evm' or 'solana'

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Profiles are viewable by everyone (public info)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user creation with wallet data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with wallet address from metadata
  INSERT INTO public.profiles (user_id, wallet_address, wallet_type, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.raw_user_meta_data->>'wallet_type',
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    wallet_address = COALESCE(EXCLUDED.wallet_address, profiles.wallet_address),
    wallet_type = COALESCE(EXCLUDED.wallet_type, profiles.wallet_type),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create/update profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);