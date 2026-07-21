import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Building, Loader2, Video } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createFAQSchema, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/components/currency/CurrencySwitcher";


const propertyFAQs = [
  {
    question: "Are all Therizo properties verified for clean titles?",
    answer: "Yes. Every property listed on Therizo undergoes our rigorous due diligence process, including ownership verification, title document review, and market price validation before being approved for listing."
  },
  {
    question: "Can I invest in Nigerian property from abroad?",
    answer: "Absolutely. Many of our clients are diaspora investors. We handle on-ground coordination, property inspections, documentation, and can work with your legal representatives to complete transactions remotely."
  },
  {
    question: "What locations does Therizo cover?",
    answer: "We focus on prime markets including Lagos (Lekki, Ikoyi, Victoria Island, Ajah), Abuja (Maitama, Wuse), Port Harcourt, and select growth corridors in Ogun State and other regions."
  },
  {
    question: "How do I calculate potential returns on a property?",
    answer: "Use our free ROI Calculator to estimate rental yields, cap rates, and payback periods. Our consultants can also provide market-specific analysis for any property you're considering."
  }
];

type RiskRating = "low" | "medium" | "high";

type PropertyMedia = {
  file_url: string;
  file_type: string;
  sort_order: number | null;
};

type PublicProperty = {
  id: string;
  title: string;
  slug: string | null;
  city: string;
  area: string | null;
  status: string;
  asking_price_ngn: number;
  risk_rating: RiskRating;
  property_type: string;
  description: string | null;
  property_media?: PropertyMedia[] | null;
};

const Properties = () => {
  const { formatPrice } = useCurrency();

  const {
    data: listings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, slug, city, area, status, asking_price_ngn, risk_rating, property_type, description, property_media(file_url, file_type, sort_order)",
        )
        .eq("status", "listed")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []) as PublicProperty[];
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Verified Nigerian Properties | Lagos & Abuja"
        description="Browse verified Nigerian properties with clean titles. Luxury homes, investment apartments, and development opportunities in Lagos, Abuja, and key growth markets."
        keywords="Nigerian properties for sale, Lagos real estate listings, Abuja property investment, Lekki homes for sale, Ikoyi luxury apartments, verified Nigerian property"
        canonicalUrl="/properties"
        ogImage="https://therizoproperties.com/og/og-properties.jpg"
      />
      <JsonLd data={createFAQSchema(propertyFAQs)} />
      <JsonLd data={createBreadcrumbSchema([
        { name: "Home", url: "https://therizoproperties.com/" },
        { name: "Properties", url: "https://therizoproperties.com/properties" },
      ])} />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Properties", href: "/properties" }]} />
          <div className="max-w-3xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                <Building className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Our Portfolio</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Selected Properties
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              A focused selection of properties we are comfortable standing
              behind. Each listing comes with clear documentation, transparent
              pricing, and support from a senior consultant.
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="section-padding bg-ivory" aria-labelledby="properties-grid-heading">
        <div className="container-wide">
          <h2 id="properties-grid-heading" className="sr-only">Available Properties</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <span className="ml-3 text-slate">Loading listings…</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(listings || []).length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-slate">No listed properties available right now.</p>
                </div>
              ) : null}

              {(isError ? [] : listings || []).map((property) => {
                const media = (property.property_media || [])
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                const coverImage = media.find((m) => m.file_type === "image")?.file_url;
                const hasVideo = media.some((m) => m.file_type === "video");
                const location = property.area ? `${property.area}, ${property.city}` : property.city;

                return (
              <article
                key={property.id}
                className="group bg-warm-white rounded-sm overflow-hidden border border-sand hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />

                  ) : hasVideo ? (
                    <video
                      src={media.find((m) => m.file_type === "video")?.file_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      // Load first frame as poster
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-navy/10 via-sand to-navy/5 flex items-center justify-center">
                      <span className="text-xs uppercase tracking-widest text-slate/60">Media coming soon</span>
                    </div>
                  )}

                  <Badge className="absolute top-4 left-4 bg-gold text-navy hover:bg-gold-dark">
                    {property.risk_rating} risk
                  </Badge>

                  {hasVideo ? (
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-sm bg-navy/80 px-3 py-2">
                      <Video className="text-gold" size={16} />
                      <span className="text-xs text-ivory">Video</span>
                    </div>
                  ) : null}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin size={14} />
                    <span>{location}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-sm text-slate mb-4 line-clamp-2">
                    {property.description || `${property.property_type} in ${location}.`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-semibold text-navy">
                      {formatPrice(property.asking_price_ngn)}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/properties/${property.slug || property.id}`}>
                        View
                        <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
                );
              })}
            </div>
          )}

          {isError ? (
            <div className="mt-8 rounded-sm border border-sand bg-warm-white p-6 text-center">
              <p className="text-slate">
                We couldn’t load the live listings right now. Please refresh and try again.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
            Looking for Something Specific?
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Tell us your requirements and budget. We can source properties that
            match your criteria and meet our documentation standards.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/contact">
              Speak with a Consultant
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-4">
              Property Investment FAQs
            </h2>
          </div>
          <FAQSection faqs={propertyFAQs} />
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
