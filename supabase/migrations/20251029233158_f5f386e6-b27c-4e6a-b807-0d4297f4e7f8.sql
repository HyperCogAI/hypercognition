-- Phase 1: Fix handle_new_user trigger - remove user_balances insert
-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function WITHOUT user_balances insert (non-custodial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name, email, wallet_address, wallet_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.raw_user_meta_data->>'wallet_type'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- For wallet users, also insert into user_verified_wallets
  IF NEW.raw_user_meta_data->>'wallet_address' IS NOT NULL THEN
    INSERT INTO public.user_verified_wallets (
      user_id,
      wallet_address,
      wallet_type,
      is_primary,
      verified_at
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'wallet_address',
      COALESCE(NEW.raw_user_meta_data->>'wallet_type', 'evm'),
      true,
      NOW()
    )
    ON CONFLICT (user_id, wallet_address) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();