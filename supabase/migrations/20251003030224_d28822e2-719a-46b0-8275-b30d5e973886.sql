-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP calls if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule chain analytics sync to run every 10 minutes
SELECT cron.schedule(
  'chain-analytics-sync-job',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/chain-analytics-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule market sentiment sync to run every 10 minutes (offset by 3 minutes)
SELECT cron.schedule(
  'market-sentiment-sync-job',
  '3-59/10 * * * *', -- Every 10 minutes, starting at minute 3
  $$
  SELECT
    net.http_post(
        url:='https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/market-sentiment-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule price data sync to run every 10 minutes (offset by 6 minutes)
SELECT cron.schedule(
  'price-data-sync-job',
  '6-59/10 * * * *', -- Every 10 minutes, starting at minute 6
  $$
  SELECT
    net.http_post(
        url:='https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/price-data-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);