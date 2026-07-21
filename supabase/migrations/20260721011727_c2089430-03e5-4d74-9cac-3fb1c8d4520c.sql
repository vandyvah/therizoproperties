
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS nurture_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nurture_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nurture_paused BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_contact_submissions_nurture
  ON public.contact_submissions (nurture_paused, nurture_step, created_at)
  WHERE nurture_paused = FALSE;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_unsub_token
  ON public.contact_submissions (unsubscribe_token);
