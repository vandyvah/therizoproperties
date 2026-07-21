
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  reviewer_location TEXT,
  reviewer_role TEXT,
  quote TEXT NOT NULL,
  strategy TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  verified BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT false,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published testimonials"
  ON public.testimonials FOR SELECT
  USING (published = true);
CREATE POLICY "Staff can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.activity_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  city TEXT,
  category TEXT NOT NULL DEFAULT 'milestone',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_signals TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.activity_signals TO authenticated;
GRANT ALL ON public.activity_signals TO service_role;
ALTER TABLE public.activity_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published activity"
  ON public.activity_signals FOR SELECT
  USING (published = true);
CREATE POLICY "Staff can manage activity"
  ON public.activity_signals FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_testimonials_pub ON public.testimonials(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_activity_signals_occurred ON public.activity_signals(published, occurred_at DESC);
