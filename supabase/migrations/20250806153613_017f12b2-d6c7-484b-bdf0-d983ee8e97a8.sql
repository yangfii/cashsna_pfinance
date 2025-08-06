-- Create table for daily PNL data
CREATE TABLE public.daily_pnl (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_pnl ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own PNL data" 
ON public.daily_pnl 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PNL data" 
ON public.daily_pnl 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PNL data" 
ON public.daily_pnl 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PNL data" 
ON public.daily_pnl 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_pnl_updated_at
BEFORE UPDATE ON public.daily_pnl
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();