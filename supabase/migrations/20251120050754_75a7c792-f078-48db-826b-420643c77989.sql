-- Create table for storing AI-generated DISC insights
CREATE TABLE public.disc_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  disc_type TEXT NOT NULL,
  scores JSONB NOT NULL,
  insights TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disc_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access insights for their own clients
CREATE POLICY "Users can view insights for their own clients"
ON public.disc_insights
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = disc_insights.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert insights for their own clients"
ON public.disc_insights
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = disc_insights.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update insights for their own clients"
ON public.disc_insights
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = disc_insights.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete insights for their own clients"
ON public.disc_insights
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = disc_insights.client_id
    AND clients.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_disc_insights_updated_at
BEFORE UPDATE ON public.disc_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_disc_insights_client_id ON public.disc_insights(client_id);
CREATE INDEX idx_disc_insights_created_at ON public.disc_insights(created_at DESC);