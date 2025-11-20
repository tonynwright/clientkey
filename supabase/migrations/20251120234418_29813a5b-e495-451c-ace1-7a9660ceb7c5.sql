-- SECURITY FIX: Make user_id columns NOT NULL to prevent orphaned records
-- This ensures all templates and subscriptions are properly owned by users

-- First, check and handle any existing NULL values in email_templates
-- If there are any NULL user_id values, we'll need to delete them or assign them to a user
-- For safety, we'll delete any orphaned templates
DELETE FROM public.email_templates WHERE user_id IS NULL;

-- Now add the NOT NULL constraint on email_templates
ALTER TABLE public.email_templates 
  ALTER COLUMN user_id SET NOT NULL;

-- Next, handle subscriptions table
-- Check and delete any subscriptions without a user_id (should not exist based on business logic)
DELETE FROM public.subscriptions WHERE user_id IS NULL;

-- Add the NOT NULL constraint on subscriptions
ALTER TABLE public.subscriptions 
  ALTER COLUMN user_id SET NOT NULL;