-- Fix search path security issues for newly created functions
DROP FUNCTION IF EXISTS public.validate_exchange_access(uuid, inet, text);
DROP FUNCTION IF EXISTS public.update_exchange_auth(uuid, integer);
DROP FUNCTION IF EXISTS public.increment_sync_counter(uuid);

-- Create function to validate exchange access with proper search path
CREATE OR REPLACE FUNCTION public.validate_exchange_access(
  account_id uuid,
  client_ip inet,
  user_agent_string text DEFAULT NULL
) RETURNS TABLE(
  allowed boolean,
  reason text,
  requires_auth boolean
) AS $$
DECLARE
  account_record record;
  current_date_val date := CURRENT_DATE;
  auth_valid boolean := false;
BEGIN
  -- Get account details
  SELECT * INTO account_record
  FROM public.exchange_accounts 
  WHERE id = account_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Account not found or access denied', false;
    RETURN;
  END IF;
  
  -- Check if account is active
  IF NOT account_record.is_active THEN
    RETURN QUERY SELECT false, 'Account is inactive', false;
    RETURN;
  END IF;
  
  -- Check IP restrictions
  IF account_record.allowed_ips IS NOT NULL AND array_length(account_record.allowed_ips, 1) > 0 THEN
    IF NOT (client_ip = ANY(account_record.allowed_ips)) THEN
      -- Log failed access attempt
      INSERT INTO public.exchange_access_logs (
        user_id, exchange_account_id, ip_address, action, success, failure_reason, user_agent
      ) VALUES (
        auth.uid(), account_id, client_ip, 'access_check', false, 'IP not allowed', user_agent_string
      );
      
      RETURN QUERY SELECT false, 'IP address not in allowed list', false;
      RETURN;
    END IF;
  END IF;
  
  -- Check daily sync limits
  IF account_record.last_sync_date = current_date_val THEN
    IF account_record.daily_sync_count >= account_record.max_daily_syncs THEN
      RETURN QUERY SELECT false, 'Daily sync limit exceeded', false;
      RETURN;
    END IF;
  END IF;
  
  -- Check if re-authentication is required
  IF account_record.requires_reauth THEN
    auth_valid := (
      account_record.last_auth_at IS NOT NULL AND 
      account_record.auth_expires_at IS NOT NULL AND 
      account_record.auth_expires_at > now()
    );
    
    IF NOT auth_valid THEN
      RETURN QUERY SELECT false, 'Re-authentication required', true;
      RETURN;
    END IF;
  END IF;
  
  -- Log successful access check
  INSERT INTO public.exchange_access_logs (
    user_id, exchange_account_id, ip_address, action, success, user_agent
  ) VALUES (
    auth.uid(), account_id, client_ip, 'access_check', true, user_agent_string
  );
  
  RETURN QUERY SELECT true, 'Access granted', false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update authentication status with proper search path
CREATE OR REPLACE FUNCTION public.update_exchange_auth(
  account_id uuid,
  auth_duration_hours integer DEFAULT 2
) RETURNS boolean AS $$
BEGIN
  UPDATE public.exchange_accounts 
  SET 
    last_auth_at = now(),
    auth_expires_at = now() + (auth_duration_hours || ' hours')::interval
  WHERE id = account_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to increment sync counter with proper search path
CREATE OR REPLACE FUNCTION public.increment_sync_counter(account_id uuid) 
RETURNS boolean AS $$
DECLARE
  current_date_val date := CURRENT_DATE;
BEGIN
  UPDATE public.exchange_accounts 
  SET 
    daily_sync_count = CASE 
      WHEN last_sync_date = current_date_val THEN daily_sync_count + 1
      ELSE 1
    END,
    last_sync_date = current_date_val,
    last_synced_at = now()
  WHERE id = account_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;