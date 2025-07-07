-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username is valid (alphanumeric and underscores only)
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$');