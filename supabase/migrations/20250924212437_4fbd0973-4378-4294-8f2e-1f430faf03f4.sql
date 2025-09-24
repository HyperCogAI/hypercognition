-- Step 4: Fix the security definer view issue by recreating views with SECURITY INVOKER
-- Drop existing views
DROP VIEW IF EXISTS public.marketplace_developers_public;
DROP VIEW IF EXISTS public.developer_marketplace_public;

-- Recreate them with explicit SECURITY INVOKER (runs with permissions of querying user)
CREATE VIEW public.marketplace_developers_public 
WITH (security_invoker=true) AS
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

-- Create the safe public view for public access with SECURITY INVOKER
CREATE VIEW public.developer_marketplace_public 
WITH (security_invoker=true) AS
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

-- Log this security fix
INSERT INTO public.security_audit_log (
  action,
  resource,
  details
) VALUES (
  'security_fix_applied',
  'security_definer_views',
  jsonb_build_object(
    'issue', 'views_using_security_definer_permissions',
    'severity', 'high',
    'fix_applied', 'recreated_views_with_security_invoker'
  )
);