-- Add tags column to clients table
ALTER TABLE public.clients 
ADD COLUMN tags text[] DEFAULT '{}';

-- Create index for better tag filtering performance
CREATE INDEX idx_clients_tags ON public.clients USING GIN(tags);