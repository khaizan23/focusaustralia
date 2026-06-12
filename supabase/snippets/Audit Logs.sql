CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_id UUID,
  target_name TEXT,
  performed_by UUID REFERENCES profiles(id),
  performed_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;