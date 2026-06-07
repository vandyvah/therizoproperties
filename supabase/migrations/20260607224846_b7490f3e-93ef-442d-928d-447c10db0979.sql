GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;

GRANT INSERT ON public.roi_calculations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roi_calculations TO authenticated;
GRANT ALL ON public.roi_calculations TO service_role;