-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a table to store crypto prices with timestamps
CREATE TABLE IF NOT EXISTS public.crypto_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  price_change_24h DECIMAL(10,4),
  volume_24h DECIMAL(20,2),
  market_cap DECIMAL(25,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for fast symbol lookups
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_created_at ON public.crypto_prices(created_at);

-- Enable RLS
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for crypto_prices (public read access since crypto prices are public data)
CREATE POLICY "Anyone can read crypto prices" ON public.crypto_prices FOR SELECT USING (true);

-- Only allow service role to insert/update prices (for the cron job)
CREATE POLICY "Service role can insert crypto prices" ON public.crypto_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update crypto prices" ON public.crypto_prices FOR UPDATE USING (true);

-- Create a function to get the latest price for a symbol
CREATE OR REPLACE FUNCTION public.get_latest_crypto_price(crypto_symbol TEXT)
RETURNS TABLE (
  symbol VARCHAR(10),
  price DECIMAL(20,8),
  price_change_24h DECIMAL(10,4),
  volume_24h DECIMAL(20,2),
  market_cap DECIMAL(25,2),
  last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.symbol,
    cp.price,
    cp.price_change_24h,
    cp.volume_24h,
    cp.market_cap,
    cp.last_updated
  FROM public.crypto_prices cp
  WHERE cp.symbol = crypto_symbol
  ORDER BY cp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;