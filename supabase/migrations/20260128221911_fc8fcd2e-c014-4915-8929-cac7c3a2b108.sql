-- Drop the existing policies that use FOR ALL and recreate with specific operation policies
DROP POLICY IF EXISTS "Consultants can manage media for their properties" ON public.property_media;

-- Create separate INSERT policy for consultants
CREATE POLICY "Consultants can insert media for their properties"
ON public.property_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_media.property_id
    AND p.assigned_consultant_id = current_profile_id()
  )
);

-- Create separate UPDATE policy for consultants
CREATE POLICY "Consultants can update media for their properties"
ON public.property_media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_media.property_id
    AND p.assigned_consultant_id = current_profile_id()
  )
);

-- Create separate DELETE policy for consultants
CREATE POLICY "Consultants can delete media for their properties"
ON public.property_media
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_media.property_id
    AND p.assigned_consultant_id = current_profile_id()
  )
);

-- Also allow consultants to view media for their properties (not just listed ones)
CREATE POLICY "Consultants can view media for their properties"
ON public.property_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = property_media.property_id
    AND p.assigned_consultant_id = current_profile_id()
  )
);