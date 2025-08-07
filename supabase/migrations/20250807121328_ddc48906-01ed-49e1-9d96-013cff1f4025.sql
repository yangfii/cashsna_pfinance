-- Create QR signin sessions table
CREATE TABLE public.qr_signin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired')),
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qr_signin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own QR sessions"
ON public.qr_signin_sessions
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service can create QR sessions"
ON public.qr_signin_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own QR sessions"
ON public.qr_signin_sessions
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX idx_qr_signin_sessions_token ON public.qr_signin_sessions(session_token);
CREATE INDEX idx_qr_signin_sessions_expires ON public.qr_signin_sessions(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_qr_signin_sessions_updated_at
BEFORE UPDATE ON public.qr_signin_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();