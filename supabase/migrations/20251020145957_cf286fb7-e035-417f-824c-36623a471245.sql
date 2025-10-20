-- Remove access_mode column since we only support personal API now
ALTER TABLE twitter_kol_watchlists DROP COLUMN IF EXISTS access_mode;

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule twitter-kol-scraper to run every 15 minutes
SELECT cron.schedule(
  'twitter-kol-scraper',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/twitter-kol-scraper',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);