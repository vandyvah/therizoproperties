import { Link } from "react-router-dom";
import { ArrowRight, Calculator, ChevronLeft, ChevronRight, Star, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-lagos.jpg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const slides = [
  {
    image: heroImage,
    category: "LUXURY COLLECTION",
    title: "Exclusive Waterfront Living",
    location: "Banana Island, Lagos",
    price: "₦850M",
    tag: "Premium"
  },
  {
    image: property1,
    category: "HIGH CLASS ESTATES",
    title: "Penthouse Excellence",
    location: "Eko Atlantic, Lagos",
    price: "₦650M",
    tag: "Elite"
  },
  {
    image: property2,
    category: "SMART INVESTMENTS",
    title: "Prime Location Apartments",
    location: "Maitama, Abuja",
    price: "₦180M",
    tag: "Affordable"
  },
  {
    image: property3,
    category: "DEVELOPMENT PROJECTS",
    title: "New Build Opportunities",
    location: "Lekki Phase 1, Lagos",
    price: "₦95M",
    tag: "Value"
  }
];

const consultants = [
  { name: "Bayo Adeyemi", role: "Lagos Island Specialist", initials: "BA" },
  { name: "Aisha Mohammed", role: "Abuja Expert", initials: "AM" },
  { name: "Kelly Okonkwo", role: "Luxury Properties", initials: "KO" },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-out ${
            index === currentSlide 
              ? "opacity-100 scale-100" 
              : "opacity-0 scale-105"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer Gradient Overlay for Glossy Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-navy/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />
        </div>
      ))}

      {/* Glossy Overlay Pattern */}
      <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)`,
          backgroundSize: '200% 200%',
          animation: 'shimmer 8s infinite'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container-wide pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Elite Badge */}
            <div className="inline-flex items-center gap-3 animate-fade-up">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-gold/30 to-gold/10 backdrop-blur-md border border-gold/30">
                <span className="text-gold text-sm font-semibold tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 fill-gold" />
                  ELITE REAL ESTATE
                </span>
              </div>
              <div className="px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-white/90 text-xs font-medium">Est. 2020</span>
              </div>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span className="block">Therizo</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">
                Property & Dev
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Nigeria's premier boutique real estate firm. Curated luxury properties, 
              verified titles, and disciplined returns for discerning investors.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 py-4 animate-fade-up" style={{ animationDelay: "0.25s" }}>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gold">₦50B+</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">Portfolio Value</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gold">150+</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">Properties Sold</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-gold">98%</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">Client Satisfaction</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-gold to-gold-light text-navy font-semibold px-8 py-6 text-base hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to="/properties">
                  Explore Properties
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-6 text-base hover:bg-white/20 hover:border-gold/50 transition-all duration-300"
                asChild
              >
                <Link to="/calculator">
                  <Calculator className="mr-2" size={18} />
                  ROI Calculator
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 animate-fade-up" style={{ animationDelay: "0.35s" }}>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Shield className="w-4 h-4 text-gold" />
                <span>Verified Titles</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Award className="w-4 h-4 text-gold" />
                <span>Award Winning</span>
              </div>
            </div>
          </div>

          {/* Right Side - Property Card */}
          <div className="relative animate-fade-up lg:pl-8" style={{ animationDelay: "0.4s" }}>
            {/* Glassmorphism Property Card */}
            <div className={`relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              {/* Property Image */}
              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Property Tag */}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    slides[currentSlide].tag === 'Premium' ? 'bg-gold text-navy' :
                    slides[currentSlide].tag === 'Elite' ? 'bg-white text-navy' :
                    slides[currentSlide].tag === 'Affordable' ? 'bg-emerald-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {slides[currentSlide].tag}
                  </span>
                </div>

                {/* Price */}
                <div className="absolute bottom-4 right-4">
                  <span className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white font-display text-xl font-bold">
                    {slides[currentSlide].price}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-2">
                <p className="text-gold text-xs font-semibold uppercase tracking-widest">
                  {slides[currentSlide].category}
                </p>
                <h3 className="text-white font-display text-2xl font-semibold">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-white/60 text-sm">
                  {slides[currentSlide].location}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'w-8 bg-gold' 
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-gold hover:bg-gold-light flex items-center justify-center text-navy transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Consultants Card */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/50 max-w-xs animate-fade-up hidden lg:block" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs font-semibold text-navy/60 uppercase tracking-wider mb-3">Our Expert Consultants</p>
              <div className="flex -space-x-3">
                {consultants.map((consultant, index) => (
                  <div 
                    key={index}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-white text-sm font-bold border-3 border-white shadow-lg"
                    title={`${consultant.name} - ${consultant.role}`}
                  >
                    {consultant.initials}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-navy text-xs font-bold border-3 border-white shadow-lg">
                  +5
                </div>
              </div>
              <p className="text-xs text-navy/70 mt-2">8 specialists across Nigeria</p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 right-1/4 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Bottom Property Categories */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-navy/90 to-transparent">
        <div className="container-wide py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Luxury Homes", count: "45+", icon: "🏰" },
              { label: "Affordable", count: "80+", icon: "🏠" },
              { label: "Commercial", count: "25+", icon: "🏢" },
              { label: "Land Deals", count: "30+", icon: "🌍" },
            ].map((category, index) => (
              <Link
                key={index}
                to="/properties"
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-gold/30 hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-gold transition-colors">{category.label}</p>
                  <p className="text-white/50 text-xs">{category.count} properties</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
