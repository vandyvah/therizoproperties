CREATE OR REPLACE FUNCTION public.autogen_signal_on_deal_closed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city text;
  v_type text;
  v_headline text;
BEGIN
  IF NEW.status = 'closed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT city, property_type INTO v_city, v_type FROM public.properties WHERE id = NEW.property_id;
    v_headline := 'Closed: ' || COALESCE(NULLIF(v_type, ''), 'property') || ' in ' || COALESCE(NULLIF(v_city, ''), 'Nigeria');
    INSERT INTO public.activity_signals (headline, city, category, occurred_at, published)
    VALUES (v_headline, v_city, 'deal', COALESCE(NEW.closing_date::timestamptz, now()), true);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_autogen_signal_on_deal_closed ON public.deals;
CREATE TRIGGER trg_autogen_signal_on_deal_closed
AFTER INSERT OR UPDATE OF status ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.autogen_signal_on_deal_closed();