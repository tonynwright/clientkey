-- Create demo_seed_log table for rate limiting
CREATE TABLE IF NOT EXISTS public.demo_seed_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on demo_seed_log
ALTER TABLE public.demo_seed_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own seed logs
CREATE POLICY "Users can view own seed logs" ON public.demo_seed_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_demo_seed_log_user_id ON public.demo_seed_log(user_id);
CREATE INDEX idx_demo_seed_log_created_at ON public.demo_seed_log(created_at);

-- Fix clients table: make user_id NOT NULL
-- First, update any NULL values to a valid user (should not exist, but safety first)
UPDATE public.clients 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;

-- Add NOT NULL constraint
ALTER TABLE public.clients 
ALTER COLUMN user_id SET NOT NULL;

-- Add check constraint to prevent future NULLs
ALTER TABLE public.clients 
ADD CONSTRAINT clients_user_id_required CHECK (user_id IS NOT NULL);