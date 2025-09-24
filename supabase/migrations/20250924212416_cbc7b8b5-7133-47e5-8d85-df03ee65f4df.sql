-- Step 3: Fix the views that are causing security definer issues
-- Drop and recreate the views as regular views (without security definer)
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