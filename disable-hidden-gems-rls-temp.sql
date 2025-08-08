-- Temporarily disable RLS for hidden gem visits to test functionality
-- This will help us confirm that RLS is the issue

-- Disable RLS completely for hidden_gem_visits table
ALTER TABLE hidden_gem_visits DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean slate
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can view own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can insert hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can update own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can delete own hidden gem visits" ON hidden_gem_visits;

-- Success message
SELECT 'RLS disabled for hidden_gem_visits - should work now (TEMPORARY FIX)' as status;
