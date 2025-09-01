-- Add steps column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN steps jsonb DEFAULT '[]'::jsonb;