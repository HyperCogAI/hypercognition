-- Clean up duplicate news articles (keep most recent of each title)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM market_news
)
DELETE FROM market_news
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Create a function to prevent duplicate titles within 6 hours
CREATE OR REPLACE FUNCTION prevent_duplicate_news()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM market_news
    WHERE title = NEW.title
      AND published_at > (NEW.published_at - interval '6 hours')
      AND published_at < (NEW.published_at + interval '6 hours')
      AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Duplicate news article within 6 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce uniqueness
DROP TRIGGER IF EXISTS check_duplicate_news ON market_news;
CREATE TRIGGER check_duplicate_news
  BEFORE INSERT OR UPDATE ON market_news
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_news();