-- Create price alerts table
CREATE TABLE public.crypto_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change')),
  target_value NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own alerts" 
ON public.crypto_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" 
ON public.crypto_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.crypto_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.crypto_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crypto_alerts_updated_at
BEFORE UPDATE ON public.crypto_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add wallet_address column to crypto_holdings for wallet integration
ALTER TABLE public.crypto_holdings 
ADD COLUMN wallet_address TEXT,
ADD COLUMN wallet_type TEXT CHECK (wallet_type IN ('manual', 'binance', 'coinbase', 'metamask', 'trust_wallet'));