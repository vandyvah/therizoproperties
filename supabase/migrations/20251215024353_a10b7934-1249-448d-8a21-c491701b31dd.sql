-- Step 2: Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  client_type text,
  budget text,
  preferred_location text,
  message text NOT NULL,
  page text DEFAULT 'contact',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'closed'))
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to insert contact submissions
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admin/super_admin can view contact submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- Only admin/super_admin can update contact submissions (status changes)
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- Step 3: Create audit_log table for tracking role changes
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  details jsonb
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only super_admin can view audit log
CREATE POLICY "Super admins can view audit log"
ON public.audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- System can insert (via RPC function)
CREATE POLICY "System can insert audit log"
ON public.audit_log
FOR INSERT
WITH CHECK (true);

-- Step 4: Create secure RPC function for setting user roles
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id uuid,
  new_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_super_admin boolean;
  old_role app_role;
  result jsonb;
BEGIN
  -- Check if caller is super_admin
  SELECT public.has_role(auth.uid(), 'super_admin') INTO caller_is_super_admin;
  
  IF NOT caller_is_super_admin THEN
    RAISE EXCEPTION 'Only super admins can modify user roles';
  END IF;
  
  -- Prevent changing own role (safety)
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  -- Get current role
  SELECT role INTO old_role FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Upsert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role;
  
  -- Log the action
  INSERT INTO public.audit_log (actor_user_id, action, target_user_id, details)
  VALUES (
    auth.uid(),
    'role_change',
    target_user_id,
    jsonb_build_object('old_role', old_role, 'new_role', new_role)
  );
  
  result := jsonb_build_object('success', true, 'old_role', old_role, 'new_role', new_role);
  RETURN result;
END;
$$;

-- Step 5: Add helper function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Step 6: Update user_roles RLS to allow super_admin to manage all roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin')
);