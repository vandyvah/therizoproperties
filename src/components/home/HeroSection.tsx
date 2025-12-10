import { Link } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-lagos.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Lagos waterfront luxury development"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide pt-24">
        <div className="max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/20 text-gold text-sm font-medium mb-6 animate-fade-up">
            Nigerian Real Estate & Development
          </span>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Therizo Property and Development Corporation
          </h1>

          <p className="text-xl text-primary-foreground/80 leading-relaxed mb-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Curated Nigerian properties, clean titles, and disciplined returns
            for buyers and investors who take their money seriously.
          </p>

          <p className="text-base text-primary-foreground/70 leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Therizo is a boutique real estate and development firm focused on
            high-quality properties in Lagos, Abuja, and select growth
            corridors across Nigeria. We help you buy, sell, or structure deals
            with one clear standard: documented ownership, realistic numbers,
            and projects that actually get completed.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="lg" asChild>
              <Link to="/properties">
                View Selected Properties
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/calculator">
                <Calculator className="mr-2" size={18} />
                Model Your Returns
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center pt-2">
          <div className="w-1.5 h-3 bg-gold rounded-full" />
        </div>
      </div>
    </section>
  );
}
