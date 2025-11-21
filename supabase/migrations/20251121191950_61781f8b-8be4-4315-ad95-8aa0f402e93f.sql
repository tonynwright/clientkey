-- Create table to track early bird price increase notifications
CREATE TABLE IF NOT EXISTS public.early_bird_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id TEXT NOT NULL,
  notification_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  price_increase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.early_bird_notifications ENABLE ROW LEVEL SECURITY;

-- Admin can view all notifications
CREATE POLICY "Admins can view all early bird notifications"
ON public.early_bird_notifications
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create index for efficient lookups
CREATE INDEX idx_early_bird_notifications_user_subscription 
ON public.early_bird_notifications(user_id, subscription_id);