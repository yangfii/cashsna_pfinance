-- Create table for storing daily portfolio snapshots
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  total_gain_loss NUMERIC NOT NULL DEFAULT 0,
  roi_percentage NUMERIC NOT NULL DEFAULT 0,
  holdings_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one snapshot per user per day
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_portfolio_snapshots_updated_at
BEFORE UPDATE ON public.portfolio_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_portfolio_snapshots_user_date ON public.portfolio_snapshots(user_id, date DESC);

-- Create function to capture daily portfolio snapshot
CREATE OR REPLACE FUNCTION public.capture_portfolio_snapshot(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  snapshot_date DATE := CURRENT_DATE;
  total_value_calc NUMERIC := 0;
  total_invested_calc NUMERIC := 0;
  holdings_count_calc INTEGER := 0;
  total_gain_loss_calc NUMERIC := 0;
  roi_calc NUMERIC := 0;
BEGIN
  -- Calculate portfolio metrics
  SELECT 
    COALESCE(SUM(ch.amount * COALESCE(cp.price, 0)), 0),
    COALESCE(SUM(ch.amount * ch.purchase_price), 0),
    COUNT(*)
  INTO 
    total_value_calc,
    total_invested_calc,
    holdings_count_calc
  FROM crypto_holdings ch
  LEFT JOIN crypto_prices cp ON ch.symbol = cp.symbol
  WHERE ch.user_id = user_uuid;
  
  -- Calculate gain/loss and ROI
  total_gain_loss_calc := total_value_calc - total_invested_calc;
  
  IF total_invested_calc > 0 THEN
    roi_calc := (total_gain_loss_calc / total_invested_calc) * 100;
  END IF;
  
  -- Insert or update snapshot
  INSERT INTO portfolio_snapshots (
    user_id,
    date,
    total_value,
    total_invested,
    total_gain_loss,
    roi_percentage,
    holdings_count
  ) VALUES (
    user_uuid,
    snapshot_date,
    total_value_calc,
    total_invested_calc,
    total_gain_loss_calc,
    roi_calc,
    holdings_count_calc
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_value = EXCLUDED.total_value,
    total_invested = EXCLUDED.total_invested,
    total_gain_loss = EXCLUDED.total_gain_loss,
    roi_percentage = EXCLUDED.roi_percentage,
    holdings_count = EXCLUDED.holdings_count,
    updated_at = now();
END;
$$;