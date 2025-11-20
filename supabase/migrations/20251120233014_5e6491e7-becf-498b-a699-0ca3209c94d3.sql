-- Fix subscriptions table RLS policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix email_templates table - add user_id column and proper policies
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing templates to have a user_id (set to first user or leave NULL for now)
-- In production, you may want to assign these to a specific admin user

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can insert email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can update email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Anyone can delete email templates" ON public.email_templates;

-- Create proper user-scoped policies
CREATE POLICY "Users can view own templates" ON public.email_templates
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" ON public.email_templates
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.email_templates
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.email_templates
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Fix assessments table - link to clients for proper ownership
DROP POLICY IF EXISTS "Anyone can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert assessments" ON public.assessments;

-- Authenticated users can view assessments for their own clients
CREATE POLICY "Users can view own client assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = assessments.client_id
    AND clients.user_id = auth.uid()
  ));

-- Authenticated users can insert assessments for their own clients
CREATE POLICY "Users can insert own client assessments" ON public.assessments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = assessments.client_id
    AND clients.user_id = auth.uid()
  ));

-- Public (anonymous) users can insert assessments for any client (needed for public assessment page)
CREATE POLICY "Public can insert assessments for invited clients" ON public.assessments
  FOR INSERT TO anon
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients WHERE clients.id = assessments.client_id
  ));

-- Fix email_tracking table - link to clients for proper ownership
DROP POLICY IF EXISTS "Anyone can insert tracking events" ON public.email_tracking;
DROP POLICY IF EXISTS "Anyone can view tracking events" ON public.email_tracking;

-- Authenticated users can view tracking for their own clients
CREATE POLICY "Users can view own client tracking" ON public.email_tracking
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = email_tracking.client_id
    AND clients.user_id = auth.uid()
  ));

-- No user INSERT policy needed - edge functions use service role to insert tracking events