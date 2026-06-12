CREATE TABLE experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  employment_type TEXT,
  job_description TEXT,
  is_current BOOLEAN DEFAULT true,
  start_month TEXT,
  start_year TEXT,
  end_month TEXT,
  end_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;