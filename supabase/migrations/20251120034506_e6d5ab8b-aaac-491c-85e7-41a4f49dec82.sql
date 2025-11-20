-- Create email tracking table
CREATE TABLE public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'opened', 'clicked', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert tracking events"
ON public.email_tracking
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view tracking events"
ON public.email_tracking
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_email_tracking_client_id ON public.email_tracking(client_id);
CREATE INDEX idx_email_tracking_event_type ON public.email_tracking(event_type);