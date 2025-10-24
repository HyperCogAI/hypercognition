-- Phase 2: Database Migration for Non-Custodial System

-- Step 1: Drop custodial balance table
DROP TABLE IF EXISTS public.user_balances CASCADE;

-- Step 2: Create user_verified_wallets table
CREATE TABLE public.user_verified_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL DEFAULT 'base',
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_primary BOOLEAN DEFAULT false,
  UNIQUE(user_id, wallet_address, chain)
);

CREATE INDEX idx_user_verified_wallets_user_id ON public.user_verified_wallets(user_id);
CREATE INDEX idx_user_verified_wallets_wallet ON public.user_verified_wallets(wallet_address);

-- RLS Policies for user_verified_wallets
ALTER TABLE public.user_verified_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallets"
  ON public.user_verified_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets"
  ON public.user_verified_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
  ON public.user_verified_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 3: Create blockchain_transactions table
CREATE TABLE public.blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_hash TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL DEFAULT 'base',
  contract_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  block_number BIGINT,
  gas_used BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE INDEX idx_blockchain_tx_hash ON public.blockchain_transactions(tx_hash);
CREATE INDEX idx_blockchain_user_id ON public.blockchain_transactions(user_id);
CREATE INDEX idx_blockchain_status ON public.blockchain_transactions(status);

-- RLS Policies for blockchain_transactions
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blockchain transactions"
  ON public.blockchain_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blockchain transactions"
  ON public.blockchain_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blockchain transactions"
  ON public.blockchain_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 4: Update acp_transactions table
ALTER TABLE public.acp_transactions
  ADD COLUMN IF NOT EXISTS blockchain_tx_id UUID REFERENCES public.blockchain_transactions(id),
  ADD COLUMN IF NOT EXISTS escrow_id BIGINT,
  ADD COLUMN IF NOT EXISTS is_blockchain BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_acp_tx_blockchain ON public.acp_transactions(blockchain_tx_id);
CREATE INDEX IF NOT EXISTS idx_acp_tx_escrow ON public.acp_transactions(escrow_id);