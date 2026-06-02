CREATE POLICY "Anyone can view listed properties"
ON public.properties FOR SELECT
TO anon, authenticated
USING (status = 'listed');

GRANT SELECT ON public.properties TO anon;