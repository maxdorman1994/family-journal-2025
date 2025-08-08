-- ============================================
-- Custom Item Creation RLS Policies
-- Enables authenticated users to create custom castles, lochs, and hidden gems
-- ============================================

-- First, ensure RLS is enabled on all tables
ALTER TABLE castles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lochs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_gems ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Castles are viewable by everyone" ON castles;
DROP POLICY IF EXISTS "Custom castles insertable by authenticated users" ON castles;
DROP POLICY IF EXISTS "Lochs are viewable by everyone" ON lochs;
DROP POLICY IF EXISTS "Custom lochs insertable by authenticated users" ON lochs;
DROP POLICY IF EXISTS "Hidden gems are viewable by everyone" ON hidden_gems;
DROP POLICY IF EXISTS "Custom hidden gems insertable by authenticated users" ON hidden_gems;

-- RLS Policies for castles
-- Allow everyone to view all castles (official and custom)
CREATE POLICY "Castles are viewable by everyone" ON castles
    FOR SELECT USING (true);

-- Allow authenticated users to insert custom castles only
CREATE POLICY "Custom castles insertable by authenticated users" ON castles
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND is_custom = true
    );

-- RLS Policies for lochs
-- Allow everyone to view all lochs (official and custom)
CREATE POLICY "Lochs are viewable by everyone" ON lochs
    FOR SELECT USING (true);

-- Allow authenticated users to insert custom lochs only
CREATE POLICY "Custom lochs insertable by authenticated users" ON lochs
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND is_custom = true
    );

-- RLS Policies for hidden gems
-- Allow everyone to view all hidden gems (official and custom)
CREATE POLICY "Hidden gems are viewable by everyone" ON hidden_gems
    FOR SELECT USING (true);

-- Allow authenticated users to insert custom hidden gems only
CREATE POLICY "Custom hidden gems insertable by authenticated users" ON hidden_gems
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND is_custom = true
    );

-- Ensure visit tables allow proper access
-- Drop existing visit policies
DROP POLICY IF EXISTS "Castle visits viewable by users" ON castle_visits;
DROP POLICY IF EXISTS "Castle visits insertable by users" ON castle_visits;
DROP POLICY IF EXISTS "Castle visits updatable by users" ON castle_visits;
DROP POLICY IF EXISTS "Castle visits deletable by users" ON castle_visits;

DROP POLICY IF EXISTS "Loch visits viewable by users" ON loch_visits;
DROP POLICY IF EXISTS "Loch visits insertable by users" ON loch_visits;
DROP POLICY IF EXISTS "Loch visits updatable by users" ON loch_visits;
DROP POLICY IF EXISTS "Loch visits deletable by users" ON loch_visits;

-- Enable RLS on visit tables
ALTER TABLE castle_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE loch_visits ENABLE ROW LEVEL SECURITY;

-- Castle visits policies (family sharing - no user restriction)
CREATE POLICY "Castle visits viewable by users" ON castle_visits
    FOR SELECT USING (true);

CREATE POLICY "Castle visits insertable by users" ON castle_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Castle visits updatable by users" ON castle_visits
    FOR UPDATE USING (true);

CREATE POLICY "Castle visits deletable by users" ON castle_visits
    FOR DELETE USING (true);

-- Loch visits policies (family sharing - no user restriction)
CREATE POLICY "Loch visits viewable by users" ON loch_visits
    FOR SELECT USING (true);

CREATE POLICY "Loch visits insertable by users" ON loch_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Loch visits updatable by users" ON loch_visits
    FOR UPDATE USING (true);

CREATE POLICY "Loch visits deletable by users" ON loch_visits
    FOR DELETE USING (true);

-- Success message
SELECT 'Custom item creation RLS policies configured successfully!' as status;
