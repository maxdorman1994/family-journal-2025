-- Fix RLS policies for hidden gems to allow public read access
-- This matches the pattern used for castles and lochs

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Hidden gems are viewable by authenticated users" ON hidden_gems;

-- Create new policy that allows public read access
CREATE POLICY "Hidden gems are publicly viewable" ON hidden_gems
    FOR SELECT USING (true);

-- Keep the insert policy for authenticated users only
CREATE POLICY "Hidden gems are insertable by authenticated users" ON hidden_gems
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Visits remain private (unchanged)
-- Users can only see their own visits, which is correct

-- Success message
SELECT 'Hidden gems RLS policies fixed - now publicly readable!' as status;
