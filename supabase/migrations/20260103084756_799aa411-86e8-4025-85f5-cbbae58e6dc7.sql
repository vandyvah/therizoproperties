-- Create material_requests table
CREATE TABLE public.material_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  role text NOT NULL,
  company_name text,
  phone text NOT NULL,
  email text,
  site_location text NOT NULL,
  delivery_timeline text NOT NULL,
  request_type text NOT NULL,
  boq_file_url text,
  access_constraints text,
  payment_preference text NOT NULL,
  status text NOT NULL DEFAULT 'New',
  internal_notes text
);

-- Create material_request_items table
CREATE TABLE public.material_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.material_requests(id) ON DELETE CASCADE,
  category text NOT NULL,
  specification text NOT NULL,
  quantity_unit text NOT NULL,
  notes text
);

-- Enable RLS
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_request_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for material_requests
-- Anyone can submit a material request (public form)
CREATE POLICY "Anyone can submit material requests"
ON public.material_requests
FOR INSERT
WITH CHECK (true);

-- Admins can view all material requests
CREATE POLICY "Admins can view material requests"
ON public.material_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can update material requests
CREATE POLICY "Admins can update material requests"
ON public.material_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can delete material requests
CREATE POLICY "Admins can delete material requests"
ON public.material_requests
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS policies for material_request_items
-- Anyone can insert items (linked to request submission)
CREATE POLICY "Anyone can submit material request items"
ON public.material_request_items
FOR INSERT
WITH CHECK (true);

-- Admins can view all items
CREATE POLICY "Admins can view material request items"
ON public.material_request_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can update items
CREATE POLICY "Admins can update material request items"
ON public.material_request_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can delete items
CREATE POLICY "Admins can delete material request items"
ON public.material_request_items
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create storage bucket for BOQ files
INSERT INTO storage.buckets (id, name, public)
VALUES ('boq-files', 'boq-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for BOQ uploads
CREATE POLICY "Anyone can upload BOQ files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'boq-files');

CREATE POLICY "Admins can view BOQ files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'boq-files' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));