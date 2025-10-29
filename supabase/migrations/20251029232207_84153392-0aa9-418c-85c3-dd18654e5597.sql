-- Function to auto-create profile and initialize balance when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (user_id, display_name, wallet_address, wallet_type)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      'Anonymous'
    ),
    new.raw_user_meta_data->>'wallet_address',
    new.raw_user_meta_data->>'wallet_type'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create initial balance (if user_balances table exists)
  INSERT INTO public.user_balances (user_id, balance, currency)
  VALUES (new.id, 10000, 'USD')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();