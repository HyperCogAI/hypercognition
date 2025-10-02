-- Delete dummy admin_users that don't have corresponding profiles
DELETE FROM admin_users 
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Add foreign key relationship from admin_users to profiles
ALTER TABLE admin_users
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(user_id) 
ON DELETE CASCADE;

-- Ensure profiles RLS allows admins to see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Ensure RLS on content_moderation allows admins
DROP POLICY IF EXISTS "Admins can view moderation" ON content_moderation;
CREATE POLICY "Admins can view moderation"
ON content_moderation FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);