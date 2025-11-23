-- Create clients table for health tracking
CREATE TABLE public.clients_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  monthly_retainer DECIMAL(10,2) NOT NULL,
  service_type TEXT NOT NULL,
  contract_end_date DATE NOT NULL,
  account_manager TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health signals table
CREATE TABLE public.health_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients_health(id) ON DELETE CASCADE NOT NULL,
  payment_status INTEGER CHECK (payment_status >= 1 AND payment_status <= 5) NOT NULL,
  responsiveness INTEGER CHECK (responsiveness >= 1 AND responsiveness <= 5) NOT NULL,
  meeting_attendance INTEGER CHECK (meeting_attendance >= 1 AND meeting_attendance <= 5) NOT NULL,
  results_delivery INTEGER CHECK (results_delivery >= 1 AND results_delivery <= 5) NOT NULL,
  last_contact_date DATE NOT NULL,
  composite_score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients_health
CREATE POLICY "Users can view their own clients"
  ON public.clients_health FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON public.clients_health FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON public.clients_health FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON public.clients_health FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for health_signals
CREATE POLICY "Users can view signals for their clients"
  ON public.health_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clients_health
      WHERE clients_health.id = health_signals.client_id
      AND clients_health.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert signals for their clients"
  ON public.health_signals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients_health
      WHERE clients_health.id = health_signals.client_id
      AND clients_health.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update signals for their clients"
  ON public.health_signals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients_health
      WHERE clients_health.id = health_signals.client_id
      AND clients_health.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete signals for their clients"
  ON public.health_signals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.clients_health
      WHERE clients_health.id = health_signals.client_id
      AND clients_health.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_clients_health_updated_at
  BEFORE UPDATE ON public.clients_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();