import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/components/currency/CurrencySwitcher";

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
  risk_rating: "low" | "medium" | "high";
  property_type: string;
  property_media?: PropertyMedia[] | null;
};


export function ElitePropertyCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { formatPrice } = useCurrency();

  const { data: listings } = useQuery({
    queryKey: ["public-properties", "home-carousel"],
    queryFn: async () => {
      // Featured first, then latest listed
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, slug, city, area, asking_price_ngn, risk_rating, property_type, is_featured, property_media(file_url, file_type, sort_order)",
        )
        .eq("status", "listed")
        .order("is_featured", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as PublicProperty[];
    },
  });

  const dynamicProperties = (listings || []).map((p) => {
    const media = (p.property_media || [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const coverImage = media.find((m) => m.file_type === "image")?.file_url || "/placeholder.svg";
    const location = p.area ? `${p.area}, ${p.city}` : p.city;
    const href = `/properties/${p.slug || p.id}`;
    return {
      id: p.id,
      image: coverImage,
      tag: p.property_type?.toUpperCase() || "LISTED",
      title: p.title,
      location,
      price: formatPrice(p.asking_price_ngn),
      meta1: p.property_type,
      meta2: `${p.risk_rating} risk`,
      meta3: p.city,
      meta4: "Listed",
      href,
    };
  });

  const properties = dynamicProperties;
  if (properties.length === 0) return null;
  const totalSlides = properties.length;

  useEffect(() => {
    if (currentIndex >= totalSlides) setCurrentIndex(0);
  }, [currentIndex, totalSlides]);

  const nextSlide = useCallback(() => {
    if (isAnimating || totalSlides <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, totalSlides]);

  const prevSlide = useCallback(() => {
    if (isAnimating || totalSlides <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, totalSlides]);

  const currentProperty = properties[currentIndex];

  return (
    <section className="py-20 md:py-28 bg-cream/30">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3 block">
              The Collection
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
              Selected Properties
            </h2>
          </div>
          <Link 
            to="/properties" 
            className="group inline-flex items-center gap-2 text-primary font-medium hover:text-gold transition-colors"
          >
            <span className="border-b border-primary group-hover:border-gold transition-colors">
              View Full Inventory
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Main Image */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-2xl aspect-[4/3] lg:aspect-[16/10]">
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    index === currentIndex
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  }`}
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Tag */}
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-navy/90 backdrop-blur-sm text-white text-xs font-bold tracking-wider rounded">
                      {property.tag}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-6 right-6">
                    <span className="px-5 py-3 bg-white/95 backdrop-blur-sm text-navy font-display text-2xl font-bold rounded-lg shadow-lg">
                      {property.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Property Details */}
            <div className="lg:col-span-5 space-y-6">
              <div
                key={currentProperty.id}
                className={`transition-all duration-500 ${
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                }`}
              >
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3">
                  {currentProperty.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>{currentProperty.location}</span>
                </div>

                {/* Property Stats */}
                 <div className="grid grid-cols-4 gap-4 py-6 border-y border-border">
                  <div className="text-center">
                     <p className="text-sm font-display font-bold text-primary line-clamp-1">
                       {currentProperty.meta1}
                     </p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Type</p>
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-display font-bold text-primary line-clamp-1">
                       {currentProperty.meta2}
                     </p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk</p>
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-display font-bold text-primary line-clamp-1">
                       {currentProperty.meta3}
                     </p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">City</p>
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-display font-bold text-gold line-clamp-1">
                       {currentProperty.meta4}
                     </p>
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-6">
                  <Button 
                    size="lg" 
                    className="bg-navy hover:bg-navy/90 text-white px-8 py-6"
                    asChild
                  >
                    <Link to={currentProperty.href}>
                      View Property Details
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                   {properties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentIndex
                          ? "w-10 h-2 bg-gold"
                          : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    disabled={isAnimating}
                    className="w-12 h-12 rounded-full border-2 border-border hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={isAnimating}
                    className="w-12 h-12 rounded-full bg-gold hover:bg-gold-light flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5 text-navy" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
