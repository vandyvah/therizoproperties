import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/components/currency/CurrencySwitcher";
import { PropertyMediaCarousel } from "@/components/property/PropertyMediaCarousel";
import { 
  MapPin, 
  Home, 
  Shield, 
  TrendingUp, 
  Calendar, 
  ArrowLeft,
  Phone,
  Mail
} from "lucide-react";


interface PropertyMedia {
  file_url: string;
  file_type: string;
  file_name: string;
  sort_order: number | null;
}

interface Property {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  city: string;
  area: string | null;
  property_type: string;
  asking_price_ngn: number;
  min_price_ngn: number | null;
  rental_potential_monthly_ngn: number | null;
  airbnb_potential_nightly_ngn: number | null;
  risk_rating: string;
  status: string;
  created_at: string;
  updated_at: string;
  property_media: PropertyMedia[];
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useCurrency();

  // Fetch property by ID or slug
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["public-property", id],
    queryFn: async () => {
      // Try to find by slug first, then by id
      let query = supabase
        .from("properties")
        .select(`
          id, title, slug, description, city, area, property_type,
          asking_price_ngn, min_price_ngn, rental_potential_monthly_ngn,
          airbnb_potential_nightly_ngn, risk_rating, status, created_at, updated_at,
          property_media(file_url, file_type, file_name, sort_order)
        `)
        .eq("status", "listed");

      // Check if id looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "");
      
      if (isUUID) {
        query = query.eq("id", id);
      } else {
        // Try slug first
        query = query.eq("slug", id);
      }

      const { data, error } = await query.maybeSingle();
      
      // If not found by slug, try by ID as fallback
      if (!data && !isUUID && id) {
        const { data: byId, error: byIdError } = await supabase
          .from("properties")
          .select(`
            id, title, slug, description, city, area, property_type,
            asking_price_ngn, min_price_ngn, rental_potential_monthly_ngn,
            airbnb_potential_nightly_ngn, risk_rating, status, created_at, updated_at,
            property_media(file_url, file_type, file_name, sort_order)
          `)
          .eq("status", "listed")
          .eq("id", id)
          .maybeSingle();
        
        if (byIdError) throw byIdError;
        return byId as Property | null;
      }
      
      if (error) throw error;
      return data as Property | null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="pt-32 pb-16 bg-navy">
          <div className="container-wide">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-12 w-96" />
          </div>
        </section>
        <section className="section-padding bg-ivory">
          <div className="container-wide">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-sm" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-sm" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <SEOHead
          title="Property Not Found"
          description="The requested property could not be found or is no longer available."
          noindex
        />
        <section className="pt-32 pb-16 bg-navy">
          <div className="container-wide">
            <h1 className="font-display text-4xl font-semibold text-ivory">
              Property Not Found
            </h1>
          </div>
        </section>
        <section className="section-padding bg-ivory">
          <div className="container-wide text-center">
            <p className="text-slate mb-8">
              This property may have been sold or is no longer listed.
            </p>
            <Button variant="gold" asChild>
              <Link to="/properties">
                <ArrowLeft className="mr-2" size={16} />
                View All Properties
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const riskColors = {
    low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    high: "bg-red-500/10 text-red-700 border-red-500/20",
  };

  // Generate SEO-optimized title
  const location = property.area ? `${property.area}, ${property.city}` : property.city;
  const seoTitle = `${property.title} in ${location} — ${formatPrice(property.asking_price_ngn)}`;
  
  // Generate meta description
  const seoDescription = property.description 
    ? property.description.substring(0, 155) + (property.description.length > 155 ? "..." : "")
    : `${property.property_type} property available in ${location}. Verified by Therizo. Starting at ${formatPrice(property.asking_price_ngn)}. Contact us for viewings.`;

  // Get the hero image for OG
  const heroImage = property.property_media?.[0]?.file_url || "https://therizoproperties.com/og/og-properties.jpg";
  
  // Canonical URL using slug if available
  const canonicalPath = property.slug ? `/properties/${property.slug}` : `/properties/${property.id}`;

  // Create structured data for SEO
  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || `${property.property_type} property in ${location}`,
    url: `https://therizoproperties.com${canonicalPath}`,
    datePosted: property.created_at,
    dateModified: property.updated_at,
    image: heroImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.area || property.city,
      addressRegion: property.city,
      addressCountry: "NG",
    },
    offers: {
      "@type": "Offer",
      price: property.asking_price_ngn,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
    },
    seller: {
      "@type": "RealEstateAgent",
      name: "Therizo Property and Development Corporation",
      url: "https://therizoproperties.com",
    },
  };

  const hasMedia = property.property_media && property.property_media.length > 0;

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalPath}
        ogType="product"
        ogImage={heroImage}
        keywords={[
          property.city,
          property.area || "",
          property.property_type,
          "Nigerian property",
          "property for sale",
          "verified property",
          location,
          "real estate investment",
        ].filter(Boolean)}
      />
      <JsonLd data={propertySchema} />

      {/* Hero */}
      <section className="pt-32 pb-8 bg-navy">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Properties", href: "/properties" },
              { label: property.title, href: canonicalPath },
            ]}
          />
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className="border-gold/50 text-gold">
                {property.property_type}
              </Badge>
              <Badge className={riskColors[property.risk_rating as keyof typeof riskColors]}>
                {property.risk_rating} risk
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-ivory mb-4">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-ivory/70">
              <MapPin size={18} />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Media Carousel */}
              {hasMedia ? (
                <div className="bg-warm-white border border-sand rounded-sm p-4">
                  <PropertyMediaCarousel 
                    media={property.property_media} 
                    propertyTitle={property.title}
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-gradient-to-br from-navy/10 via-sand to-navy/5 flex items-center justify-center">
                  <span className="text-sm uppercase tracking-widest text-slate/60">Media coming soon</span>
                </div>
              )}

              {/* Price Card */}
              <div className="bg-warm-white border border-sand rounded-sm p-6">
                <p className="text-sm text-slate mb-2">Asking Price</p>
                <p className="font-display text-3xl md:text-4xl font-semibold text-ink">
                  {formatPrice(property.asking_price_ngn)}
                </p>
                {property.min_price_ngn && property.min_price_ngn < property.asking_price_ngn && (
                  <p className="text-sm text-slate mt-2">
                    Negotiable from {formatPrice(property.min_price_ngn)}
                  </p>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="bg-warm-white border border-sand rounded-sm p-6">
                  <h2 className="font-display text-xl font-semibold text-ink mb-4">
                    Property Description
                  </h2>
                  <p className="text-slate leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Investment Potential */}
              {(property.rental_potential_monthly_ngn || property.airbnb_potential_nightly_ngn) && (
                <div className="bg-warm-white border border-sand rounded-sm p-6">
                  <h2 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2">
                    <TrendingUp className="text-gold" size={20} />
                    Investment Potential
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {property.rental_potential_monthly_ngn && (
                      <div className="p-4 bg-muted/50 rounded-sm">
                        <p className="text-sm text-slate mb-1">Annual Rental Potential</p>
                        <p className="font-display text-xl font-semibold text-ink">
                          {formatPrice(property.rental_potential_monthly_ngn)}
                          <span className="text-xs text-slate/70 font-normal ml-1">/year</span>
                        </p>
                      </div>
                    )}
                    {property.airbnb_potential_nightly_ngn && (
                      <div className="p-4 bg-muted/50 rounded-sm">
                        <p className="text-sm text-slate mb-1">Airbnb Nightly Rate</p>
                        <p className="font-display text-xl font-semibold text-ink">
                          {formatPrice(property.airbnb_potential_nightly_ngn)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Property Details Grid */}
              <div className="bg-warm-white border border-sand rounded-sm p-6">
                <h2 className="font-display text-xl font-semibold text-ink mb-4">
                  Property Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Home className="text-gold" size={18} />
                    <div>
                      <p className="text-sm text-slate">Property Type</p>
                      <p className="font-medium text-ink">{property.property_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gold" size={18} />
                    <div>
                      <p className="text-sm text-slate">Location</p>
                      <p className="font-medium text-ink">{location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="text-gold" size={18} />
                    <div>
                      <p className="text-sm text-slate">Risk Rating</p>
                      <p className="font-medium text-ink capitalize">{property.risk_rating}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gold" size={18} />
                    <div>
                      <p className="text-sm text-slate">Listed</p>
                      <p className="font-medium text-ink">
                        {new Date(property.created_at).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "long",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-navy rounded-sm p-6 sticky top-24">
                <h3 className="font-display text-xl font-semibold text-ivory mb-4">
                  Interested in This Property?
                </h3>
                <p className="text-ivory/70 text-sm mb-6">
                  Contact our team to schedule a viewing or request more information about this property.
                </p>
                <div className="space-y-3">
                  <Button variant="gold" className="w-full" asChild>
                    <Link to={`/contact?property=${property.id}`}>
                      <Mail className="mr-2" size={16} />
                      Send Enquiry
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full border-ivory/30 text-ivory hover:bg-ivory/10" asChild>
                    <a href="tel:+2348000000000">
                      <Phone className="mr-2" size={16} />
                      Call Us
                    </a>
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-ivory/20">
                  <div className="flex items-center gap-2 text-gold text-sm">
                    <Shield size={16} />
                    <span>Verified by Therizo</span>
                  </div>
                  <p className="text-ivory/60 text-xs mt-2">
                    This property has passed our documentation and risk review process.
                  </p>
                </div>
              </div>

              {/* ROI Calculator CTA */}
              <div className="bg-warm-white border border-sand rounded-sm p-6">
                <h3 className="font-display text-lg font-semibold text-ink mb-2">
                  Calculate Your ROI
                </h3>
                <p className="text-sm text-slate mb-4">
                  Use our calculator to estimate potential returns on this property.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/calculator">
                    <TrendingUp className="mr-2" size={16} />
                    Open Calculator
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fraud warning + Back to Properties */}
      <section className="py-8 bg-muted/50">
        <div className="container-wide space-y-6">
          <FraudWarning />
          <Button variant="ghost" asChild>
            <Link to="/properties">
              <ArrowLeft className="mr-2" size={16} />
              Back to All Properties
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default PropertyDetail;