-- Add slug column to properties for SEO-friendly URLs
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug) WHERE slug IS NOT NULL;

-- Create function to generate slug from property details
CREATE OR REPLACE FUNCTION public.generate_property_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from property type, area/city
  base_slug := lower(
    regexp_replace(
      concat_ws('-',
        NEW.property_type,
        COALESCE(NEW.area, ''),
        NEW.city,
        substring(NEW.id::text, 1, 8)
      ),
      '[^a-z0-9]+', '-', 'gi'
    )
  );
  
  -- Clean up multiple dashes and trim
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.properties WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS trigger_generate_property_slug ON public.properties;
CREATE TRIGGER trigger_generate_property_slug
  BEFORE INSERT OR UPDATE OF title, property_type, city, area ON public.properties
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION public.generate_property_slug();

-- Update existing properties with slugs
UPDATE public.properties
SET slug = lower(
  regexp_replace(
    trim(both '-' from
      regexp_replace(
        concat_ws('-',
          property_type,
          COALESCE(area, ''),
          city,
          substring(id::text, 1, 8)
        ),
        '[^a-z0-9]+', '-', 'gi'
      )
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;