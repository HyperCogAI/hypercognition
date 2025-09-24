-- CRITICAL SECURITY FIX: Remove public access to marketplace_developers table
-- This prevents hackers from mapping user_id to actual users

-- Check current policies and remove dangerous ones
DROP POLICY IF EXISTS "Public can view verified developer info" ON public.marketplace_developers;
DROP POLICY IF EXISTS "Marketplace developers are viewable by everyone" ON public.marketplace_developers;

-- Create much more secure policies

-- 1. Developers can only manage their own profile
CREATE POLICY "Developers can manage own profile" ON public.marketplace_developers
FOR ALL USING (auth.uid() = user_id);

-- 2. Admins can manage all profiles
CREATE POLICY "Admins manage developer profiles" ON public.marketplace_developers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Create a completely safe public view that excludes ALL user-identifiable information
CREATE OR REPLACE VIEW public.developer_marketplace_public AS
SELECT 
  id,
  description,
  website_url,
  logo_url,
  total_apis,
  created_at,
  -- Only show revenue for verified developers, rounded for privacy
  CASE 
    WHEN verified = true THEN ROUND(total_revenue, 0)
    ELSE NULL 
  END as total_revenue_estimate
FROM public.marketplace_developers
WHERE verified = true;

-- Grant access to the safe view only
GRANT SELECT ON public.developer_marketplace_public TO anon, authenticated;

-- Completely revoke access to the main table from public
REVOKE ALL ON public.marketplace_developers FROM anon;

-- Log this security fix
INSERT INTO public.security_audit_log (
  action,
  resource, 
  details
) VALUES (
  'security_fix_applied',
  'marketplace_developers',
  jsonb_build_object(
    'issue', 'removed_public_access_to_user_mappable_data',
    'severity', 'critical',
    'fix_applied', 'restricted_rls_policies_and_created_safe_view'
  )
);