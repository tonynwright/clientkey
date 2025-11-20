-- Add function to check client count for a user
CREATE OR REPLACE FUNCTION public.get_client_count_for_user(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_count integer;
BEGIN
  SELECT COUNT(*) INTO client_count
  FROM clients
  WHERE user_id = p_user_id;
  
  RETURN client_count;
END;
$$;

-- Add user_id to clients table if not exists (for multi-tenant support)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for clients to be user-specific
DROP POLICY IF EXISTS "Anyone can view clients" ON clients;
DROP POLICY IF EXISTS "Anyone can insert clients" ON clients;
DROP POLICY IF EXISTS "Anyone can update clients" ON clients;
DROP POLICY IF EXISTS "Anyone can delete clients" ON clients;

CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to get client limit based on subscription tier
CREATE OR REPLACE FUNCTION public.get_client_limit_for_user(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier text;
BEGIN
  SELECT pricing_tier INTO user_tier
  FROM subscriptions
  WHERE user_id = p_user_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return limits based on tier
  IF user_tier = 'free' THEN
    RETURN 3;
  ELSIF user_tier = 'early_bird' THEN
    RETURN 300;
  ELSIF user_tier = 'regular' THEN
    RETURN 300;
  ELSE
    -- No subscription found, default to free tier
    RETURN 3;
  END IF;
END;
$$;