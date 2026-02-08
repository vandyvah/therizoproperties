import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/currency/CurrencySwitcher";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

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
  asking_price_ngn: number;
  risk_rating: string;
  property_type: string;
  description: string | null;
  property_media?: PropertyMedia[] | null;
};

export function FeaturedPropertiesSection() {
  const { formatPrice } = useCurrency();

  const { data: listings } = useQuery({
    queryKey: ["public-properties", "home-featured"],
    queryFn: async () => {
      // First try to get featured properties
      const { data: featured, error: fErr } = await supabase
        .from("properties")
        .select(
          "id, title, slug, city, area, status, asking_price_ngn, risk_rating, property_type, description, is_featured, property_media(file_url, file_type, sort_order)",
        )
        .eq("status", "listed")
        .eq("is_featured", true)
        .order("updated_at", { ascending: false })
        .limit(3);
      if (fErr) throw fErr;

      // If we have 3+ featured, use those; otherwise backfill with latest listed
      if (featured && featured.length >= 3) {
        return featured.slice(0, 3) as PublicProperty[];
      }

      const remaining = 3 - (featured?.length || 0);
      const featuredIds = (featured || []).map((p) => p.id);
      
      let query = supabase
        .from("properties")
        .select(
          "id, title, slug, city, area, status, asking_price_ngn, risk_rating, property_type, description, is_featured, property_media(file_url, file_type, sort_order)",
        )
        .eq("status", "listed")
        .order("updated_at", { ascending: false })
        .limit(remaining);
      
      if (featuredIds.length > 0) {
        query = query.not("id", "in", `(${featuredIds.join(",")})`);
      }

      const { data: backfill, error: bErr } = await query;
      if (bErr) throw bErr;

      return [...(featured || []), ...(backfill || [])].slice(0, 3) as PublicProperty[];
    },
  });

  const fallback = [
    {
      id: "fallback-1",
      title: "4-Bedroom Terrace in Lekki Phase 1",
      slug: null,
      city: "Lagos",
      area: "Lekki",
      asking_price_ngn: 180000000,
      risk_rating: "medium",
      property_type: "Terrace",
      description: "Secure estate, strong rental demand, serviced",
      property_media: [{ file_url: property1, file_type: "image", sort_order: 0 }],
    },
    {
      id: "fallback-2",
      title: "Luxury Apartment in Ikoyi",
      slug: null,
      city: "Lagos",
      area: "Ikoyi",
      asking_price_ngn: 320000000,
      risk_rating: "low",
      property_type: "Apartment",
      description: "High-floor unit, city and water views",
      property_media: [{ file_url: property2, file_type: "image", sort_order: 0 }],
    },
    {
      id: "fallback-3",
      title: "Serviced Apartments in Abuja",
      slug: null,
      city: "Abuja",
      area: "Maitama",
      asking_price_ngn: 95000000,
      risk_rating: "medium",
      property_type: "Apartment",
      description: "Ideal for corporate lets and Airbnb",
      property_media: [{ file_url: property3, file_type: "image", sort_order: 0 }],
    },
  ] satisfies PublicProperty[];

  const properties = (listings && listings.length > 0 ? listings : fallback).map((p) => {
    const media = (p.property_media || [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const coverImage = media.find((m) => m.file_type === "image")?.file_url || property1;
    const location = p.area ? `${p.area}, ${p.city}` : p.city;
    return {
      ...p,
      location,
      coverImage,
      tag: p.property_type || "Listed",
    };
  });

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Selected Properties
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A focused selection of properties we are comfortable standing
            behind. Each listing comes with clear documentation, transparent
            pricing, and support from a senior consultant.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12">
          {properties.map((property) => (
            <article
              key={property.id}
              className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.coverImage}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex gap-2">
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-[10px] sm:text-xs">
                    {property.tag}
                  </Badge>
                </div>
                {/* Title Verification Badge */}
                (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-green-500/90 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1 text-[10px] sm:text-xs font-medium cursor-help">
                        <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">Verified</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Title Verified
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Documentation reviewed by our team before listing.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                  <MapPin size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{property.location}</span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                  {property.description || `${property.property_type} in ${property.location}.`}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base sm:text-xl font-semibold text-primary">
                    {formatPrice(property.asking_price_ngn)}
                  </span>
                  <Button variant="outline" size="sm" className="text-xs px-2 sm:px-3" asChild>
                    <Link to={`/properties/${property.slug || property.id}`}>
                      <span className="hidden sm:inline">View & ROI</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight size={12} className="ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="lg" asChild>
            <Link to="/properties">
              See All Properties
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
