DROP POLICY IF EXISTS "Admin can view all videos" ON videos;

CREATE POLICY "Admin can view all videos"
ON videos FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);