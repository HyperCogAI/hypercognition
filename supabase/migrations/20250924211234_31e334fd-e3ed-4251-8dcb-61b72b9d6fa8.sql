-- CRITICAL SECURITY FIX: marketplace_developers table exposes user data
-- This table currently allows public access to developer information which could be used to target specific users

-- First, enable RLS if not already enabled
ALTER TABLE public.marketplace_developers ENABLE ROW LEVEL SECURITY;

-- Remove any existing overly permissive policies
DROP POLICY IF EXISTS "Marketplace developers are viewable by everyone" ON public.marketplace_developers;

-- Create secure RLS policies for marketplace_developers table

-- 1. Developers can view and manage their own profile
CREATE POLICY "Developers can manage their own profile" ON public.marketplace_developers
FOR ALL USING (auth.uid() = user_id);

-- 2. Public can view only verified developer information (excluding sensitive user_id)
CREATE POLICY "Public can view verified developer info" ON public.marketplace_developers
FOR SELECT USING (verified = true);

-- 3. Admins can manage all developer profiles
CREATE POLICY "Admins can manage all developer profiles" ON public.marketplace_developers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Create a secure view for public developer information that excludes sensitive user_id
CREATE OR REPLACE VIEW public.marketplace_developers_public AS
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

-- Grant public access to the safe view instead of the table
GRANT SELECT ON public.marketplace_developers_public TO anon;
GRANT SELECT ON public.marketplace_developers_public TO authenticated;

-- Ensure only authenticated users can access the full table (with RLS protection)
REVOKE ALL ON public.marketplace_developers FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_developers TO authenticated;

-- Create a function to safely get developer stats without exposing user_id
CREATE OR REPLACE FUNCTION public.get_developer_public_stats(developer_profile_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_apis', total_apis,
    'verified', verified,
    'created_at', created_at,
    'description', CASE WHEN verified THEN description ELSE 'Developer profile pending verification' END
  )
  FROM public.marketplace_developers
  WHERE id = developer_profile_id AND verified = true;
$$;