import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    image: property1,
    tag: "EXCLUSIVE",
    title: "The Meridian Penthouse",
    location: "Banana Island, Lagos",
    price: "₦1.2B",
    beds: 5,
    baths: 6,
    sqm: 850,
    roi: "18%",
  },
  {
    id: 2,
    image: property2,
    tag: "NEW LISTING",
    title: "Azure Waterfront Villa",
    location: "Eko Atlantic, Lagos",
    price: "₦680M",
    beds: 4,
    baths: 5,
    sqm: 620,
    roi: "15%",
  },
  {
    id: 3,
    image: property3,
    tag: "PRIME LOCATION",
    title: "The Crown Residences",
    location: "Maitama, Abuja",
    price: "₦450M",
    beds: 4,
    baths: 4,
    sqm: 480,
    roi: "22%",
  },
];

export function ElitePropertyCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % properties.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

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
                    <p className="text-2xl font-display font-bold text-primary">{currentProperty.beds}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Beds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-primary">{currentProperty.baths}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Baths</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-primary">{currentProperty.sqm}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SQM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-gold">{currentProperty.roi}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. ROI</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-6">
                  <Button 
                    size="lg" 
                    className="bg-navy hover:bg-navy/90 text-white px-8 py-6"
                    asChild
                  >
                    <Link to="/properties">
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
