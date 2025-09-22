-- DeFi Integration Tables
CREATE TABLE public.defi_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'yield_farming', 'liquidity_mining'
  base_token TEXT NOT NULL,
  quote_token TEXT NOT NULL,
  apy NUMERIC NOT NULL DEFAULT 0,
  tvl NUMERIC NOT NULL DEFAULT 0,
  rewards_token TEXT NOT NULL,
  pool_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_defi_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.defi_pools(id),
  amount_deposited NUMERIC NOT NULL DEFAULT 0,
  rewards_earned NUMERIC NOT NULL DEFAULT 0,
  last_claim_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- NFT Trading Tables
CREATE TABLE public.nft_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  contract_address TEXT NOT NULL,
  creator_id UUID NOT NULL,
  floor_price NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  total_supply INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nft_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.nft_collections(id),
  token_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  owner_id UUID NOT NULL,
  is_listed BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nft_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID NOT NULL REFERENCES public.nft_items(id),
  seller_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nft_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID NOT NULL REFERENCES public.nft_items(id),
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETH',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staking Rewards Tables
CREATE TABLE public.staking_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  apy NUMERIC NOT NULL,
  min_stake_amount NUMERIC NOT NULL DEFAULT 0,
  max_stake_amount NUMERIC,
  lock_period_days INTEGER NOT NULL DEFAULT 0,
  total_staked NUMERIC NOT NULL DEFAULT 0,
  rewards_pool NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_stakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.staking_programs(id),
  amount NUMERIC NOT NULL,
  rewards_earned NUMERIC NOT NULL DEFAULT 0,
  staked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE,
  last_reward_claim TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral System Tables
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  reward_percentage NUMERIC NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL DEFAULT 0,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE public.defi_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_defi_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- DeFi Policies
CREATE POLICY "DeFi pools are viewable by everyone" ON public.defi_pools FOR SELECT USING (true);
CREATE POLICY "Users can view their own DeFi positions" ON public.user_defi_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own DeFi positions" ON public.user_defi_positions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- NFT Policies
CREATE POLICY "NFT collections are viewable by everyone" ON public.nft_collections FOR SELECT USING (true);
CREATE POLICY "NFT items are viewable by everyone" ON public.nft_items FOR SELECT USING (true);
CREATE POLICY "Users can update their own NFTs" ON public.nft_items FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "NFT listings are viewable by everyone" ON public.nft_listings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own listings" ON public.nft_listings FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "NFT sales are viewable by everyone" ON public.nft_sales FOR SELECT USING (true);
CREATE POLICY "Users can create sales for their NFTs" ON public.nft_sales FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Staking Policies
CREATE POLICY "Staking programs are viewable by everyone" ON public.staking_programs FOR SELECT USING (true);
CREATE POLICY "Users can view their own stakes" ON public.user_stakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own stakes" ON public.user_stakes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Referral Policies
CREATE POLICY "Users can view their own referral codes" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own referral codes" ON public.referral_codes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view referrals they made or received" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "System can create referrals" ON public.referrals FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_defi_pools_updated_at BEFORE UPDATE ON public.defi_pools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_defi_positions_updated_at BEFORE UPDATE ON public.user_defi_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nft_items_updated_at BEFORE UPDATE ON public.nft_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staking_programs_updated_at BEFORE UPDATE ON public.staking_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_stakes_updated_at BEFORE UPDATE ON public.user_stakes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();