-- Update NEAR token to be labeled as Other
UPDATE public.token_chain_overrides
SET primary_chain = 'Other',
    liquidity_chain = NULL,
    updated_at = now()
WHERE symbol = 'NEAR';