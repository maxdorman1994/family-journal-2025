-- Temporarily make user_id nullable in hidden_gem_visits to test basic functionality
-- This will help us confirm the trigger issue

-- Make user_id nullable temporarily
ALTER TABLE hidden_gem_visits ALTER COLUMN user_id DROP NOT NULL;

-- Success message
SELECT 'user_id is now nullable in hidden_gem_visits - should work now!' as status;
