-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'spc', 'support');

-- Create status enums
CREATE TYPE public.property_status AS ENUM ('draft', 'under_review', 'listed', 'on_hold', 'sold');
CREATE TYPE public.risk_rating AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.doc_type AS ENUM ('c_of_o', 'deed_of_assignment', 'survey_plan', 'building_approval', 'estate_agreement', 'other');
CREATE TYPE public.check_type AS ENUM ('ownership_verified', 'title_verified', 'survey_verified', 'planning_approval_checked', 'price_sanity_check', 'rental_comp_check', 'risk_review');
CREATE TYPE public.check_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE public.client_type AS ENUM ('buyer', 'seller', 'investor_developer', 'landowner', 'other');
CREATE TYPE public.client_source AS ENUM ('referral', 'social_media', 'website_form', 'walk_in', 'other');
CREATE TYPE public.lead_stage AS ENUM ('new', 'qualified', 'viewing_scheduled', 'offer_made', 'under_negotiation', 'closed_won', 'closed_lost');
CREATE TYPE public.viewing_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.deal_status AS ENUM ('in_progress', 'under_contract', 'closed', 'cancelled');
CREATE TYPE public.consultant_role_type AS ENUM ('originator', 'assistant');
CREATE TYPE public.roi_strategy AS ENUM ('long_term_rental', 'airbnb', 'compare');
CREATE TYPE public.activity_entity_type AS ENUM ('property', 'lead', 'client', 'deal', 'viewing', 'roi');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  area TEXT,
  property_type TEXT NOT NULL,
  status property_status NOT NULL DEFAULT 'draft',
  asking_price_ngn NUMERIC NOT NULL DEFAULT 0,
  min_price_ngn NUMERIC,
  rental_potential_monthly_ngn NUMERIC,
  airbnb_potential_nightly_ngn NUMERIC,
  risk_rating risk_rating NOT NULL DEFAULT 'medium',
  owner_name TEXT,
  owner_contact TEXT,
  assigned_consultant_id UUID REFERENCES public.profiles(id),
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_documents table
CREATE TABLE public.property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  doc_type doc_type NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  uploaded_by_id UUID REFERENCES public.profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create due_diligence_checks table
CREATE TABLE public.due_diligence_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  check_type check_type NOT NULL,
  status check_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  checked_by_id UUID REFERENCES public.profiles(id),
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  client_type client_type NOT NULL,
  source client_source NOT NULL DEFAULT 'other',
  notes TEXT,
  assigned_consultant_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id),
  stage lead_stage NOT NULL DEFAULT 'new',
  budget_min_ngn NUMERIC,
  budget_max_ngn NUMERIC,
  preferred_city TEXT,
  preferred_neighbourhoods TEXT,
  lost_reason TEXT,
  created_by_id UUID REFERENCES public.profiles(id),
  assigned_consultant_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create viewings table
CREATE TABLE public.viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status viewing_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  buyer_client_id UUID REFERENCES public.clients(id),
  seller_client_id UUID REFERENCES public.clients(id),
  lead_id UUID REFERENCES public.leads(id),
  status deal_status NOT NULL DEFAULT 'in_progress',
  sale_price_ngn NUMERIC NOT NULL DEFAULT 0,
  gross_commission_rate NUMERIC NOT NULL DEFAULT 3,
  gross_commission_amount_ngn NUMERIC NOT NULL DEFAULT 0,
  direct_deal_costs_ngn NUMERIC NOT NULL DEFAULT 0,
  net_company_commission_ngn NUMERIC NOT NULL DEFAULT 0,
  closing_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create deal_consultant_shares table
CREATE TABLE public.deal_consultant_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  consultant_id UUID REFERENCES public.profiles(id) NOT NULL,
  role_type consultant_role_type NOT NULL,
  share_percentage_of_net NUMERIC NOT NULL DEFAULT 0,
  amount_ngn NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create roi_calculations table
CREATE TABLE public.roi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  client_id UUID REFERENCES public.clients(id),
  created_by_id UUID REFERENCES public.profiles(id),
  strategy roi_strategy NOT NULL,
  property_location TEXT,
  purchase_price_ngn NUMERIC NOT NULL DEFAULT 0,
  renovation_cost_ngn NUMERIC NOT NULL DEFAULT 0,
  other_acquisition_costs_ngn NUMERIC NOT NULL DEFAULT 0,
  monthly_rent_ngn NUMERIC,
  airbnb_nightly_rate_ngn NUMERIC,
  airbnb_occupancy_rate_pct NUMERIC,
  annual_property_tax_ngn NUMERIC NOT NULL DEFAULT 0,
  annual_insurance_ngn NUMERIC NOT NULL DEFAULT 0,
  annual_maintenance_ngn NUMERIC NOT NULL DEFAULT 0,
  management_fee_pct NUMERIC NOT NULL DEFAULT 10,
  gross_annual_income_ngn NUMERIC NOT NULL DEFAULT 0,
  net_annual_income_ngn NUMERIC NOT NULL DEFAULT 0,
  cap_rate_pct NUMERIC NOT NULL DEFAULT 0,
  cash_on_cash_return_pct NUMERIC NOT NULL DEFAULT 0,
  payback_period_years NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  entity_type activity_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_diligence_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_consultant_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's profile id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Create function to get current user's profile id
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_profile_id(auth.uid())
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- RLS Policies for properties
CREATE POLICY "Authenticated users can view all properties" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (created_by_id = public.current_profile_id());

CREATE POLICY "Admins can update any property" ON public.properties
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Consultants can update their own draft/under_review properties" ON public.properties
  FOR UPDATE USING (
    assigned_consultant_id = public.current_profile_id() 
    AND status IN ('draft', 'under_review')
  );

CREATE POLICY "Admins can delete properties" ON public.properties
  FOR DELETE USING (public.is_admin());

-- RLS Policies for property_documents
CREATE POLICY "Authenticated users can view all property_documents" ON public.property_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create property_documents" ON public.property_documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins and support can manage property_documents" ON public.property_documents
  FOR ALL USING (public.is_admin() OR public.has_role(auth.uid(), 'support'));

-- RLS Policies for due_diligence_checks
CREATE POLICY "Authenticated users can view all due_diligence_checks" ON public.due_diligence_checks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create due_diligence_checks" ON public.due_diligence_checks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update due_diligence_checks" ON public.due_diligence_checks
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view all clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update any client" ON public.clients
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Consultants can update their own clients" ON public.clients
  FOR UPDATE USING (assigned_consultant_id = public.current_profile_id());

-- RLS Policies for leads
CREATE POLICY "Authenticated users can view all leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update any lead" ON public.leads
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Consultants can update their own leads" ON public.leads
  FOR UPDATE USING (assigned_consultant_id = public.current_profile_id());

-- RLS Policies for viewings
CREATE POLICY "Authenticated users can view all viewings" ON public.viewings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create viewings" ON public.viewings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can update any viewing" ON public.viewings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Consultants can update viewings they created" ON public.viewings
  FOR UPDATE USING (created_by_id = public.current_profile_id());

-- RLS Policies for deals
CREATE POLICY "Authenticated users can view all deals" ON public.deals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create deals" ON public.deals
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage all deals" ON public.deals
  FOR ALL USING (public.is_admin());

-- RLS Policies for deal_consultant_shares
CREATE POLICY "Authenticated users can view all deal_consultant_shares" ON public.deal_consultant_shares
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage deal_consultant_shares" ON public.deal_consultant_shares
  FOR ALL USING (public.is_admin());

-- RLS Policies for roi_calculations
CREATE POLICY "Authenticated users can view all roi_calculations" ON public.roi_calculations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create roi_calculations" ON public.roi_calculations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own roi_calculations" ON public.roi_calculations
  FOR UPDATE USING (created_by_id = public.current_profile_id());

-- RLS Policies for activity_log
CREATE POLICY "Authenticated users can view all activity_log" ON public.activity_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create activity_log entries" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();