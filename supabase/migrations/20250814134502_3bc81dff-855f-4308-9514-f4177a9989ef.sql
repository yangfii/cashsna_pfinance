-- CRITICAL SECURITY FIXES - Clean up exposed sensitive data and strengthen policies

-- 1. Clean up exposed plaintext API keys and secrets from exchange_accounts
UPDATE public.exchange_accounts 
SET 
  api_key = NULL,
  api_secret = NULL
WHERE api_key IS NOT NULL OR api_secret IS NOT NULL;

-- 2. Clean up exposed plaintext 2FA secrets from user_2fa
UPDATE public.user_2fa 
SET 
  secret_key = 'REVOKED_FOR_SECURITY',
  backup_codes = NULL
WHERE secret_key IS NOT NULL OR backup_codes IS NOT NULL;

-- 3. Fix database functions with proper search_path (security definer functions need this)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_latest_crypto_price(crypto_symbol text)
RETURNS TABLE(symbol character varying, price numeric, price_change_24h numeric, volume_24h numeric, market_cap numeric, last_updated timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cp.symbol,
    cp.price,
    cp.price_change_24h,
    cp.volume_24h,
    cp.market_cap,
    cp.last_updated
  FROM public.crypto_prices cp
  WHERE cp.symbol = crypto_symbol
  ORDER BY cp.created_at DESC
  LIMIT 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.capture_portfolio_snapshot(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 4. Add constraints to prevent storing plaintext sensitive data
ALTER TABLE public.exchange_accounts 
ADD CONSTRAINT chk_no_plaintext_api_data 
CHECK (
  (api_key IS NULL OR api_key = '') AND 
  (api_secret IS NULL OR api_secret = '') OR
  (api_key_enc IS NOT NULL AND api_secret_enc IS NOT NULL)
);

-- 5. Add constraint to ensure 2FA secrets are encrypted
ALTER TABLE public.user_2fa
ADD CONSTRAINT chk_2fa_encrypted
CHECK (
  (secret_key = 'REVOKED_FOR_SECURITY') OR 
  (secret_key_enc IS NOT NULL AND secret_iv IS NOT NULL)
);

-- 6. Add audit trigger for sensitive table access
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log sensitive table access for audit purposes
  INSERT INTO exchange_access_logs (
    user_id, 
    exchange_account_id, 
    ip_address, 
    action, 
    success, 
    user_agent
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    inet '127.0.0.1', -- Placeholder, real IP should come from application
    TG_OP,
    true,
    'database_trigger'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_exchange_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.exchange_accounts
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

CREATE TRIGGER audit_user_2fa
  AFTER INSERT OR UPDATE OR DELETE ON public.user_2fa
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();