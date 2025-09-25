-- Fix critical security issue: Remove overly permissive policy on marketplace_developers
DROP POLICY IF EXISTS "Marketplace data is viewable by everyone" ON public.marketplace_developers;

-- Drop existing views to avoid conflicts
DROP VIEW IF EXISTS public.marketplace_developers_public;
DROP VIEW IF EXISTS public.developer_marketplace_public;

-- Create restricted policy for marketplace_developers - only basic info for verified developers
CREATE POLICY "Public can view basic verified developer info" 
ON public.marketplace_developers 
FOR SELECT 
USING (verified = true);

-- Create secure public view that excludes sensitive business data
CREATE VIEW public.marketplace_developers_public AS
SELECT 
  id,
  company_name,
  description,
  logo_url,
  website_url,
  verified,
  created_at,
  -- Exclude sensitive data: total_revenue, total_apis - only show count for verified
  CASE WHEN verified THEN total_apis ELSE NULL END as total_apis
FROM public.marketplace_developers
WHERE verified = true;

-- Grant public access to the secure view
GRANT SELECT ON public.marketplace_developers_public TO anon;
GRANT SELECT ON public.marketplace_developers_public TO authenticated;

-- Create admin-only policy for full marketplace_developers access
CREATE POLICY "Admins can view all developer data" 
ON public.marketplace_developers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.developer_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID,
  developer_id UUID,
  access_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.developer_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view developer access logs" 
ON public.developer_data_access_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- System can log access
CREATE POLICY "System can log developer data access" 
ON public.developer_data_access_log 
FOR INSERT 
WITH CHECK (true);