-- Fix security warning: Set search_path for the trigger function
CREATE OR REPLACE FUNCTION update_custom_solana_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;