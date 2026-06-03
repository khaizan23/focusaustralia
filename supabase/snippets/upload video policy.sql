-- Storage policies para sa videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users makakapag-upload sa sariling folder
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users makikita ang sariling videos
CREATE POLICY "Users can view own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users makakapag-delete ng sariling videos
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Admin makikita lahat ng videos sa storage
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