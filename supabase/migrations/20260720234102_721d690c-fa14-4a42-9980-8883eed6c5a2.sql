-- Phase 0 P0: Structured fraud reporting intake

CREATE TABLE public.fraud_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  suspicious_channel text, -- 'whatsapp' | 'email' | 'phone' | 'sms' | 'social' | 'other'
  suspicious_sender text,  -- phone number, email, handle
  incident_details text NOT NULL,
  amount_requested_ngn numeric,
  screenshot_urls text[] DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'new', -- new | investigating | resolved | dismissed
  admin_notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Public may submit; only staff may read/manage.
GRANT INSERT ON public.fraud_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.fraud_reports TO authenticated;
GRANT ALL ON public.fraud_reports TO service_role;

ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can file a report
CREATE POLICY "Anyone can submit fraud reports"
  ON public.fraud_reports FOR INSERT
  WITH CHECK (true);

-- Only staff (any user_roles row) can view reports
CREATE POLICY "Staff can view fraud reports"
  ON public.fraud_reports FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- Only admins/super_admins can update or delete
CREATE POLICY "Admins can update fraud reports"
  ON public.fraud_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.is_super_admin())
  WITH CHECK (public.is_admin() OR public.is_super_admin());

CREATE POLICY "Admins can delete fraud reports"
  ON public.fraud_reports FOR DELETE
  TO authenticated
  USING (public.is_admin() OR public.is_super_admin());

-- updated_at trigger (reuse existing function)
CREATE TRIGGER update_fraud_reports_updated_at
  BEFORE UPDATE ON public.fraud_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admins on new fraud report
CREATE OR REPLACE FUNCTION public.notify_admin_on_fraud_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'fraud_report',
    'New Fraud Report Submitted',
    'A fraud/scam report has been filed' ||
      CASE WHEN NEW.reporter_name IS NOT NULL
           THEN ' by ' || NEW.reporter_name
           ELSE '' END,
    jsonb_build_object(
      'fraud_report_id', NEW.id,
      'reporter_email', NEW.reporter_email,
      'suspicious_channel', NEW.suspicious_channel,
      'suspicious_sender', NEW.suspicious_sender,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_on_fraud_report
  AFTER INSERT ON public.fraud_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_fraud_report();

CREATE INDEX fraud_reports_status_idx ON public.fraud_reports(status, created_at DESC);