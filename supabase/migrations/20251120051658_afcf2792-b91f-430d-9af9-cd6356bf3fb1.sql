-- Drop the existing check constraint that's causing issues
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_pricing_tier_check;

-- Add the correct check constraint that allows free, early_bird, and regular tiers
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_pricing_tier_check 
CHECK (pricing_tier IN ('free', 'early_bird', 'regular'));