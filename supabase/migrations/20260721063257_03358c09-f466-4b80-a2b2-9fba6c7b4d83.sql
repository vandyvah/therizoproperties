
CREATE TABLE public.buyer_shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  property_ids uuid[] NOT NULL DEFAULT '{}',
  sync_token text NOT NULL UNIQUE,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.buyer_shortlists TO service_role;

ALTER TABLE public.buyer_shortlists ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: table is only accessed via the shortlist-sync edge function using the service role.

CREATE TRIGGER buyer_shortlists_updated_at
BEFORE UPDATE ON public.buyer_shortlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_buyer_shortlists_token ON public.buyer_shortlists(sync_token);
