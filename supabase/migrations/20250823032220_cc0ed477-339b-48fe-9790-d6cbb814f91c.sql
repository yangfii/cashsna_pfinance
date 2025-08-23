-- Fix the remaining function search path issue for extract_plain_text_from_content
CREATE OR REPLACE FUNCTION public.extract_plain_text_from_content()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Extract plain text from JSONB content for search indexing
  NEW.plain_text_content := COALESCE(
    jsonb_path_query_array(NEW.content, '$.content[*].content[*].text')::text,
    ''
  );
  RETURN NEW;
END;
$$;