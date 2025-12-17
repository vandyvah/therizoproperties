-- Create storage bucket for property media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-media', 'property-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create table to track property media files
CREATE TABLE IF NOT EXISTS public.property_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  uploaded_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

-- RLS policies for property_media
CREATE POLICY "Admins can manage all property media"
ON public.property_media
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Consultants can manage media for their properties"
ON public.property_media
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.assigned_consultant_id = current_profile_id()
  )
);

CREATE POLICY "Anyone can view media for listed properties"
ON public.property_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.status = 'listed'
  )
);

-- Storage policies for property-media bucket
CREATE POLICY "Authenticated users can upload property media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-media');

CREATE POLICY "Authenticated users can update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'property-media');

CREATE POLICY "Anyone can view property media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'property-media');

CREATE POLICY "Authenticated users can delete property media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'property-media');