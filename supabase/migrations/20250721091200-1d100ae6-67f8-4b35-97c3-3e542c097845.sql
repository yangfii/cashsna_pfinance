-- Add image_url column to transactions table to store receipt images
ALTER TABLE public.transactions 
ADD COLUMN image_url TEXT;