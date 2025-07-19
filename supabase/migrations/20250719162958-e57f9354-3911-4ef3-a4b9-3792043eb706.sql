-- Create table for storing exchange account connections
CREATE TABLE public.exchange_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name TEXT NOT NULL CHECK (exchange_name IN ('binance', 'bybit')),
  account_name TEXT NOT NULL,
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL, -- In production, this should be encrypted
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exchange_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own exchange accounts" 
ON public.exchange_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exchange accounts" 
ON public.exchange_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange accounts" 
ON public.exchange_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exchange accounts" 
ON public.exchange_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exchange_accounts_updated_at
BEFORE UPDATE ON public.exchange_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to prevent duplicate exchange accounts per user
CREATE UNIQUE INDEX idx_exchange_accounts_user_exchange_name 
ON public.exchange_accounts(user_id, exchange_name, account_name);