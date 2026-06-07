ALTER TABLE public.roi_calculations
  ADD COLUMN IF NOT EXISTS whatsapp_consent boolean NOT NULL DEFAULT false;