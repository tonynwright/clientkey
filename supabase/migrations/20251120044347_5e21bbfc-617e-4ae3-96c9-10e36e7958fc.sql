-- Create subscriptions table to track user subscriptions
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  pricing_tier TEXT NOT NULL CHECK (pricing_tier IN ('early_bird', 'regular')),
  monthly_price INTEGER NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signup counter table
CREATE TABLE public.signup_counter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  early_bird_count INTEGER NOT NULL DEFAULT 0,
  early_bird_limit INTEGER NOT NULL DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial counter
INSERT INTO public.signup_counter (early_bird_count, early_bird_limit) VALUES (0, 30);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_counter ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (true);

-- Create policies for signup counter
CREATE POLICY "Anyone can view signup counter" 
ON public.signup_counter 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update signup counter" 
ON public.signup_counter 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on signup counter
CREATE TRIGGER update_signup_counter_updated_at
BEFORE UPDATE ON public.signup_counter
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment early bird counter
CREATE OR REPLACE FUNCTION public.increment_early_bird_counter()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
BEGIN
  SELECT early_bird_count, early_bird_limit INTO current_count, limit_count
  FROM signup_counter
  WHERE id = (SELECT id FROM signup_counter LIMIT 1)
  FOR UPDATE;
  
  IF current_count < limit_count THEN
    UPDATE signup_counter 
    SET early_bird_count = early_bird_count + 1
    WHERE id = (SELECT id FROM signup_counter LIMIT 1);
    
    RETURN current_count + 1;
  END IF;
  
  RETURN current_count;
END;
$$;