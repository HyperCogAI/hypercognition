-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions to use pg_net
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job to invoke telegram-kol-scraper every 15 minutes
SELECT cron.schedule(
  'telegram-kol-scraper-every-15-minutes',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/telegram-kol-scraper',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM"}'::jsonb,
        body:='{"triggered_by": "cron"}'::jsonb
    ) as request_id;
  $$
);