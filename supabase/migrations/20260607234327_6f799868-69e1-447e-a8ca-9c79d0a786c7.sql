
-- Helper: returns true if the current user has ANY role in user_roles
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

-- ===== activity_log =====
DROP POLICY IF EXISTS "Authenticated users can view all activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Users can create activity_log entries" ON public.activity_log;

CREATE POLICY "Staff can view activity_log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can create own activity_log entries"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff()
    AND (user_id IS NULL OR user_id = public.current_profile_id())
  );

-- ===== audit_log =====
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

CREATE POLICY "Authenticated can insert own audit log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (actor_user_id IS NULL OR actor_user_id = auth.uid());

-- ===== admin_notifications =====
DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;

CREATE POLICY "Authenticated can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===== leads =====
DROP POLICY IF EXISTS "Authenticated users can view all leads" ON public.leads;
CREATE POLICY "Staff can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ===== deals =====
DROP POLICY IF EXISTS "Authenticated users can view all deals" ON public.deals;
CREATE POLICY "Staff can view deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ===== deal_consultant_shares =====
DROP POLICY IF EXISTS "Authenticated users can view all deal_consultant_shares" ON public.deal_consultant_shares;
CREATE POLICY "Staff can view deal_consultant_shares"
  ON public.deal_consultant_shares FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ===== viewings =====
DROP POLICY IF EXISTS "Authenticated users can view all viewings" ON public.viewings;
CREATE POLICY "Staff can view viewings"
  ON public.viewings FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ===== roi_calculations =====
DROP POLICY IF EXISTS "Authenticated users can view all roi_calculations" ON public.roi_calculations;
CREATE POLICY "Staff can view roi_calculations"
  ON public.roi_calculations FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- ===== due_diligence_checks =====
DROP POLICY IF EXISTS "Authenticated users can view all due_diligence_checks" ON public.due_diligence_checks;
DROP POLICY IF EXISTS "Authenticated users can create due_diligence_checks" ON public.due_diligence_checks;
DROP POLICY IF EXISTS "Authenticated users can update due_diligence_checks" ON public.due_diligence_checks;

CREATE POLICY "Staff can view due_diligence_checks"
  ON public.due_diligence_checks FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Staff can create due_diligence_checks"
  ON public.due_diligence_checks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update due_diligence_checks"
  ON public.due_diligence_checks FOR UPDATE
  TO authenticated
  USING (public.is_staff());

-- ===== properties owner PII column-level: hide from anon =====
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, title, description, city, area, property_type, status,
  asking_price_ngn, min_price_ngn, rental_potential_monthly_ngn,
  airbnb_potential_nightly_ngn, risk_rating, assigned_consultant_id,
  created_by_id, created_at, updated_at, slug, is_featured
) ON public.properties TO anon;

-- ===== storage: property-media tighten DELETE & UPDATE =====
DROP POLICY IF EXISTS "Authenticated users can delete property media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their uploads" ON storage.objects;

CREATE POLICY "Admins or owner can delete property media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-media'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR owner = auth.uid()
    )
  );

CREATE POLICY "Admins or owner can update property media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-media'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
      OR owner = auth.uid()
    )
  );
