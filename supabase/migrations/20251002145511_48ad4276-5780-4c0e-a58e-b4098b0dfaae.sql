-- Fix security warning: set search_path on prevent_duplicate_news function
CREATE OR REPLACE FUNCTION prevent_duplicate_news()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;