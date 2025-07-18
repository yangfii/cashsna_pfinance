-- Fix database function security vulnerabilities by adding SECURITY DEFINER and SET search_path

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$function$;

-- Update get_latest_crypto_price function
CREATE OR REPLACE FUNCTION public.get_latest_crypto_price(crypto_symbol text)
RETURNS TABLE(symbol character varying, price numeric, price_change_24h numeric, volume_24h numeric, market_cap numeric, last_updated timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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