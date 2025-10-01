-- Core Trading Backend Infrastructure (Fixed)

-- =============================================
-- 1. USER BALANCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  available_balance NUMERIC NOT NULL DEFAULT 10000,
  locked_balance NUMERIC NOT NULL DEFAULT 0,
  total_balance NUMERIC GENERATED ALWAYS AS (available_balance + locked_balance) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_balances' AND policyname = 'Users can view their own balance'
  ) THEN
    CREATE POLICY "Users can view their own balance" ON public.user_balances FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_balances' AND policyname = 'Users can insert their own balance'
  ) THEN
    CREATE POLICY "Users can insert their own balance" ON public.user_balances FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_balances' AND policyname = 'System can update balances'
  ) THEN
    CREATE POLICY "System can update balances" ON public.user_balances FOR UPDATE USING (true);
  END IF;
END $$;

-- =============================================
-- 2. USER HOLDINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_buy_price NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  realized_pnl NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own holdings" ON public.user_holdings;
DROP POLICY IF EXISTS "Users can insert their own holdings" ON public.user_holdings;
DROP POLICY IF EXISTS "System can update holdings" ON public.user_holdings;

CREATE POLICY "Users can view their own holdings" ON public.user_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holdings" ON public.user_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update holdings" ON public.user_holdings FOR UPDATE USING (true);

-- =============================================
-- 3. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal')),
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  fees NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'System can create transactions'
  ) THEN
    CREATE POLICY "System can create transactions" ON public.transactions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- =============================================
-- 4. ENHANCE ORDERS TABLE
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='fees') THEN
    ALTER TABLE public.orders ADD COLUMN fees NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='average_fill_price') THEN
    ALTER TABLE public.orders ADD COLUMN average_fill_price NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='time_in_force') THEN
    ALTER TABLE public.orders ADD COLUMN time_in_force TEXT DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK', 'DAY'));
  END IF;
END $$;

-- =============================================
-- 5. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON public.user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_holdings_user_id ON public.user_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_holdings_agent_id ON public.user_holdings(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);

-- =============================================
-- 6. TRIGGER FOR UPDATED_AT
-- =============================================
DROP TRIGGER IF EXISTS update_user_balances_updated_at ON public.user_balances;
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON public.user_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_holdings_updated_at ON public.user_holdings;
CREATE TRIGGER update_user_holdings_updated_at BEFORE UPDATE ON public.user_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. ENABLE REALTIME
-- =============================================
ALTER TABLE public.user_holdings REPLICA IDENTITY FULL;
ALTER TABLE public.user_balances REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;