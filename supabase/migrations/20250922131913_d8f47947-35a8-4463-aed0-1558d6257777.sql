-- Fix security vulnerability: Restrict user_profiles table access
-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;

-- Create a secure policy that only allows users to view their own profiles
CREATE POLICY "Users can only view their own profiles" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);