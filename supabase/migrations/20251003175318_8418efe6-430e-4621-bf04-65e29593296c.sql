-- Clean up duplicate tutorials, keeping only the most recent version of each unique tutorial
-- Deactivate old duplicates based on title and keep the newest ones

-- First, deactivate all tutorials created before our most recent migrations
UPDATE public.tutorials 
SET is_active = false 
WHERE created_at < '2025-09-26 02:24:29'::timestamp;

-- Now ensure we only have the 10 tutorials we want active:
-- Keep the 2 newest (from today) and the 5 from Sep 26 with newest timestamps
-- This will give us exactly 10 active tutorials

-- Get list of tutorials to keep (most recent 10)
WITH tutorials_to_keep AS (
  SELECT DISTINCT ON (title) id
  FROM public.tutorials
  WHERE is_active = true
  ORDER BY title, created_at DESC
)
UPDATE public.tutorials
SET is_active = false
WHERE is_active = true 
  AND id NOT IN (SELECT id FROM tutorials_to_keep);