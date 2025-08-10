-- Fix crypto_prices upsert failures by enforcing uniqueness on symbol
-- 1) Remove duplicate rows per symbol, keeping the most recently updated
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY symbol
           ORDER BY COALESCE(last_updated, created_at) DESC NULLS LAST,
                    created_at DESC NULLS LAST
         ) AS rn
  FROM public.crypto_prices
)
DELETE FROM public.crypto_prices cp
USING ranked r
WHERE cp.id = r.id
  AND r.rn > 1;

-- 2) Add a unique constraint on symbol to match Edge Function upsert onConflict: 'symbol'
ALTER TABLE public.crypto_prices
ADD CONSTRAINT crypto_prices_symbol_key UNIQUE (symbol);

-- 3) Optional: ensure an index on last_updated for fast ordering (idempotent)
CREATE INDEX IF NOT EXISTS idx_crypto_prices_last_updated ON public.crypto_prices(last_updated);
