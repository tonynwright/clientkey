-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create DISC assessments table
CREATE TABLE public.disc_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  d_score INTEGER NOT NULL DEFAULT 0,
  i_score INTEGER NOT NULL DEFAULT 0,
  s_score INTEGER NOT NULL DEFAULT 0,
  c_score INTEGER NOT NULL DEFAULT 0,
  primary_type TEXT NOT NULL,
  assessment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disc_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
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

CREATE POLICY "Anyone can view assessments"
ON public.disc_assessments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert assessments"
ON public.disc_assessments
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_disc_assessments_client_id ON public.disc_assessments(client_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();