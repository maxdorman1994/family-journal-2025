-- Milestone Journal Integration (Fixed Version)
-- Creates triggers and functions to automatically update milestone progress when journal entries change

-- Function to update milestone progress (enhanced version)
CREATE OR REPLACE FUNCTION update_milestone_progress_advanced(
  p_user_id TEXT,
  p_milestone_id TEXT,
  p_new_progress INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insert or update progress, only if new progress is higher
  INSERT INTO user_milestone_progress (user_id, milestone_id, status, current_progress, completion_date, updated_at)
  SELECT 
    p_user_id, 
    p_milestone_id,
    CASE WHEN p_new_progress >= COALESCE(m.target_value, 1) THEN 'completed' ELSE 'in_progress' END,
    p_new_progress,
    CASE WHEN p_new_progress >= COALESCE(m.target_value, 1) THEN NOW() ELSE NULL END,
    NOW()
  FROM milestones m WHERE m.id = p_milestone_id
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    current_progress = GREATEST(user_milestone_progress.current_progress, p_new_progress),
    status = CASE 
      WHEN GREATEST(user_milestone_progress.current_progress, p_new_progress) >= 
           (SELECT COALESCE(target_value, 1) FROM milestones WHERE id = p_milestone_id) 
      THEN 'completed' 
      ELSE 'in_progress' 
    END,
    completion_date = CASE 
      WHEN GREATEST(user_milestone_progress.current_progress, p_new_progress) >= 
           (SELECT COALESCE(target_value, 1) FROM milestones WHERE id = p_milestone_id) 
           AND user_milestone_progress.completion_date IS NULL
      THEN NOW() 
      ELSE user_milestone_progress.completion_date 
    END,
    updated_at = NOW()
  WHERE GREATEST(user_milestone_progress.current_progress, p_new_progress) > user_milestone_progress.current_progress;
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and update journal-based milestones
CREATE OR REPLACE FUNCTION update_journal_milestones(p_user_id TEXT DEFAULT 'demo-user')
RETURNS VOID AS $$
DECLARE
  journal_count INTEGER;
  photo_count INTEGER;
  unique_tags INTEGER;
  unique_locations INTEGER;
  unique_weather INTEGER;
  unique_moods INTEGER;
  total_miles DECIMAL;
  castle_count INTEGER;
  munro_count INTEGER;
  loch_count INTEGER;
  beach_count INTEGER;
  forest_count INTEGER;
  waterfall_count INTEGER;
  bridge_count INTEGER;
  island_count INTEGER;
  wildlife_count INTEGER;
  heritage_count INTEGER;
  family_adventures INTEGER;
  memory_count INTEGER;
  unique_seasons INTEGER;
  consecutive_days INTEGER;
BEGIN
  -- Basic counts
  SELECT COUNT(*) INTO journal_count FROM journal_entries;
  
  SELECT COALESCE(SUM(array_length(photos, 1)), 0) INTO photo_count 
  FROM journal_entries WHERE photos IS NOT NULL;
  
  -- Fixed: Use CTE to unnest tags first, then count distinct
  WITH unnested_tags AS (
    SELECT unnest(tags) as tag 
    FROM journal_entries 
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  )
  SELECT COUNT(DISTINCT tag) INTO unique_tags FROM unnested_tags;
  
  SELECT COUNT(DISTINCT LOWER(location)) INTO unique_locations 
  FROM journal_entries WHERE location IS NOT NULL AND location != '';
  
  SELECT COUNT(DISTINCT LOWER(weather)) INTO unique_weather 
  FROM journal_entries WHERE weather IS NOT NULL AND weather != '';
  
  SELECT COUNT(DISTINCT LOWER(mood)) INTO unique_moods 
  FROM journal_entries WHERE mood IS NOT NULL AND mood != '';
  
  SELECT COALESCE(SUM(miles_traveled), 0) INTO total_miles 
  FROM journal_entries WHERE miles_traveled IS NOT NULL;

  -- Adventure type specific counts
  SELECT COUNT(*) INTO castle_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(castle|fortress|palace).*';
    
  SELECT COUNT(*) INTO munro_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(munro|mountain|peak|summit).*';
    
  SELECT COUNT(*) INTO loch_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(loch|lake|water).*';
    
  SELECT COUNT(*) INTO beach_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(beach|coast|shore|sea).*';
    
  SELECT COUNT(*) INTO forest_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(forest|wood|trees|nature).*';
    
  SELECT COUNT(*) INTO waterfall_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(waterfall|falls|cascade).*';
    
  SELECT COUNT(*) INTO bridge_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(bridge|crossing).*';
    
  SELECT COUNT(*) INTO island_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(island|isle).*';
    
  SELECT COUNT(*) INTO wildlife_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(wildlife|animal|bird|deer|seal|otter).*';
    
  SELECT COUNT(*) INTO heritage_count 
  FROM journal_entries 
  WHERE LOWER(title || ' ' || content || ' ' || COALESCE(array_to_string(tags, ' '), '')) 
    ~ '.*(heritage|historic|museum|culture|traditional).*';

  -- Family and memory counts (fixed: use array_to_string instead of unnest)
  SELECT COUNT(*) INTO family_adventures 
  FROM journal_entries 
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0 
    AND LOWER(array_to_string(tags, ' ')) ~ '.*(family|kids|children|together|dad|mum|parents).*';
    
  SELECT COUNT(*) INTO memory_count 
  FROM journal_entries 
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0;

  -- Seasonal count
  SELECT COUNT(DISTINCT 
    CASE 
      WHEN EXTRACT(MONTH FROM date::date) IN (12, 1, 2) THEN 'winter'
      WHEN EXTRACT(MONTH FROM date::date) IN (3, 4, 5) THEN 'spring'
      WHEN EXTRACT(MONTH FROM date::date) IN (6, 7, 8) THEN 'summer'
      WHEN EXTRACT(MONTH FROM date::date) IN (9, 10, 11) THEN 'autumn'
    END
  ) INTO unique_seasons 
  FROM journal_entries;

  -- Simple consecutive days calculation
  SELECT COUNT(DISTINCT date::date) INTO consecutive_days 
  FROM journal_entries 
  WHERE date >= CURRENT_DATE - INTERVAL '30 days';

  -- Update all milestones
  PERFORM update_milestone_progress_advanced(p_user_id, 'journal-keeper', journal_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'photo-collector', photo_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'tag-master', unique_tags);
  PERFORM update_milestone_progress_advanced(p_user_id, 'highland-explorer', unique_locations);
  PERFORM update_milestone_progress_advanced(p_user_id, 'weather-explorer', unique_weather);
  PERFORM update_milestone_progress_advanced(p_user_id, 'mood-tracker', unique_moods);
  PERFORM update_milestone_progress_advanced(p_user_id, 'distance-tracker', total_miles::integer);
  PERFORM update_milestone_progress_advanced(p_user_id, 'castle-conqueror', castle_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'munro-beginner', munro_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'loch-legend', loch_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'beach-comber', beach_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'forest-walker', forest_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'waterfall-hunter', waterfall_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'bridge-crosser', bridge_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'island-hopper', island_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'wildlife-spotter', wildlife_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'heritage-explorer', heritage_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'family-time', family_adventures);
  PERFORM update_milestone_progress_advanced(p_user_id, 'memory-maker', memory_count);
  PERFORM update_milestone_progress_advanced(p_user_id, 'seasonal-explorer', unique_seasons);
  PERFORM update_milestone_progress_advanced(p_user_id, 'consistent-adventurer', consecutive_days);
  
  -- Award photo variety based on number of entries with photos
  PERFORM update_milestone_progress_advanced(p_user_id, 'photo-variety', 
    (SELECT COUNT(*) FROM journal_entries WHERE photos IS NOT NULL AND array_length(photos, 1) > 0));

  -- Award initial milestones if any journal entries exist
  IF journal_count > 0 THEN
    PERFORM update_milestone_progress_advanced(p_user_id, 'first-adventure', 1);
    PERFORM update_milestone_progress_advanced(p_user_id, 'first-journal', 1);
    
    -- Check for early bird (entry within first week)
    IF EXISTS (
      SELECT 1 FROM journal_entries 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    ) THEN
      PERFORM update_milestone_progress_advanced(p_user_id, 'early-bird', 1);
    END IF;
    
    -- Check for weather warrior (multiple weather conditions)
    IF unique_weather >= 2 THEN
      PERFORM update_milestone_progress_advanced(p_user_id, 'weather-warrior', 1);
    END IF;
    
    -- Photo-related first milestones
    IF photo_count > 0 THEN
      PERFORM update_milestone_progress_advanced(p_user_id, 'photo-memories', 1);
      PERFORM update_milestone_progress_advanced(p_user_id, 'first-upload', 1);
    END IF;
    
    -- Family adventure if family tags exist
    IF family_adventures > 0 THEN
      PERFORM update_milestone_progress_advanced(p_user_id, 'family-adventure', 1);
    END IF;
    
    -- First month milestone if entries span 30 days
    IF EXISTS (
      SELECT 1 FROM journal_entries 
      WHERE date <= CURRENT_DATE - INTERVAL '30 days'
    ) THEN
      PERFORM update_milestone_progress_advanced(p_user_id, 'first-month', 1);
    END IF;
  END IF;
  
  RAISE NOTICE 'Updated milestones: % entries, % photos, % locations, % tags', 
    journal_count, photo_count, unique_locations, unique_tags;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update milestones when journal entries change
CREATE OR REPLACE FUNCTION trigger_update_milestones()
RETURNS TRIGGER AS $$
BEGIN
  -- Update milestones for the demo user
  PERFORM update_journal_milestones('demo-user');
  
  -- Return the appropriate record based on trigger event
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for journal_entries table
DROP TRIGGER IF EXISTS trigger_milestones_on_journal_insert ON journal_entries;
CREATE TRIGGER trigger_milestones_on_journal_insert
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_milestones();

DROP TRIGGER IF EXISTS trigger_milestones_on_journal_update ON journal_entries;
CREATE TRIGGER trigger_milestones_on_journal_update
  AFTER UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_milestones();

DROP TRIGGER IF EXISTS trigger_milestones_on_journal_delete ON journal_entries;
CREATE TRIGGER trigger_milestones_on_journal_delete
  AFTER DELETE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_milestones();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_milestone_progress_advanced(TEXT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_journal_milestones(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_milestones() TO anon, authenticated;

-- Initialize milestones for existing journal entries
SELECT update_journal_milestones('demo-user');

-- Success message
DO $$ 
DECLARE
  entry_count INTEGER;
  milestone_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO entry_count FROM journal_entries;
  SELECT COUNT(*) INTO milestone_count FROM user_milestone_progress WHERE user_id = 'demo-user';
  
  RAISE NOTICE '✅ Milestone-Journal integration complete!';
  RAISE NOTICE 'Processed % journal entries and updated % milestones.', entry_count, milestone_count;
  RAISE NOTICE 'Milestones will now auto-update when journal entries are added/modified.';
END $$;
