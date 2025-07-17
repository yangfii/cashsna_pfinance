-- Create table for bug reports
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  lovable_ticket_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bug reports" 
ON public.bug_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bug reports" 
ON public.bug_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bug reports" 
ON public.bug_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();