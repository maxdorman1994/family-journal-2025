-- Add Charlie the Dog to Family Members
-- This will enable photo upload and sync functionality for Charlie

INSERT INTO family_members (
  id,
  name,
  role,
  bio,
  colors,
  position_index
) VALUES (
  'charlie-dog',
  'Charlie',
  'ADVENTURE DOG',
  'Our loyal four-legged family member who never misses an adventure! Charlie is the ultimate Scottish explorer, always ready to hike through the Highlands, chase waves on Scottish beaches, and provide endless entertainment around the campfire. With boundless energy and an adventurous spirit, Charlie reminds us to stay curious, live in the moment, and find joy in every trail we explore together. 🐕',
  '{
    "bg": "from-amber-50 to-orange-100",
    "border": "border-amber-200/60",
    "accent": "from-amber-500 to-orange-600",
    "text": "text-amber-800"
  }',
  99
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  colors = EXCLUDED.colors,
  updated_at = NOW();

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Charlie the dog added to family members successfully!';
  RAISE NOTICE 'Charlie can now have photos uploaded and synced across devices.';
  RAISE NOTICE 'Position index 99 ensures Charlie appears in a special section.';
END $$;
