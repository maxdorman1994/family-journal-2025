-- Verify Charlie's Cross-Device Sync Setup
-- This checks that Charlie is properly stored and configured for sync

-- 1. Check if Charlie exists in the family_members table
SELECT 
  'Charlie Status' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Charlie found in database'
    ELSE '❌ Charlie not found - run add-charlie-family-member.sql'
  END as status,
  COUNT(*) as count
FROM family_members 
WHERE name = 'Charlie';

-- 2. Show Charlie's complete record
SELECT 
  id,
  name,
  role,
  bio,
  avatar_url,
  position_index,
  colors,
  created_at,
  updated_at
FROM family_members 
WHERE name = 'Charlie';

-- 3. Check family_members table permissions for real-time sync
SELECT 
  'Permissions Check' as check_type,
  schemaname,
  tablename,
  hasinsert,
  hasupdate,
  hasdelete,
  hasselect
FROM pg_tables 
LEFT JOIN information_schema.role_table_grants 
  ON table_name = tablename 
WHERE tablename = 'family_members'
LIMIT 1;

-- 4. Verify Row Level Security is enabled (required for real-time)
SELECT 
  'Row Level Security' as check_type,
  CASE 
    WHEN relrowsecurity THEN '✅ RLS enabled - real-time sync will work'
    ELSE '⚠️ RLS not enabled - may affect sync'
  END as status
FROM pg_class 
WHERE relname = 'family_members';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🐕 Charlie Sync Verification Complete!';
  RAISE NOTICE 'If Charlie is found above, photo uploads will sync across all devices.';
  RAISE NOTICE 'Check the browser console for "🐕 Charlie loaded successfully" message.';
END $$;
