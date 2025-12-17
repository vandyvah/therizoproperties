-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all clients" ON public.clients;

-- Create restrictive policies for client data access
CREATE POLICY "Admins can view all clients" ON public.clients
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Consultants can view their assigned clients" ON public.clients
  FOR SELECT USING (
    assigned_consultant_id = current_profile_id()
  );