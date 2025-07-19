-- Add 'bybit' to the allowed wallet types for crypto_holdings
ALTER TABLE public.crypto_holdings DROP CONSTRAINT crypto_holdings_wallet_type_check;

ALTER TABLE public.crypto_holdings ADD CONSTRAINT crypto_holdings_wallet_type_check 
CHECK (wallet_type = ANY (ARRAY['manual'::text, 'binance'::text, 'bybit'::text, 'coinbase'::text, 'metamask'::text, 'trust_wallet'::text]));