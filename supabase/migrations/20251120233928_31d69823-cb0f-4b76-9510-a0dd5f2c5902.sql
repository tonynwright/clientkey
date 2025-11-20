-- SECURITY FIX: Restrict reminder_settings table to admin-only access
-- This prevents regular users from disrupting global email reminder configuration

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view reminder settings" ON public.reminder_settings;
DROP POLICY IF EXISTS "Anyone can update reminder settings" ON public.reminder_settings;
DROP POLICY IF EXISTS "Anyone can insert reminder settings" ON public.reminder_settings;

-- Create admin-only policies using the existing is_admin() function
CREATE POLICY "Only admins can view reminder settings" ON public.reminder_settings
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update reminder settings" ON public.reminder_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert reminder settings" ON public.reminder_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));