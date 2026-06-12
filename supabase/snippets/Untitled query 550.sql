CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admin can view all videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);