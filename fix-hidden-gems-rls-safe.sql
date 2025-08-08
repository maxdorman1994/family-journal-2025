-- Fix RLS policies for hidden gems (Safe Version - handles existing policies)
-- This matches the pattern used for castles and lochs

-- Drop all existing policies safely
DROP POLICY IF EXISTS "Hidden gems are viewable by authenticated users" ON hidden_gems;
DROP POLICY IF EXISTS "Hidden gems are insertable by authenticated users" ON hidden_gems;
DROP POLICY IF EXISTS "Hidden gems are publicly viewable" ON hidden_gems;

-- Create new policies that allow public read access
CREATE POLICY "Hidden gems are publicly viewable" ON hidden_gems
    FOR SELECT USING (true);

CREATE POLICY "Hidden gems are insertable by authenticated users" ON hidden_gems
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Success message
SELECT 'Hidden gems RLS policies fixed - now publicly readable!' as status;
