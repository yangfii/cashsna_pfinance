-- Add encryption fields to user_2fa table to secure 2FA secrets
ALTER TABLE public.user_2fa 
ADD COLUMN IF NOT EXISTS secret_key_enc TEXT,
ADD COLUMN IF NOT EXISTS backup_codes_enc TEXT,
ADD COLUMN IF NOT EXISTS secret_iv TEXT,
ADD COLUMN IF NOT EXISTS backup_iv TEXT;

-- Update the table to prepare for migration
-- Note: We'll keep the old columns temporarily during migration