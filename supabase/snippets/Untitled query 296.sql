-- I-drop lahat ng existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Gumawa ng bagong policies na walang recursion
-- Policy 1: User makikita ang sariling profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: User makakapag-update ng sariling profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: Service role makakapag-insert
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);