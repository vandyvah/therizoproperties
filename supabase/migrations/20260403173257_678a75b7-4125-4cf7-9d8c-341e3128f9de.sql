-- Drop the overly permissive SELECT policy on property_documents
DROP POLICY IF EXISTS "Authenticated users can view all property_documents" ON public.property_documents;

-- Add restrictive SELECT policy: admins, support, super_admins, and consultants assigned to the property
CREATE POLICY "Admins and support can view all property_documents" ON public.property_documents
  FOR SELECT
  USING (
    is_admin() OR is_super_admin() OR has_role(auth.uid(), 'support'::app_role)
  );

CREATE POLICY "Consultants can view documents for their properties" ON public.property_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_documents.property_id
        AND p.assigned_consultant_id = current_profile_id()
    )
  );