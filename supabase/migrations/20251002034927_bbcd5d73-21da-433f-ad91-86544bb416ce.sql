-- Create comprehensive Agent Commerce Protocol (ACP) backend

-- ACP Services table - Services that agents can offer
CREATE TABLE IF NOT EXISTS public.acp_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USDC',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  delivery_time_hours integer,
  requirements jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_orders integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ACP Jobs table - Job postings and fulfillment
CREATE TABLE IF NOT EXISTS public.acp_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  budget numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
  deadline timestamp with time zone,
  requirements jsonb DEFAULT '[]'::jsonb,
  deliverables jsonb DEFAULT '[]'::jsonb,
  bids_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone
);

-- ACP Transactions table - All commercial transactions
CREATE TABLE IF NOT EXISTS public.acp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL CHECK (transaction_type IN ('service_payment', 'job_payment', 'tip', 'refund', 'escrow_release', 'subscription')),
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.acp_services(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.acp_jobs(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  fee numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  payment_method text,
  transaction_hash text,
  blockchain text,
  escrow_until timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- ACP Contracts table - Smart contract agreements
CREATE TABLE IF NOT EXISTS public.acp_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type text NOT NULL CHECK (contract_type IN ('service_agreement', 'job_contract', 'subscription', 'partnership', 'revenue_share')),
  party_a_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  party_b_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.acp_services(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.acp_jobs(id) ON DELETE SET NULL,
  title text NOT NULL,
  terms jsonb NOT NULL,
  payment_terms jsonb NOT NULL,
  deliverables jsonb DEFAULT '[]'::jsonb,
  milestones jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'active', 'completed', 'terminated', 'disputed')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  signed_by_a_at timestamp with time zone,
  signed_by_b_at timestamp with time zone,
  contract_hash text,
  blockchain_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ACP Job Bids table - Bids on job postings
CREATE TABLE IF NOT EXISTS public.acp_job_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.acp_jobs(id) ON DELETE CASCADE NOT NULL,
  bidder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC',
  delivery_time_hours integer,
  proposal text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ACP Reviews table - Service and job reviews
CREATE TABLE IF NOT EXISTS public.acp_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.acp_services(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.acp_jobs(id) ON DELETE SET NULL,
  transaction_id uuid REFERENCES public.acp_transactions(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  response_text text,
  response_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.acp_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for acp_services
CREATE POLICY "Services are viewable by everyone"
  ON public.acp_services FOR SELECT
  TO authenticated
  USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Creators can insert their services"
  ON public.acp_services FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their services"
  ON public.acp_services FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can delete their services"
  ON public.acp_services FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS Policies for acp_jobs
CREATE POLICY "Active jobs are viewable by everyone"
  ON public.acp_jobs FOR SELECT
  TO authenticated
  USING (status IN ('open', 'assigned', 'in_progress') OR poster_id = auth.uid() OR assignee_id = auth.uid());

CREATE POLICY "Users can create jobs"
  ON public.acp_jobs FOR INSERT
  TO authenticated
  WITH CHECK (poster_id = auth.uid());

CREATE POLICY "Job posters and assignees can update"
  ON public.acp_jobs FOR UPDATE
  TO authenticated
  USING (poster_id = auth.uid() OR assignee_id = auth.uid())
  WITH CHECK (poster_id = auth.uid() OR assignee_id = auth.uid());

-- RLS Policies for acp_transactions
CREATE POLICY "Users can view their transactions"
  ON public.acp_transactions FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "System can create transactions"
  ON public.acp_transactions FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- RLS Policies for acp_contracts
CREATE POLICY "Contract parties can view"
  ON public.acp_contracts FOR SELECT
  TO authenticated
  USING (party_a_id = auth.uid() OR party_b_id = auth.uid());

CREATE POLICY "Users can create contracts"
  ON public.acp_contracts FOR INSERT
  TO authenticated
  WITH CHECK (party_a_id = auth.uid());

CREATE POLICY "Contract parties can update"
  ON public.acp_contracts FOR UPDATE
  TO authenticated
  USING (party_a_id = auth.uid() OR party_b_id = auth.uid())
  WITH CHECK (party_a_id = auth.uid() OR party_b_id = auth.uid());

-- RLS Policies for acp_job_bids
CREATE POLICY "Bidders and job posters can view bids"
  ON public.acp_job_bids FOR SELECT
  TO authenticated
  USING (
    bidder_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.acp_jobs WHERE id = job_id AND poster_id = auth.uid())
  );

CREATE POLICY "Users can create bids"
  ON public.acp_job_bids FOR INSERT
  TO authenticated
  WITH CHECK (bidder_id = auth.uid());

CREATE POLICY "Bidders can update their bids"
  ON public.acp_job_bids FOR UPDATE
  TO authenticated
  USING (bidder_id = auth.uid())
  WITH CHECK (bidder_id = auth.uid());

-- RLS Policies for acp_reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.acp_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.acp_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Reviewees can respond"
  ON public.acp_reviews FOR UPDATE
  TO authenticated
  USING (reviewee_id = auth.uid())
  WITH CHECK (reviewee_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX acp_services_agent_id_idx ON public.acp_services(agent_id);
CREATE INDEX acp_services_creator_id_idx ON public.acp_services(creator_id);
CREATE INDEX acp_services_status_idx ON public.acp_services(status);
CREATE INDEX acp_services_category_idx ON public.acp_services(category);

CREATE INDEX acp_jobs_poster_id_idx ON public.acp_jobs(poster_id);
CREATE INDEX acp_jobs_assignee_id_idx ON public.acp_jobs(assignee_id);
CREATE INDEX acp_jobs_status_idx ON public.acp_jobs(status);
CREATE INDEX acp_jobs_agent_id_idx ON public.acp_jobs(agent_id);

CREATE INDEX acp_transactions_from_user_idx ON public.acp_transactions(from_user_id);
CREATE INDEX acp_transactions_to_user_idx ON public.acp_transactions(to_user_id);
CREATE INDEX acp_transactions_agent_id_idx ON public.acp_transactions(agent_id);
CREATE INDEX acp_transactions_status_idx ON public.acp_transactions(status);
CREATE INDEX acp_transactions_created_at_idx ON public.acp_transactions(created_at DESC);

CREATE INDEX acp_contracts_party_a_idx ON public.acp_contracts(party_a_id);
CREATE INDEX acp_contracts_party_b_idx ON public.acp_contracts(party_b_id);
CREATE INDEX acp_contracts_status_idx ON public.acp_contracts(status);

CREATE INDEX acp_job_bids_job_id_idx ON public.acp_job_bids(job_id);
CREATE INDEX acp_job_bids_bidder_id_idx ON public.acp_job_bids(bidder_id);

CREATE INDEX acp_reviews_agent_id_idx ON public.acp_reviews(agent_id);
CREATE INDEX acp_reviews_service_id_idx ON public.acp_reviews(service_id);

-- Create update timestamp triggers
CREATE TRIGGER update_acp_services_updated_at
  BEFORE UPDATE ON public.acp_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acp_jobs_updated_at
  BEFORE UPDATE ON public.acp_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acp_contracts_updated_at
  BEFORE UPDATE ON public.acp_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acp_job_bids_updated_at
  BEFORE UPDATE ON public.acp_job_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acp_reviews_updated_at
  BEFORE UPDATE ON public.acp_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_acp_dashboard_stats(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_earnings numeric;
  active_services integer;
  completed_jobs integer;
  pending_transactions integer;
BEGIN
  -- Calculate total earnings
  SELECT COALESCE(SUM(amount), 0) INTO total_earnings
  FROM public.acp_transactions
  WHERE to_user_id = user_id_param
  AND status = 'completed';
  
  -- Count active services
  SELECT COUNT(*) INTO active_services
  FROM public.acp_services
  WHERE creator_id = user_id_param
  AND status = 'active';
  
  -- Count completed jobs
  SELECT COUNT(*) INTO completed_jobs
  FROM public.acp_jobs
  WHERE (poster_id = user_id_param OR assignee_id = user_id_param)
  AND status = 'completed';
  
  -- Count pending transactions
  SELECT COUNT(*) INTO pending_transactions
  FROM public.acp_transactions
  WHERE (from_user_id = user_id_param OR to_user_id = user_id_param)
  AND status IN ('pending', 'processing');
  
  RETURN jsonb_build_object(
    'total_earnings', total_earnings,
    'active_services', active_services,
    'completed_jobs', completed_jobs,
    'pending_transactions', pending_transactions
  );
END;
$$;

COMMENT ON FUNCTION public.get_acp_dashboard_stats(uuid) IS 'Returns comprehensive dashboard statistics for ACP user';