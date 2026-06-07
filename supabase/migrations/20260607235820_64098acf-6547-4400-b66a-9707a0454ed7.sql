
-- 1. admin_notifications: only staff can insert
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.admin_notifications;
CREATE POLICY "Staff can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- 2. property_documents: restrict insert to staff
DROP POLICY IF EXISTS "Authenticated users can create property_documents" ON public.property_documents;
CREATE POLICY "Staff can create property_documents"
  ON public.property_documents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- 3. properties: restrict broad "view all" to staff only
DROP POLICY IF EXISTS "Authenticated users can view all properties" ON public.properties;
CREATE POLICY "Staff can view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- 4. BOQ storage: require authentication for uploads
DROP POLICY IF EXISTS "Anyone can upload BOQ files" ON storage.objects;
CREATE POLICY "Authenticated users can upload BOQ files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'boq-files');

-- 5. Revoke EXECUTE on internal SECURITY DEFINER helpers from anon/authenticated.
--    Policies invoke these regardless of EXECUTE grant (definer functions ignore caller's privilege),
--    so revoking only blocks direct RPC calls.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_staff() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.current_profile_id() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_profile_id(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_property_slug() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_profile_created() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_signup() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
-- set_user_role is the intended RPC entry point for super admins; keep executable for authenticated.
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, app_role) TO authenticated;
