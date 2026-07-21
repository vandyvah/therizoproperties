
-- Composite index for public property list queries (status + featured ordering)
CREATE INDEX IF NOT EXISTS idx_properties_status_featured_updated
  ON public.properties (status, is_featured DESC, updated_at DESC);

-- Index for status-only listing sort
CREATE INDEX IF NOT EXISTS idx_properties_status_updated
  ON public.properties (status, updated_at DESC);

-- Foreign-key lookup index for property_media(property_id) — critical for join fanout
CREATE INDEX IF NOT EXISTS idx_property_media_property_sort
  ON public.property_media (property_id, sort_order);

-- Blog: published post lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
  ON public.blog_posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_cluster
  ON public.blog_posts (cluster_id) WHERE cluster_id IS NOT NULL;

-- Profile lookups by user_id are hot (auth path)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON public.profiles (user_id);
