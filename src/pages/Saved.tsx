import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowRight, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useShortlist, shortlistSync } from "@/hooks/useShortlist";
import { useCurrency } from "@/components/currency/CurrencySwitcher";
import { SaveButton } from "@/components/property/SaveButton";
import { EmailShortlistDialog } from "@/components/property/EmailShortlistDialog";
import { SavedSearchDialog } from "@/components/property/SavedSearchDialog";
import { SyncShortlistDialog } from "@/components/property/SyncShortlistDialog";

export default function Saved() {
  const { ids, clear, count, setAll } = useShortlist();
  const { formatPrice } = useCurrency();
  const [params, setParams] = useSearchParams();
  const handledToken = useRef<string | null>(null);

  // Magic-link handshake: ?sync=<token> loads the cloud shortlist and persists the token.
  useEffect(() => {
    const token = params.get("sync");
    if (!token || handledToken.current === token) return;
    handledToken.current = token;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("shortlist-sync", {
          body: { action: "load", token },
        });
        if (error) throw error;
        const cloudIds = (data as any)?.property_ids as string[] | undefined;
        if (Array.isArray(cloudIds)) {
          const merged = Array.from(new Set([...ids, ...cloudIds]));
          setAll(merged);
          shortlistSync.setToken(token);
          toast.success("Shortlist synced", {
            description: "This device is now linked to your saved list.",
          });
        }
      } catch {
        toast.error("Sync link invalid or expired");
      } finally {
        params.delete("sync");
        setParams(params, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const { data: listings, isLoading } = useQuery({
    queryKey: ["shortlist-properties", ids.slice().sort().join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("properties")
        .select("id, slug, title, city, area, asking_price_ngn, risk_rating, property_type, property_media(file_url, file_type, sort_order)")
        .in("id", ids)
        .eq("is_listed", true);
      if (error) throw error;
      return (data ?? []) as any[];
    },
    staleTime: 30_000,
  });

  const shareUrl =
    typeof window !== "undefined" && ids.length > 0
      ? `${window.location.origin}/saved?ids=${ids.join(",")}`
      : "";

  const whatsappHref =
    ids.length > 0
      ? `https://wa.me/2348034830087?text=${encodeURIComponent(
          `Hello Therizo, here is my shortlist of ${count} propert${count === 1 ? "y" : "ies"} — ${shareUrl}\n\nI'd like to discuss viewings and next steps.`
        )}`
      : "#";

  return (
    <Layout>
      <SEOHead
        title="Your Shortlist | Therizo Properties"
        description="Your saved Therizo properties in one place. Send your shortlist to a consultant on WhatsApp to arrange viewings and paperwork."
        canonical="https://therizoproperties.com/saved"
        noindex
      />
      <section className="pt-32 pb-10 bg-navy">
        <div className="container-wide">
          <div className="flex items-center gap-3 text-gold">
            <Heart className="h-5 w-5 fill-gold" />
            <span className="text-xs uppercase tracking-widest">Your shortlist</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3">
            {count === 0 ? "No saved properties yet" : `${count} saved propert${count === 1 ? "y" : "ies"}`}
          </h1>
          <p className="text-ivory/70 mt-2 max-w-2xl">
            Curate a private shortlist and send it to a Therizo consultant on WhatsApp for viewings, due-diligence, and paperwork.
          </p>
        </div>
      </section>

      <section className="section-padding bg-ivory">
        <div className="container-wide">
          {count === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate mb-6">
                Browse properties and tap the heart to add them here.
              </p>
              <Button asChild variant="gold">
                <Link to="/properties">Browse properties <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Button asChild variant="gold" size="lg">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send shortlist on WhatsApp
                  </a>
                </Button>
                <EmailShortlistDialog propertyIds={ids} />
                <SavedSearchDialog />
                <SyncShortlistDialog propertyIds={ids} />
                <Button asChild variant="outline">
                  <Link to="/contact">Book a strategy call</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (confirm("Clear your entire shortlist?")) clear();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              </div>

              {isLoading ? (
                <p className="text-slate">Loading your shortlist…</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(listings ?? []).map((property: any) => {
                    const media = (property.property_media || [])
                      .slice()
                      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                    const cover = media.find((m: any) => m.file_type === "image")?.file_url;
                    const location = property.area ? `${property.area}, ${property.city}` : property.city;
                    return (
                      <article
                        key={property.id}
                        className="group bg-warm-white rounded-sm overflow-hidden border border-sand hover:shadow-lg transition-all"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                          {cover ? (
                            <img src={cover} alt={property.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-navy/10 via-sand to-navy/5 flex items-center justify-center">
                              <span className="text-xs uppercase tracking-widest text-slate/60">Media coming soon</span>
                            </div>
                          )}
                          <Badge className="absolute top-4 left-4 bg-gold text-navy">{property.risk_rating} risk</Badge>
                          <SaveButton propertyId={property.id} propertyTitle={property.title} className="absolute bottom-4 right-4" />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin size={14} />
                            <span>{location}</span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-ink mb-2 line-clamp-2">{property.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xl font-semibold text-navy">
                              {formatPrice(property.asking_price_ngn)}
                            </span>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/properties/${property.slug || property.id}`}>
                                View <ArrowRight size={14} className="ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
