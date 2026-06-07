
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS whatsapp_consent boolean DEFAULT false;

ALTER TABLE public.roi_calculations
  ADD COLUMN IF NOT EXISTS lead_name text,
  ADD COLUMN IF NOT EXISTS lead_email text,
  ADD COLUMN IF NOT EXISTS lead_phone text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

GRANT INSERT ON public.roi_calculations TO anon;

DROP POLICY IF EXISTS "Anon can submit lead-gen ROI" ON public.roi_calculations;
CREATE POLICY "Anon can submit lead-gen ROI"
ON public.roi_calculations
FOR INSERT
TO anon
WITH CHECK (
  created_by_id IS NULL
  AND lead_email IS NOT NULL
  AND source = 'website-calculator'
);
