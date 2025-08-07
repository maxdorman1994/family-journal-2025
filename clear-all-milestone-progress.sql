-- Clear All Milestone Progress
-- This will remove all existing milestone progress and start completely fresh

-- Delete all existing milestone progress
DELETE FROM user_milestone_progress;

-- Verify the deletion
SELECT COUNT(*) as remaining_progress_records FROM user_milestone_progress;

-- Also check the leaderboard view to confirm 0 progress
SELECT * FROM milestone_leaderboard WHERE user_id = 'demo-user';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ All milestone progress cleared successfully!';
  RAISE NOTICE 'All users now have 0 completed milestones and 0 XP.';
  RAISE NOTICE 'Milestones will only be completed when real journal entries are created.';
END $$;
