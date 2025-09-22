-- Fix security warning by properly dropping triggers and recreating function
DROP TRIGGER IF EXISTS update_solana_tokens_updated_at ON public.solana_tokens;
DROP TRIGGER IF EXISTS update_solana_portfolios_updated_at ON public.solana_portfolios;
DROP FUNCTION IF EXISTS public.update_solana_updated_at_column();

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION public.update_solana_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate triggers
CREATE TRIGGER update_solana_tokens_updated_at
  BEFORE UPDATE ON public.solana_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solana_updated_at_column();

CREATE TRIGGER update_solana_portfolios_updated_at
  BEFORE UPDATE ON public.solana_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_solana_updated_at_column();