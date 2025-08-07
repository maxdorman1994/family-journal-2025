-- Test Milestone Database Connection
-- This will help diagnose the milestone stats error

-- 1. Check if milestone_leaderboard view exists
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname = 'milestone_leaderboard';

-- 2. Check if there are any records in user_milestone_progress
SELECT 
  'user_milestone_progress' as table_name,
  COUNT(*) as record_count
FROM user_milestone_progress;

-- 3. Check if there are records in the leaderboard view
SELECT 
  'milestone_leaderboard' as view_name,
  COUNT(*) as record_count
FROM milestone_leaderboard;

-- 4. Try to manually query what the service is trying to do
SELECT 
  user_id,
  completed_milestones,
  total_xp,
  completion_percentage
FROM milestone_leaderboard 
WHERE user_id = 'demo-user';

-- 5. Check the structure of the milestone_leaderboard view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'milestone_leaderboard';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Milestone connection test completed!';
  RAISE NOTICE 'Check the results above to diagnose the issue.';
END $$;
