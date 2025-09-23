-- Create institutional organizations table
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'fund'::text,
  tier text NOT NULL DEFAULT 'standard'::text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  settings jsonb NOT NULL DEFAULT '{
    "trading_limits": {
      "daily_volume_limit": 1000000,
      "max_position_size": 100000,
      "risk_tolerance": "medium"
    },
    "compliance_settings": {
      "kyc_required": true,
      "aml_monitoring": true,
      "reporting_frequency": "monthly"
    },
    "white_label": {
      "custom_branding": false,
      "custom_domain": null,
      "api_access": true
    }
  }'::jsonb
);

-- Create team members table
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'trader'::text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active'::text,
  invited_by uuid,
  joined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create API keys table
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create compliance frameworks table
CREATE TABLE public.compliance_frameworks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  type text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create compliance violations table
CREATE TABLE public.compliance_violations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id),
  requirement_id text NOT NULL,
  severity text NOT NULL DEFAULT 'medium'::text,
  status text NOT NULL DEFAULT 'open'::text,
  description text NOT NULL,
  resolution text,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create exchange connections table
CREATE TABLE public.exchange_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exchange_name text NOT NULL,
  is_testnet boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  api_key_encrypted text NOT NULL,
  connection_status text NOT NULL DEFAULT 'disconnected'::text,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, exchange_name, is_testnet)
);

-- Create exchange market data table
CREATE TABLE public.exchange_market_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_name text NOT NULL,
  symbol text NOT NULL,
  price numeric NOT NULL,
  volume_24h numeric DEFAULT 0,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  bid_price numeric,
  ask_price numeric,
  high_24h numeric,
  low_24h numeric,
  change_24h numeric DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_market_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Organization members can view their organization" 
ON public.organizations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE team_members.organization_id = organizations.id 
  AND team_members.user_id = auth.uid()
  AND team_members.status = 'active'
));

CREATE POLICY "Organization admins can update their organization" 
ON public.organizations FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE team_members.organization_id = organizations.id 
  AND team_members.user_id = auth.uid()
  AND team_members.role IN ('admin', 'owner')
  AND team_members.status = 'active'
));

-- Create RLS policies for team members
CREATE POLICY "Team members can view their organization members" 
ON public.team_members FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members tm
  WHERE tm.organization_id = team_members.organization_id 
  AND tm.user_id = auth.uid()
  AND tm.status = 'active'
));

CREATE POLICY "Organization admins can manage team members" 
ON public.team_members FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.team_members tm
  WHERE tm.organization_id = team_members.organization_id 
  AND tm.user_id = auth.uid()
  AND tm.role IN ('admin', 'owner')
  AND tm.status = 'active'
));

-- Create RLS policies for API keys
CREATE POLICY "Organization members can view API keys" 
ON public.api_keys FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE team_members.organization_id = api_keys.organization_id 
  AND team_members.user_id = auth.uid()
  AND team_members.status = 'active'
));

CREATE POLICY "Organization admins can manage API keys" 
ON public.api_keys FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE team_members.organization_id = api_keys.organization_id 
  AND team_members.user_id = auth.uid()
  AND team_members.role IN ('admin', 'owner')
  AND team_members.status = 'active'
));

-- Create RLS policies for compliance frameworks
CREATE POLICY "Compliance frameworks are viewable by everyone" 
ON public.compliance_frameworks FOR SELECT 
USING (is_active = true);

-- Create RLS policies for compliance violations
CREATE POLICY "Organization members can view their violations" 
ON public.compliance_violations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.team_members 
  WHERE team_members.organization_id = compliance_violations.organization_id 
  AND team_members.user_id = auth.uid()
  AND team_members.status = 'active'
));

-- Create RLS policies for exchange connections
CREATE POLICY "Users can manage their own exchange connections" 
ON public.exchange_connections FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for exchange market data
CREATE POLICY "Exchange market data is viewable by everyone" 
ON public.exchange_market_data FOR SELECT 
USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_frameworks_updated_at
  BEFORE UPDATE ON public.compliance_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exchange_connections_updated_at
  BEFORE UPDATE ON public.exchange_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample compliance frameworks
INSERT INTO public.compliance_frameworks (name, region, type, description, requirements) VALUES
('MiFID II', 'EU', 'financial_regulation', 'Markets in Financial Instruments Directive II - EU regulation for investment services', 
 '[
   {"id": "mifid_001", "title": "Transaction Reporting", "description": "All transactions must be reported within 24 hours", "category": "reporting", "mandatory": true},
   {"id": "mifid_002", "title": "Best Execution", "description": "Must demonstrate best execution for client orders", "category": "execution", "mandatory": true},
   {"id": "mifid_003", "title": "Client Classification", "description": "Proper classification of retail vs professional clients", "category": "kyc", "mandatory": true}
 ]'::jsonb),
('SEC Regulation', 'US', 'financial_regulation', 'Securities and Exchange Commission regulations for US markets',
 '[
   {"id": "sec_001", "title": "Form 13F Filing", "description": "Quarterly reporting for institutional investment managers", "category": "reporting", "mandatory": true},
   {"id": "sec_002", "title": "Anti-Money Laundering", "description": "AML compliance and suspicious activity reporting", "category": "aml", "mandatory": true},
   {"id": "sec_003", "title": "Market Making Rules", "description": "Compliance with market making regulations", "category": "trading", "mandatory": false}
 ]'::jsonb),
('CFTC Rules', 'US', 'derivatives_regulation', 'Commodity Futures Trading Commission regulations',
 '[
   {"id": "cftc_001", "title": "Position Limits", "description": "Compliance with position limits on commodity derivatives", "category": "risk", "mandatory": true},
   {"id": "cftc_002", "title": "Swap Dealer Registration", "description": "Registration requirements for swap dealers", "category": "registration", "mandatory": true}
 ]'::jsonb);