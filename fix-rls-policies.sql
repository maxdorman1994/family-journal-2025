-- Fix Row Level Security policies for journal_entries table
-- Run this in Supabase SQL Editor if you're still seeing access errors

-- First, let's make sure the table exists and check current policies
SELECT schemaname, tablename, hasrls 
FROM pg_tables 
WHERE tablename = 'journal_entries';

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'journal_entries';

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Allow all operations on journal_entries" ON journal_entries;

-- Create more permissive policies for development
CREATE POLICY "Enable all access for journal_entries" ON journal_entries
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want to disable RLS entirely for now (less secure but simpler)
-- Uncomment the line below if the above doesn't work
-- ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;

-- Verify the table has data
SELECT COUNT(*) as total_entries FROM journal_entries;

-- Test query to make sure everything works
SELECT id, title, date, location FROM journal_entries ORDER BY date DESC LIMIT 3;
