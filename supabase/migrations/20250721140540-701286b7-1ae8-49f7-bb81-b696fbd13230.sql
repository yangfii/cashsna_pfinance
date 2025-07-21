-- Enable realtime for crypto_prices table
ALTER TABLE public.crypto_prices REPLICA IDENTITY FULL;

-- Add table to realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.crypto_prices;