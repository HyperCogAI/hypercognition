-- Schedule Solana data sync to run every 5 minutes
SELECT cron.schedule(
  'solana-data-sync-job',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/solana-data-sync',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaW5sa21xbWpscm11bnNqc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzEzMTAsImV4cCI6MjA3MzgwNzMxMH0.tNC5SCsBdGF5sl3vkhvMUaRpqAZrfNxpeUtelvczqiM"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);