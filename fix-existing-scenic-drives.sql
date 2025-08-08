-- ============================================
-- Fix Existing Scenic Drive Entries
-- Updates entries that have scenic_stops data but missing is_scenic_drive flag
-- ============================================

-- Update entries that have scenic stops but is_scenic_drive is not set to true
UPDATE journal_entries 
SET is_scenic_drive = true 
WHERE (scenic_stops IS NOT NULL AND scenic_stops != '[]'::jsonb) 
  AND (is_scenic_drive IS NULL OR is_scenic_drive = false);

-- Check what we updated
SELECT 
  id, 
  title, 
  is_scenic_drive, 
  jsonb_array_length(scenic_stops) as stop_count,
  scenic_stops
FROM journal_entries 
WHERE scenic_stops IS NOT NULL 
  AND scenic_stops != '[]'::jsonb 
  AND is_scenic_drive = true;

-- Success message
SELECT 'Existing scenic drive entries have been updated!' as status;
