
CREATE TABLE public.property_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  area TEXT,
  property_type TEXT NOT NULL,
  bedrooms TEXT,
  plot_size TEXT,
  asking_price TEXT NOT NULL,
  currency TEXT DEFAULT 'NGN',
  title_status TEXT,
  is_tenanted BOOLEAN,
  can_inspect_this_week BOOLEAN,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT
);

ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;

-- Public can submit
CREATE POLICY "Anyone can submit property"
ON public.property_submissions FOR INSERT
WITH CHECK (true);

-- Dashboard admins can view
CREATE POLICY "Admins can view property submissions"
ON public.property_submissions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update property submissions"
ON public.property_submissions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins can delete
CREATE POLICY "Super admins can delete property submissions"
ON public.property_submissions FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_property_submissions_updated_at
BEFORE UPDATE ON public.property_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
