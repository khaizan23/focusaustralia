-- I-drop lahat
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "videos_select_own" ON videos;
DROP POLICY IF EXISTS "videos_insert_own" ON videos;
DROP POLICY IF EXISTS "videos_delete_own" ON videos;
DROP POLICY IF EXISTS "videos_admin_select" ON videos;

-- I-disable muna ang RLS sa pareho
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;