-- CRITICAL SECURITY FIX: Remove open INSERT/UPDATE policies on subscriptions table
-- This prevents users from bypassing payment by creating their own premium subscriptions

-- Drop the dangerous open policies
DROP POLICY IF EXISTS "Anyone can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Anyone can update subscriptions" ON public.subscriptions;

-- Subscriptions should ONLY be managed by edge functions using SERVICE_ROLE_KEY
-- which bypass RLS policies. This includes:
-- - stripe-webhook function (creates/updates subscriptions from Stripe events)
-- - verify-subscription function (syncs from Stripe)
-- - create-free-subscription function (creates initial free tier)

-- Users can still VIEW their own subscription (this policy already exists)
-- But they cannot create or modify subscriptions directly