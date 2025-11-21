-- Create table to store security scan results
CREATE TABLE public.security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  findings JSONB NOT NULL,
  findings_count INTEGER NOT NULL,
  new_findings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on security_scans (admin-only access)
ALTER TABLE public.security_scans ENABLE ROW LEVEL SECURITY;

-- Admin users can view all security scans
CREATE POLICY "Admins can view security scans"
  ON public.security_scans
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only service role can insert security scans (from edge functions)
CREATE POLICY "Service role can insert security scans"
  ON public.security_scans
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_security_scans_scan_date ON public.security_scans(scan_date DESC);