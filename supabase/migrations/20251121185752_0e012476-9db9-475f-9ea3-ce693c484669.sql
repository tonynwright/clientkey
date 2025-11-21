-- Add addon tracking to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN addon_client_packs integer NOT NULL DEFAULT 0;

-- Update the get_client_limit_for_user function to include add-ons
CREATE OR REPLACE FUNCTION public.get_client_limit_for_user(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_tier text;
  addon_packs integer;
BEGIN
  -- Check if user is admin
  IF public.is_admin(p_user_id) THEN
    RETURN 999999; -- Effectively unlimited
  END IF;

  SELECT pricing_tier, addon_client_packs INTO user_tier, addon_packs
  FROM subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return limits based on tier + add-ons
  IF user_tier = 'free' THEN
    RETURN 3;
  ELSIF user_tier = 'early_bird' THEN
    RETURN 10 + (COALESCE(addon_packs, 0) * 5);
  ELSIF user_tier = 'regular' THEN
    RETURN 10 + (COALESCE(addon_packs, 0) * 5);
  ELSE
    -- No subscription found, default to free tier
    RETURN 3;
  END IF;
END;
$function$;