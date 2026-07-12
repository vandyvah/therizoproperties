import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createRealEstateAgentSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  TrendingUp, 
  Shield, 
  Building2, 
  CheckCircle2,
  ArrowRight,
  Home,
  Users,
  BarChart3
} from "lucide-react";

const lagosNeighborhoods = [
  { name: "Lekki Phase 1", type: "Premium Residential", growth: "12-15% annually" },
  { name: "Victoria Island", type: "Commercial/Residential", growth: "10-14% annually" },
  { name: "Ikoyi", type: "Ultra-Premium", growth: "8-12% annually" },
  { name: "Banana Island", type: "Exclusive Estates", growth: "10-15% annually" },
  { name: "Ajah/Sangotedo", type: "Emerging Growth", growth: "15-20% annually" },
  { name: "Yaba/Surulere", type: "Mid-Market", growth: "8-12% annually" },
];

const lagosStats = [
  { icon: Building2, value: "₦150M+", label: "Average Property Value" },
  { icon: TrendingUp, value: "12-18%", label: "Annual Appreciation" },
  { icon: Users, value: "21M+", label: "Population" },
  { icon: BarChart3, value: "60%", label: "Nigeria's GDP" },
];

const lagosFAQs = [
  {
    question: "What are the best areas to invest in Lagos real estate?",
    answer: "The best areas for Lagos property investment include Lekki Phase 1, Victoria Island, Ikoyi, and emerging areas like Ajah and Sangotedo. Lekki offers strong appreciation potential, while Ikoyi provides premium rental yields. Our team can help match you with properties based on your investment goals."
  },
  {
    question: "How much does property cost in Lagos Nigeria?",
    answer: "Lagos property prices vary significantly by location. In premium areas like Ikoyi and Banana Island, properties start from ₦200M+. Lekki Phase 1 offers options from ₦80M-₦300M. Emerging areas like Ajah provide entry points from ₦40M-₦100M. We help investors find properties matching their budget and ROI expectations."
  },
  {
    question: "Is Lagos real estate a good investment for diaspora buyers?",
    answer: "Yes, Lagos real estate offers excellent returns for diaspora investors, with annual appreciation of 12-18% in prime areas. Our end-to-end service handles title verification, property management, and rental collection, making it seamless for overseas buyers to invest confidently."
  },
  {
    question: "How do I verify property titles in Lagos?",
    answer: "Title verification in Lagos involves checking the Certificate of Occupancy (C of O), Governor's Consent, survey plans, and searching the Lagos State Land Registry. Therizo handles all due diligence including physical verification, legal document review, and ownership chain confirmation before any purchase."
  },
  {
    question: "What rental yields can I expect from Lagos properties?",
    answer: "Lagos rental yields range from 5-8% for residential properties and 8-12% for commercial spaces. Short-term rentals (Airbnb) in areas like Victoria Island and Lekki can achieve 10-15% yields. We provide detailed ROI projections for every property we list."
  }
];

export default function Lagos() {
  const lagosSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Therizo Lagos",
    "description": "Premium Lagos real estate services - property investment, verified titles, and professional property management in Lekki, Victoria Island, Ikoyi and beyond.",
    "url": "https://therizoproperties.com/locations/lagos",
    "telephone": "+234-803-483-0087",
    "email": "lagos@therizoproperties.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressRegion": "Lagos State",
      "addressCountry": "NG"
    },
    "areaServed": {
      "@type": "City",
      "name": "Lagos",
      "containedInPlace": {
        "@type": "Country",
        "name": "Nigeria"
      }
    },
    "priceRange": "₦₦₦",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Lagos Real Estate | Lekki, Victoria Island & Ikoyi"
        description="Invest in Lagos property with verified titles and strong ROI. Premium real estate in Lekki, Victoria Island, Ikoyi, and emerging growth areas."
        canonical="/locations/lagos"
        ogImage="https://therizoproperties.com/og/og-lagos.jpg"
        keywords={[
          "Lagos real estate",
          "Lagos property investment",
          "Lekki property for sale",
          "Victoria Island real estate",
          "Ikoyi property",
          "Lagos property prices",
          "buy property in Lagos",
          "Lagos diaspora investment",
          "Nigerian real estate Lagos"
        ]}
      />
      <JsonLd data={lagosSchema} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-charcoal via-charcoal to-charcoal/95 text-ivory overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container-wide section-padding relative z-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Locations", href: "/properties" },
              { label: "Lagos" }
            ]}
          />
          
          <div className="max-w-3xl mt-8">
            <div className="flex items-center gap-2 text-gold mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Lagos, Nigeria</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Lagos Real Estate Investment
            </h1>
            
            <p className="text-lg md:text-xl text-ivory/80 mb-8 leading-relaxed">
              Nigeria's commercial capital and Africa's largest megacity. Invest in verified Lagos 
              properties across Lekki, Victoria Island, Ikoyi, and high-growth emerging corridors 
              with confidence and clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
                <Link to="/properties?city=Lagos">
                  View Lagos Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                <Link to="/contact">
                  Speak to Lagos Expert
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-background py-12 border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {lagosStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-terracotta" />
                <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Lagos Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Why Invest in Lagos Property?
            </h2>
            <p className="text-muted-foreground text-lg">
              Lagos drives over 60% of Nigeria's GDP and remains the premier destination 
              for property investment in West Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <TrendingUp className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Strong Appreciation</h3>
                <p className="text-muted-foreground">
                  Prime Lagos real estate appreciates 12-18% annually, outperforming 
                  most global markets and providing excellent capital growth.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Home className="h-10 w-10 text-terracotta mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Rental Demand</h3>
                <p className="text-muted-foreground">
                  With 21+ million residents and continuous urban migration, Lagos 
                  offers consistent rental demand and strong yields.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Verified Titles</h3>
                <p className="text-muted-foreground">
                  Every Therizo Lagos property undergoes rigorous due diligence 
                  including C of O verification and ownership chain confirmation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Lagos Investment Neighborhoods
            </h2>
            <p className="text-muted-foreground text-lg">
              From ultra-premium Ikoyi estates to high-growth Lekki corridors, 
              find the right Lagos location for your investment profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lagosNeighborhoods.map((area) => (
              <Card key={area.name} className="bg-card border-border hover:border-gold/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold">{area.name}</h3>
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{area.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth:</span>
                      <span className="font-medium text-green-600">{area.growth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Lagos Real Estate FAQs"
        subtitle="Common questions about investing in Lagos property"
        faqs={lagosFAQs}
      />

      {/* CTA Section */}
      <section className="section-padding bg-charcoal text-ivory">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Ready to Invest in Lagos?
          </h2>
          <p className="text-ivory/70 text-lg mb-8 max-w-2xl mx-auto">
            Our Lagos property experts will help you find verified properties 
            matching your investment goals and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
              <Link to="/properties?city=Lagos">
                Browse Lagos Properties
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
              <Link to="/calculator">
                Calculate Your ROI
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
