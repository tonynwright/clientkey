-- Create onboarding_sequences table
CREATE TABLE public.onboarding_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_sequence_steps table
CREATE TABLE public.onboarding_sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.onboarding_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  email_subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sequence_id, step_order)
);

-- Create client_onboarding_progress table
CREATE TABLE public.client_onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES public.onboarding_sequences(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, sequence_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_sequences
CREATE POLICY "Users can view own sequences"
  ON public.onboarding_sequences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sequences"
  ON public.onboarding_sequences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequences"
  ON public.onboarding_sequences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences"
  ON public.onboarding_sequences FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for onboarding_sequence_steps
CREATE POLICY "Users can view steps of own sequences"
  ON public.onboarding_sequence_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_sequences
    WHERE onboarding_sequences.id = onboarding_sequence_steps.sequence_id
    AND onboarding_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can create steps for own sequences"
  ON public.onboarding_sequence_steps FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.onboarding_sequences
    WHERE onboarding_sequences.id = onboarding_sequence_steps.sequence_id
    AND onboarding_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can update steps of own sequences"
  ON public.onboarding_sequence_steps FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_sequences
    WHERE onboarding_sequences.id = onboarding_sequence_steps.sequence_id
    AND onboarding_sequences.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete steps of own sequences"
  ON public.onboarding_sequence_steps FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.onboarding_sequences
    WHERE onboarding_sequences.id = onboarding_sequence_steps.sequence_id
    AND onboarding_sequences.user_id = auth.uid()
  ));

-- RLS policies for client_onboarding_progress
CREATE POLICY "Users can view progress for own clients"
  ON public.client_onboarding_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_onboarding_progress.client_id
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can create progress for own clients"
  ON public.client_onboarding_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_onboarding_progress.client_id
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update progress for own clients"
  ON public.client_onboarding_progress FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_onboarding_progress.client_id
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete progress for own clients"
  ON public.client_onboarding_progress FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_onboarding_progress.client_id
    AND clients.user_id = auth.uid()
  ));

-- Trigger for updated_at on onboarding_sequences
CREATE TRIGGER update_onboarding_sequences_updated_at
  BEFORE UPDATE ON public.onboarding_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on onboarding_sequence_steps
CREATE TRIGGER update_onboarding_sequence_steps_updated_at
  BEFORE UPDATE ON public.onboarding_sequence_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on client_onboarding_progress
CREATE TRIGGER update_client_onboarding_progress_updated_at
  BEFORE UPDATE ON public.client_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();