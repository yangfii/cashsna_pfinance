-- Check existing cron jobs
SELECT * FROM cron.job;

-- Schedule the function to run every 1 minute
SELECT cron.schedule(
  'update-crypto-prices-every-1-minute',
  '* * * * *', -- every minute
  $$
  SELECT
    net.http_post(
        url:='https://giziyaymzuydlnbjzhsc.supabase.co/functions/v1/update-crypto-prices',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpeml5YXltenV5ZGxuYmp6aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDU3MDUsImV4cCI6MjA2NzI4MTcwNX0.ueksNc6W4vmdg6gW7S-Vo2sa-hV7SROTdkMXwndz4pA"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);