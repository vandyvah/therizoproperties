
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily','weekly','instant')),
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  last_sent_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  utm JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT INSERT ON public.saved_searches TO anon;
GRANT ALL ON public.saved_searches TO service_role;

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a saved search"
  ON public.saved_searches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view saved searches"
  ON public.saved_searches FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can manage saved searches"
  ON public.saved_searches FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can delete saved searches"
  ON public.saved_searches FOR DELETE
  TO authenticated
  USING (public.is_staff());

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_saved_searches_active_freq ON public.saved_searches(active, frequency, last_sent_at);
CREATE INDEX idx_saved_searches_email ON public.saved_searches(lower(email));
