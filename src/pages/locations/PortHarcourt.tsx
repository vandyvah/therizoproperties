import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createBreadcrumbSchema } from "@/components/seo/JsonLd";
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
  Fuel
} from "lucide-react";

const phNeighborhoods = [
  { name: "GRA Phase 1 & 2", type: "Premium Residential", growth: "8-12% annually" },
  { name: "Old GRA", type: "Established Premium", growth: "6-10% annually" },
  { name: "Trans Amadi", type: "Commercial/Industrial", growth: "10-14% annually" },
  { name: "Rukpokwu", type: "Emerging Growth", growth: "12-18% annually" },
  { name: "Eliozu", type: "Mid-Market Residential", growth: "10-15% annually" },
  { name: "Ada George", type: "Commercial Hub", growth: "8-12% annually" },
];

const phStats = [
  { icon: Building2, value: "₦80M+", label: "Average Property Value" },
  { icon: TrendingUp, value: "8-14%", label: "Annual Appreciation" },
  { icon: Fuel, value: "Oil & Gas", label: "Economic Base" },
  { icon: Users, value: "1.8M+", label: "Population" },
];

const phFAQs = [
  {
    question: "What are the best areas to invest in Port Harcourt real estate?",
    answer: "Top Port Harcourt investment areas include GRA Phase 1 & 2 for premium residential, Trans Amadi for commercial/mixed use, and emerging areas like Rukpokwu and Eliozu for growth potential. GRA offers established infrastructure while newer areas provide higher appreciation."
  },
  {
    question: "How much does property cost in Port Harcourt Nigeria?",
    answer: "Port Harcourt property prices range from ₦30M-₦80M in emerging areas like Rukpokwu, ₦80M-₦200M in GRA zones, and ₦150M+ for premium commercial properties in Trans Amadi. Oil industry presence supports strong rental demand."
  },
  {
    question: "Is Port Harcourt a good place to invest in property?",
    answer: "Port Harcourt offers solid investment potential driven by Nigeria's oil and gas industry. The city has consistent expat rental demand, growing middle class, and less competition than Lagos. Property values have remained stable even during oil price fluctuations."
  },
  {
    question: "What rental yields can I expect from Port Harcourt properties?",
    answer: "Port Harcourt rental yields average 7-10% for residential properties, with oil company housing in GRA achieving 10-12%. Commercial properties in Trans Amadi can achieve 12-15% yields due to industrial demand."
  },
  {
    question: "How do I verify property titles in Port Harcourt?",
    answer: "Port Harcourt uses Rivers State C of O system. Therizo verifies all titles including C of O, Governor's Consent, survey plans, and checks with the Rivers State Geographic Information System (RIVGIS) before any purchase."
  }
];

export default function PortHarcourt() {
  const phSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Therizo Port Harcourt",
    "description": "Premium Port Harcourt real estate services - property investment, verified titles, and professional property management in GRA, Trans Amadi and across Rivers State.",
    "url": "https://therizoproperties.com/locations/port-harcourt",
    "telephone": "+234-803-483-0087",
    "email": "portharcourt@therizoproperties.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Port Harcourt",
      "addressRegion": "Rivers State",
      "addressCountry": "NG"
    },
    "areaServed": {
      "@type": "City",
      "name": "Port Harcourt",
      "containedInPlace": {
        "@type": "Country",
        "name": "Nigeria"
      }
    },
    "priceRange": "₦₦",
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
        title="Port Harcourt Real Estate | Property Investment in GRA & Trans Amadi"
        description="Invest in Port Harcourt property with verified titles. Premium real estate in GRA, Trans Amadi, and Rivers State growth areas. Oil & gas industry rental demand. Expert guidance."
        canonical="/locations/port-harcourt"
        ogImage="https://therizoproperties.com/og/og-port-harcourt.jpg"
        keywords={[
          "Port Harcourt real estate",
          "Port Harcourt property investment",
          "GRA Port Harcourt property",
          "Trans Amadi real estate",
          "Rivers State property",
          "Port Harcourt property prices",
          "buy property in Port Harcourt",
          "Nigerian oil city real estate",
          "Port Harcourt rental property"
        ]}
      />
      <JsonLd data={phSchema} />

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
              { label: "Port Harcourt" }
            ]}
          />
          
          <div className="max-w-3xl mt-8">
            <div className="flex items-center gap-2 text-gold mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Port Harcourt, Rivers State</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Port Harcourt Real Estate Investment
            </h1>
            
            <p className="text-lg md:text-xl text-ivory/80 mb-8 leading-relaxed">
              Nigeria's oil capital and the heart of the Niger Delta economy. 
              Invest in verified Port Harcourt properties with strong rental 
              demand from the energy sector and growing local market.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
                <Link to="/properties?city=Port Harcourt">
                  View Port Harcourt Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                <Link to="/contact">
                  Speak to PH Expert
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
            {phStats.map((stat) => (
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

      {/* Why Port Harcourt Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Why Invest in Port Harcourt Property?
            </h2>
            <p className="text-muted-foreground text-lg">
              Nigeria's oil and gas hub drives consistent demand for quality housing 
              and commercial spaces, creating reliable investment returns.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Fuel className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Oil & Gas Economy</h3>
                <p className="text-muted-foreground">
                  Major oil companies and contractors create consistent demand 
                  for premium housing and commercial properties.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Home className="h-10 w-10 text-terracotta mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Strong Rental Demand</h3>
                <p className="text-muted-foreground">
                  Expat workers and oil industry professionals ensure high 
                  occupancy rates and premium rental income.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Lower Entry Points</h3>
                <p className="text-muted-foreground">
                  Compared to Lagos, Port Harcourt offers lower entry prices 
                  with comparable or better rental yields.
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
              Port Harcourt Investment Neighborhoods
            </h2>
            <p className="text-muted-foreground text-lg">
              From established GRA zones to emerging corridors, 
              find the right Port Harcourt location for your investment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phNeighborhoods.map((area) => (
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
        title="Port Harcourt Real Estate FAQs"
        subtitle="Common questions about investing in Port Harcourt property"
        faqs={phFAQs}
      />

      {/* CTA Section */}
      <section className="section-padding bg-charcoal text-ivory">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Ready to Invest in Port Harcourt?
          </h2>
          <p className="text-ivory/70 text-lg mb-8 max-w-2xl mx-auto">
            Our Port Harcourt property experts will help you find verified properties 
            matching your investment goals and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
              <Link to="/properties?city=Port Harcourt">
                Browse Port Harcourt Properties
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
