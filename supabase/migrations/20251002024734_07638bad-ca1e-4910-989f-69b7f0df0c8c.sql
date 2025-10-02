-- Add RLS policies for KYC verifications to allow admin access
DROP POLICY IF EXISTS "Admins can view all KYC verifications" ON kyc_verifications;
CREATE POLICY "Admins can view all KYC verifications"
ON kyc_verifications FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can update KYC verifications" ON kyc_verifications;
CREATE POLICY "Admins can update KYC verifications"
ON kyc_verifications FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- Add RLS policies for agent_comments to allow admin access
DROP POLICY IF EXISTS "Admins can view all comments" ON agent_comments;
CREATE POLICY "Admins can view all comments"
ON agent_comments FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);