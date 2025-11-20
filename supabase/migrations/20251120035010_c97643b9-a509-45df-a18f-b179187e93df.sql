-- Create settings table for reminder configuration
CREATE TABLE public.reminder_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_delay_days integer NOT NULL DEFAULT 3,
  max_reminders integer NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for reminder settings
CREATE POLICY "Anyone can view reminder settings" 
ON public.reminder_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update reminder settings" 
ON public.reminder_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert reminder settings" 
ON public.reminder_settings 
FOR INSERT 
WITH CHECK (true);

-- Insert default settings (only one row should exist)
INSERT INTO public.reminder_settings (reminder_delay_days, max_reminders) 
VALUES (3, 3);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_reminder_settings_updated_at
BEFORE UPDATE ON public.reminder_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add metadata column to email_tracking to track reminder count
ALTER TABLE public.email_tracking 
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;