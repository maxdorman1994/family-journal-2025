-- Create a working trigger to auto-populate user_id for hidden gem visits
-- This will make hidden gems work exactly like castles and lochs

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_set_user_id_hidden_gem_visits ON hidden_gem_visits;
DROP FUNCTION IF EXISTS set_user_id_for_hidden_gem_visits();

-- Create function that properly sets user_id from auth context
CREATE OR REPLACE FUNCTION set_user_id_for_hidden_gem_visits()
RETURNS TRIGGER AS $$
BEGIN
    -- Always set user_id from current auth context
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires on INSERT
CREATE TRIGGER trigger_set_user_id_hidden_gem_visits
    BEFORE INSERT ON hidden_gem_visits
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_for_hidden_gem_visits();

-- Success message
SELECT 'Hidden gem visits trigger created - user_id will auto-populate!' as status;
