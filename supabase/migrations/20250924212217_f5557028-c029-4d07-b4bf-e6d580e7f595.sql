-- Step 1: First, just drop the problematic team_members policies that cause infinite recursion
DROP POLICY IF EXISTS "Organization admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their organization members" ON public.team_members;