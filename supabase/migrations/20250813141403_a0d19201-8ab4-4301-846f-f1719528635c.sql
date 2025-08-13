-- Fix security vulnerability in qr_signin_sessions table
-- Remove policies that allow unauthenticated access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own QR sessions" ON public.qr_signin_sessions;
DROP POLICY IF EXISTS "Users can update their own QR sessions" ON public.qr_signin_sessions;
DROP POLICY IF EXISTS "Service can create QR sessions" ON public.qr_signin_sessions;

-- Create secure policies that only allow:
-- 1. Service role to manage all operations (used by edge functions)
-- 2. Authenticated users to only see their own confirmed sessions

-- Policy for service role operations (edge functions)
CREATE POLICY "Service role can manage QR sessions"
ON public.qr_signin_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for authenticated users to see only their own confirmed sessions
CREATE POLICY "Users can view their own confirmed QR sessions"
ON public.qr_signin_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Policy for authenticated users to update only their own sessions (for confirmation)
CREATE POLICY "Users can confirm their own QR sessions"
ON public.qr_signin_sessions
FOR UPDATE
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);