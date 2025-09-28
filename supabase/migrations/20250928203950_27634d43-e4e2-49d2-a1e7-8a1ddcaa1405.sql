-- Insert sample admin users (these will only insert if they don't exist)
INSERT INTO public.admin_users (user_id, role, permissions, is_active, created_by)
SELECT 
  '11111111-1111-1111-1111-111111111111'::uuid as user_id,
  'super_admin' as role,
  '["all_access", "user_management", "content_moderation", "system_admin"]'::jsonb as permissions,
  true as is_active,
  '11111111-1111-1111-1111-111111111111'::uuid as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid
);

INSERT INTO public.admin_users (user_id, role, permissions, is_active, created_by)
SELECT 
  '22222222-2222-2222-2222-222222222222'::uuid as user_id,
  'admin' as role,
  '["user_management", "content_moderation"]'::jsonb as permissions,
  true as is_active,
  '11111111-1111-1111-1111-111111111111'::uuid as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid
);

-- Create a function to make any authenticated user an admin for testing
CREATE OR REPLACE FUNCTION public.make_user_admin(target_user_id uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_users (user_id, role, permissions, is_active, created_by)
  VALUES (
    target_user_id,
    'admin',
    '["user_management", "content_moderation", "kyc_access"]'::jsonb,
    true,
    COALESCE(auth.uid(), target_user_id)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_active = true,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    updated_at = now();
END;
$$;