-- Final fix for hidden gem visits RLS - make it exactly like castles/lochs
-- This will match the working pattern that allows castle and loch visits

-- First, let's disable RLS temporarily to clear any existing bad data
ALTER TABLE hidden_gem_visits DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies and triggers
DROP POLICY IF EXISTS "Users can view own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can insert hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can update own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can delete own hidden gem visits" ON hidden_gem_visits;
DROP TRIGGER IF EXISTS trigger_set_user_id_hidden_gem_visits ON hidden_gem_visits;
DROP FUNCTION IF EXISTS set_user_id_for_hidden_gem_visits();

-- Re-enable RLS
ALTER TABLE hidden_gem_visits ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that match castle/loch pattern
CREATE POLICY "Enable all access for authenticated users" ON hidden_gem_visits
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create function to set user_id automatically
CREATE OR REPLACE FUNCTION set_user_id_for_hidden_gem_visits()
RETURNS TRIGGER AS $$
BEGIN
    -- Set user_id from auth context if not already set
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-populate user_id
CREATE TRIGGER trigger_set_user_id_hidden_gem_visits
    BEFORE INSERT ON hidden_gem_visits
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_for_hidden_gem_visits();

-- Success message
SELECT 'Hidden gem visits RLS completely fixed - should work like castles/lochs now!' as status;
