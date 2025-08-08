-- ============================================
-- Add Scenic Drive Columns to Journal Entries Table
-- Adds is_scenic_drive and scenic_stops columns to existing journal_entries table
-- ============================================

-- Add the is_scenic_drive column
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS is_scenic_drive BOOLEAN DEFAULT FALSE;

-- Add the scenic_stops column as JSONB to store array of stops
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS scenic_stops JSONB DEFAULT '[]'::jsonb;

-- Update existing entries to ensure they have proper default values
UPDATE journal_entries 
SET is_scenic_drive = FALSE 
WHERE is_scenic_drive IS NULL;

UPDATE journal_entries 
SET scenic_stops = '[]'::jsonb 
WHERE scenic_stops IS NULL;

-- Add indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_journal_entries_scenic_drive ON journal_entries (is_scenic_drive);
CREATE INDEX IF NOT EXISTS idx_journal_entries_scenic_stops ON journal_entries USING GIN (scenic_stops);

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'journal_entries' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Scenic drive columns added to journal_entries table successfully!' as status;
