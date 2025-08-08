-- Fix hidden gem visits RLS policies to match castles/lochs pattern
-- This will auto-populate user_id and allow proper authentication

-- Drop existing visit policies
DROP POLICY IF EXISTS "Users can view own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can insert own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can update own hidden gem visits" ON hidden_gem_visits;
DROP POLICY IF EXISTS "Users can delete own hidden gem visits" ON hidden_gem_visits;

-- Create new policies that match castles/lochs pattern
CREATE POLICY "Users can view own hidden gem visits" ON hidden_gem_visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert hidden gem visits" ON hidden_gem_visits
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own hidden gem visits" ON hidden_gem_visits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden gem visits" ON hidden_gem_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to auto-populate user_id on insert (like castles/lochs)
CREATE OR REPLACE FUNCTION set_user_id_for_hidden_gem_visits()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_user_id_hidden_gem_visits ON hidden_gem_visits;

-- Create trigger to auto-set user_id
CREATE TRIGGER trigger_set_user_id_hidden_gem_visits
    BEFORE INSERT ON hidden_gem_visits
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_for_hidden_gem_visits();

-- Success message
SELECT 'Hidden gem visits RLS and triggers fixed - authentication should work now!' as status;
