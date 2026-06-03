CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies para sa videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Client makikita lang sariling videos
CREATE POLICY "Users can view own videos"
ON videos FOR SELECT
USING (auth.uid() = user_id);

-- Client makakapag-insert ng sariling video
CREATE POLICY "Users can insert own videos"
ON videos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Client makakapag-delete ng sariling video
CREATE POLICY "Users can delete own videos"
ON videos FOR DELETE
USING (auth.uid() = user_id);

-- Admin makikita lahat ng videos
CREATE POLICY "Admin can view all videos"
ON videos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);