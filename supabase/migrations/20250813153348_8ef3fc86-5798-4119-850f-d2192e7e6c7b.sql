-- Remove unused "2FA cashsnap" table that poses security risk
-- This table has RLS enabled but no policies, and is not used in the application
-- The actual 2FA functionality uses the user_2fa table which has proper security
DROP TABLE IF EXISTS public."2FA cashsnap";