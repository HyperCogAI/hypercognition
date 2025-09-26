-- Remove duplicate tutorials, keeping only the most recent one for each title
WITH duplicates AS (
  SELECT id, title, 
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM tutorials
  WHERE is_active = true
)
UPDATE tutorials 
SET is_active = false 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);