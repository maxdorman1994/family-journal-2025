-- Add Fern the Dog to Family Members
-- This will enable photo upload and sync functionality for Fern

INSERT INTO family_members (
  name,
  role,
  bio,
  colors,
  position_index
) VALUES (
  'Fern',
  'ADVENTURE DOG',
  'Our spirited second furry explorer who brings her own unique energy to every Scottish adventure! Fern is the perfect adventure buddy - curious about every new trail, fearless when exploring rocky highlands, and always ready to splash through Highland streams. With her playful nature and boundless enthusiasm, Fern adds joy and laughter to our family expeditions, reminding us that the best adventures are shared with those who love the journey as much as the destination. 🌿',
  '{
    "bg": "from-green-50 to-emerald-100",
    "border": "border-green-200/60",
    "accent": "from-green-500 to-emerald-600",
    "text": "text-green-800"
  }',
  98
);

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Fern the dog added to family members successfully!';
  RAISE NOTICE 'Fern can now have photos uploaded and synced across devices.';
  RAISE NOTICE 'Position index 98 ensures Fern appears in her own special section.';
END $$;
