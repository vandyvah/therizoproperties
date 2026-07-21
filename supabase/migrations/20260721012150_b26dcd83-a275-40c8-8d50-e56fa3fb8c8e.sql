
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS nurture_track text,
  ADD COLUMN IF NOT EXISTS nurture_variant text;

CREATE TABLE IF NOT EXISTS public.nurture_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  step integer NOT NULL,
  track text,
  variant text,
  subject text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nurture_sends TO authenticated;
GRANT ALL ON public.nurture_sends TO service_role;

ALTER TABLE public.nurture_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view nurture sends"
  ON public.nurture_sends FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE INDEX IF NOT EXISTS nurture_sends_submission_idx
  ON public.nurture_sends(submission_id, step);
