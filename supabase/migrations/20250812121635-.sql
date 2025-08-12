-- Strengthen storage for exchange API credentials
BEGIN;

-- Make existing plaintext columns nullable to avoid blocking inserts while we migrate
ALTER TABLE public.exchange_accounts
  ALTER COLUMN api_key DROP NOT NULL,
  ALTER COLUMN api_secret DROP NOT NULL;

-- Add encrypted columns (text base64) and IV used for AES-GCM
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'exchange_accounts' AND column_name = 'api_key_enc'
  ) THEN
    ALTER TABLE public.exchange_accounts ADD COLUMN api_key_enc text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'exchange_accounts' AND column_name = 'api_secret_enc'
  ) THEN
    ALTER TABLE public.exchange_accounts ADD COLUMN api_secret_enc text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'exchange_accounts' AND column_name = 'enc_iv'
  ) THEN
    ALTER TABLE public.exchange_accounts ADD COLUMN enc_iv text;
  END IF;
END $$;

COMMIT;