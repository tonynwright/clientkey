-- Create staff table to store team member profiles
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  disc_type TEXT,
  disc_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for staff table
CREATE POLICY "Users can view their own staff"
  ON public.staff
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own staff"
  ON public.staff
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff"
  ON public.staff
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff"
  ON public.staff
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_staff_user_id ON public.staff(user_id);
CREATE INDEX idx_staff_disc_type ON public.staff(disc_type);