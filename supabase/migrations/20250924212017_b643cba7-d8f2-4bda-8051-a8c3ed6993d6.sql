-- Fix infinite recursion in team_members RLS policies
-- The current policies reference the same table they're applied to, causing infinite recursion

-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Organization admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their organization members" ON public.team_members;

-- Create a security definer function to check if user is an org admin
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE organization_id = org_id 
      AND user_id = auth.uid() 
      AND role = ANY(ARRAY['admin', 'owner']) 
      AND status = 'active'
  );
$function$;

-- Create a security definer function to check if user is an org member  
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE organization_id = org_id 
      AND user_id = auth.uid() 
      AND status = 'active'
  );
$function$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Organization admins can manage team members" ON public.team_members
FOR ALL USING (public.is_organization_admin(organization_id));

CREATE POLICY "Team members can view their organization" ON public.team_members
FOR SELECT USING (public.is_organization_member(organization_id));

-- Also fix the views that are flagged as security definer issues
-- Drop the existing views
DROP VIEW IF EXISTS public.marketplace_developers_public;
DROP VIEW IF EXISTS public.developer_marketplace_public;

-- Recreate them as regular views (without security definer)
CREATE VIEW public.marketplace_developers_public AS
SELECT 
  id,
  description,
  website_url,
  logo_url,
  verified,
  total_apis,
  created_at,
  CASE 
    WHEN verified = true THEN total_revenue
    ELSE NULL 
  END as total_revenue
FROM public.marketplace_developers
WHERE verified = true;

-- Create the safe public view for public access
CREATE VIEW public.developer_marketplace_public AS
SELECT 
  id,
  description,
  website_url,
  logo_url,
  total_apis,
  created_at,
  CASE 
    WHEN verified = true THEN ROUND(total_revenue, 0)
    ELSE NULL 
  END as total_revenue_estimate
FROM public.marketplace_developers
WHERE verified = true;

-- Grant appropriate permissions
GRANT SELECT ON public.marketplace_developers_public TO authenticated;
GRANT SELECT ON public.developer_marketplace_public TO anon, authenticated;

-- Log the security fix
INSERT INTO public.security_audit_log (
  action,
  resource,
  details
) VALUES (
  'security_fix_applied',
  'team_members_rls_infinite_recursion',
  jsonb_build_object(
    'issue', 'infinite_recursion_in_rls_policies',
    'severity', 'critical',
    'fix_applied', 'created_security_definer_functions_to_break_recursion'
  )
);