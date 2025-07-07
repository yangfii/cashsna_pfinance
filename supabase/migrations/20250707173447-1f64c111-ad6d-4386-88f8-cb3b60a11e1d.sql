-- Drop the existing constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS username_format;

-- Add new constraint that allows alphanumeric, underscores, periods, and hyphens
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9._-]+$');