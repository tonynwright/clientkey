-- Create tag_presets table
CREATE TABLE public.tag_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tag_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tag_presets
CREATE POLICY "Users can view their own tag presets"
  ON public.tag_presets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tag presets"
  ON public.tag_presets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tag presets"
  ON public.tag_presets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tag presets"
  ON public.tag_presets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_tag_presets_updated_at
  BEFORE UPDATE ON public.tag_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_tag_presets_user_id ON public.tag_presets(user_id);