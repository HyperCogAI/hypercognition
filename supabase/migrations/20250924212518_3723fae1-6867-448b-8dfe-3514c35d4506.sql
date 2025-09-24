-- Fix the function search path mutable warning by updating functions that don't have search_path set
-- Check which functions need to be updated
CREATE OR REPLACE FUNCTION public.get_developer_public_stats(developer_profile_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
  SELECT jsonb_build_object(
    'total_apis', total_apis,
    'verified', verified,
    'created_at', created_at,
    'description', CASE WHEN verified THEN description ELSE 'Developer profile pending verification' END
  )
  FROM public.marketplace_developers
  WHERE id = developer_profile_id AND verified = true;
$function$;