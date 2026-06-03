CREATE POLICY "Admin can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);