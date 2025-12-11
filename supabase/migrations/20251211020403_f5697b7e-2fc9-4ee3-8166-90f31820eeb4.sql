-- Create announcements table for Therizo news/updates
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_id UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public can read published announcements
CREATE POLICY "Anyone can view announcements"
ON public.announcements
FOR SELECT
USING (published_at <= now());

-- Admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.announcements
FOR ALL
USING (is_admin());

-- Insert sample announcements
INSERT INTO public.announcements (title, content, category, is_featured) VALUES
  ('New Luxury Properties in Banana Island', 'We have just listed 3 exclusive waterfront villas in Banana Island with verified C of O documentation. Starting from ₦850M.', 'listing', true),
  ('Q4 2024 Market Report Available', 'Download our latest Nigerian real estate market analysis covering Lagos, Abuja, and Port Harcourt price trends.', 'report', false),
  ('Therizo Wins Best Boutique Agency Award', 'We are honored to receive the Nigerian Real Estate Excellence Award for Best Boutique Agency 2024.', 'news', true);