-- Fix: allow super_admin to truly delete properties and related records (force delete)

-- Properties: super_admin can delete
CREATE POLICY "Super admins can delete properties"
ON public.properties
FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- Deals: super_admin can manage (incl. delete) all deals
CREATE POLICY "Super admins can manage all deals"
ON public.deals
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Leads: admins/super_admins can delete (needed for force delete)
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_super_admin());

-- Viewings: admins/super_admins can delete (needed for force delete)
CREATE POLICY "Admins can delete viewings"
ON public.viewings
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_super_admin());

-- ROI calculations: admins/super_admins can delete (needed for force delete)
CREATE POLICY "Admins can delete roi calculations"
ON public.roi_calculations
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_super_admin());

-- Due diligence checks: admins/super_admins can delete (needed for force delete)
CREATE POLICY "Admins can delete due diligence checks"
ON public.due_diligence_checks
FOR DELETE
TO authenticated
USING (public.is_admin() OR public.is_super_admin());

-- Property documents: super_admin can manage (incl. delete) documents
CREATE POLICY "Super admins can manage property documents"
ON public.property_documents
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
