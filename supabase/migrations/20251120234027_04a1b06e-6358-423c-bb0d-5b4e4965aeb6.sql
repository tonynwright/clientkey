-- SECURITY FIX: Make signup_counter read-only for users
-- Only edge functions with SERVICE_ROLE_KEY can update the counter

-- Drop the open update policy
DROP POLICY IF EXISTS "Anyone can update signup counter" ON public.signup_counter;
DROP POLICY IF EXISTS "Anyone can view signup counter" ON public.signup_counter;

-- Allow authenticated users to view the counter (for UI display)
CREATE POLICY "Authenticated users can view signup counter" ON public.signup_counter
  FOR SELECT TO authenticated
  USING (true);

-- No INSERT or UPDATE policies for users
-- Edge functions using SERVICE_ROLE_KEY bypass RLS and can still modify the counter
-- This includes: increment_early_bird_counter() function and create-checkout edge function