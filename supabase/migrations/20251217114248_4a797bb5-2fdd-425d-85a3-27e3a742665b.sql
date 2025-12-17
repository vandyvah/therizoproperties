-- Create blog clusters table
CREATE TABLE public.blog_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  featured_image_url TEXT,
  custom_content TEXT,
  is_auto_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table with all required fields
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_keyword TEXT NOT NULL,
  summary_answer TEXT NOT NULL,
  body_content TEXT NOT NULL,
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  featured_image_caption TEXT,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cluster_id UUID REFERENCES public.blog_clusters(id) ON DELETE SET NULL,
  query_targets TEXT[] NOT NULL DEFAULT '{}',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Quality checklist fields
  originality_confirmed BOOLEAN NOT NULL DEFAULT false,
  accuracy_confirmed BOOLEAN NOT NULL DEFAULT false,
  no_filler_confirmed BOOLEAN NOT NULL DEFAULT false
);

-- Create blog post images for inline images
CREATE TABLE public.blog_post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog internal links tracking
CREATE TABLE public.blog_internal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  target_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_post_id, target_post_id)
);

-- Enable RLS on all tables
ALTER TABLE public.blog_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_internal_links ENABLE ROW LEVEL SECURITY;

-- Blog clusters policies
CREATE POLICY "Anyone can view clusters" ON public.blog_clusters
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage clusters" ON public.blog_clusters
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Blog posts policies - public can only see published posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can manage posts" ON public.blog_posts
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Blog post images policies
CREATE POLICY "Anyone can view images of published posts" ON public.blog_post_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blog_posts 
      WHERE id = post_id AND status = 'published'
    )
  );

CREATE POLICY "Admins can manage post images" ON public.blog_post_images
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Internal links policies
CREATE POLICY "Anyone can view internal links" ON public.blog_internal_links
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage internal links" ON public.blog_internal_links
  FOR ALL USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create updated_at trigger for blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for blog_clusters
CREATE TRIGGER update_blog_clusters_updated_at
  BEFORE UPDATE ON public.blog_clusters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );

CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images' AND
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  );