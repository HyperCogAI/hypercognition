-- Ensure NEAR override exists and is set to 'Other'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.token_chain_overrides WHERE UPPER(symbol) = 'NEAR'
  ) THEN
    UPDATE public.token_chain_overrides
    SET primary_chain = 'Other',
        liquidity_chain = NULL,
        is_active = true,
        updated_at = now(),
        coingecko_id = COALESCE(coingecko_id, 'near')
    WHERE UPPER(symbol) = 'NEAR';
  ELSE
    INSERT INTO public.token_chain_overrides (symbol, coingecko_id, primary_chain, liquidity_chain, is_active)
    VALUES ('NEAR', 'near', 'Other', NULL, true);
  END IF;
END $$;