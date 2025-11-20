-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.disc_assessments CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  disc_type TEXT,
  disc_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  scores JSONB NOT NULL,
  dominant_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view clients"
ON public.clients
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update clients"
ON public.clients
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete clients"
ON public.clients
FOR DELETE
USING (true);

CREATE POLICY "Anyone can view assessments"
ON public.assessments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert assessments"
ON public.assessments
FOR INSERT
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_disc_type ON public.clients(disc_type);
CREATE INDEX idx_assessments_client_id ON public.assessments(client_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();