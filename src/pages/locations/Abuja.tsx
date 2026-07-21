import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { CaseStudies, type CaseStudy } from "@/components/locations/CaseStudies";
import { InvestComboCards } from "@/components/locations/InvestComboCards";

const abujaCaseStudies: CaseStudy[] = [
  {
    neighborhood: "Maitama",
    assetType: "5-bed detached, R of O verified at AGIS",
    closedOn: "Q1 2026",
    entryPriceNgn: "₦420M",
    currentValueNgn: "~₦470M",
    grossYieldPct: "5.4% (diplomatic lease)",
    outcome: "Diaspora family office (UAE). Leased to embassy tenant on 2-year lease within 8 weeks of closing.",
  },
  {
    neighborhood: "Jabi",
    assetType: "3-bed apartment, Certificate of Occupancy",
    closedOn: "Q3 2025",
    entryPriceNgn: "₦95M",
    currentValueNgn: "~₦112M",
    grossYieldPct: "7.5% (long-let)",
    outcome: "Diaspora investor (UK). Fully managed; net rent remitted quarterly in USD equivalent.",
  },
  {
    neighborhood: "Lugbe",
    assetType: "Serviced land, 800sqm, R of O",
    closedOn: "Q2 2026",
    entryPriceNgn: "₦38M",
    currentValueNgn: "~₦46M",
    grossYieldPct: "n/a (land bank)",
    outcome: "First-time buyer (Nigeria). Boundary walled and titled within 90 days as a hold-and-develop play.",
  },
];
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
  Landmark
} from "lucide-react";

const abujaNeighborhoods = [
  { name: "Maitama", type: "Premium Diplomatic Zone", growth: "10-14% annually" },
  { name: "Asokoro", type: "Ultra-Premium Residential", growth: "8-12% annually" },
  { name: "Wuse 2", type: "Commercial/Residential Hub", growth: "10-15% annually" },
  { name: "Jabi", type: "Growing Middle-Class", growth: "12-16% annually" },
  { name: "Gwarinpa", type: "Large Estate Living", growth: "8-12% annually" },
  { name: "Lugbe/Life Camp", type: "Emerging Corridor", growth: "15-20% annually" },
];

const abujaStats = [
  { icon: Building2, value: "₦120M+", label: "Average Property Value" },
  { icon: TrendingUp, value: "10-15%", label: "Annual Appreciation" },
  { icon: Landmark, value: "Capital", label: "Federal Capital Territory" },
  { icon: Users, value: "3.5M+", label: "Population" },
];

const abujaFAQs = [
  {
    question: "What are the best areas to invest in Abuja real estate?",
    answer: "Top Abuja investment areas include Maitama and Asokoro for premium properties, Wuse 2 for mixed-use investments, and emerging areas like Jabi and Life Camp for growth potential. Maitama offers diplomatic zone premium while Gwarinpa provides affordable estate living."
  },
  {
    question: "How much does property cost in Abuja Nigeria?",
    answer: "Abuja property prices range from ₦50M-₦150M in areas like Jabi and Gwarinpa, ₦150M-₦400M in Wuse 2, and ₦300M+ in premium zones like Maitama and Asokoro. Commercial properties in the Central Business District command higher premiums."
  },
  {
    question: "Is Abuja a good place to invest in property?",
    answer: "Abuja offers stable property investment with 10-15% annual appreciation. As Nigeria's capital, it benefits from consistent government activity, diplomatic presence, and organized urban planning. The FCT land administration also provides clearer title processes."
  },
  {
    question: "What is the title system in Abuja?",
    answer: "Abuja uses the Right of Occupancy (R of O) system administered by the FCT. This differs from Lagos C of O. Therizo verifies all Abuja titles including R of O, building approvals, and estate documentation before any transaction."
  },
  {
    question: "What rental yields can I expect from Abuja properties?",
    answer: "Abuja rental yields average 6-9% for residential properties, with diplomatic zone properties in Maitama achieving 8-10%. Short-term rentals for business travelers can achieve 12-15% yields in well-located properties."
  }
];

export default function Abuja() {
  const abujaSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Therizo Abuja",
    "description": "Premium Abuja real estate services - property investment, verified titles, and professional property management in Maitama, Asokoro, Wuse and across FCT.",
    "url": "https://therizoproperties.com/locations/abuja",
    "telephone": "+234-803-483-0087",
    "email": "abuja@therizoproperties.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Abuja",
      "addressRegion": "FCT",
      "addressCountry": "NG"
    },
    "areaServed": {
      "@type": "City",
      "name": "Abuja",
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
        title="Abuja Real Estate | Property Investment in Maitama, Asokoro & Wuse"
        description="Invest in Abuja property with verified titles and stable returns. Premium real estate in Maitama, Asokoro, Wuse 2, and FCT growth corridors. Expert guidance for investors."
        canonical="/locations/abuja"
        ogImage="https://therizoproperties.com/og/og-abuja.jpg"
        keywords={[
          "Abuja real estate",
          "Abuja property investment",
          "Maitama property for sale",
          "Asokoro real estate",
          "Wuse property",
          "Abuja property prices",
          "buy property in Abuja",
          "FCT real estate",
          "Nigerian real estate Abuja"
        ]}
      />
      <JsonLd data={abujaSchema} />
      <JsonLd data={createBreadcrumbSchema([
        { name: "Home", url: "https://therizoproperties.com/" },
        { name: "Locations", url: "https://therizoproperties.com/locations" },
        { name: "Abuja", url: "https://therizoproperties.com/locations/abuja" },
      ])} />

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
              { label: "Abuja" }
            ]}
          />
          
          <div className="max-w-3xl mt-8">
            <div className="flex items-center gap-2 text-gold mb-4">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Abuja, FCT Nigeria</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Abuja Real Estate Investment
            </h1>
            
            <p className="text-lg md:text-xl text-ivory/80 mb-8 leading-relaxed">
              Nigeria's planned capital city offers stable, organized property investment. 
              Invest in verified Abuja properties across Maitama, Asokoro, Wuse, and 
              emerging FCT growth corridors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
                <Link to="/properties?city=Abuja">
                  View Abuja Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                <Link to="/contact">
                  Speak to Abuja Expert
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
            {abujaStats.map((stat) => (
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

      {/* Why Abuja Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Why Invest in Abuja Property?
            </h2>
            <p className="text-muted-foreground text-lg">
              Nigeria's capital offers organized urban planning, stable governance presence, 
              and clearer land administration than other Nigerian cities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Landmark className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Capital City Stability</h3>
                <p className="text-muted-foreground">
                  As Nigeria's seat of government, Abuja enjoys consistent economic 
                  activity and diplomatic presence driving property demand.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Home className="h-10 w-10 text-terracotta mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Planned Development</h3>
                <p className="text-muted-foreground">
                  Abuja's master plan ensures organized development zones, clear 
                  land use, and predictable infrastructure expansion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Clearer Title System</h3>
                <p className="text-muted-foreground">
                  FCT land administration provides more streamlined Right of 
                  Occupancy processes compared to state land systems.
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
              Abuja Investment Neighborhoods
            </h2>
            <p className="text-muted-foreground text-lg">
              From diplomatic zone Maitama to emerging Life Camp corridor, 
              find the right Abuja location for your investment profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {abujaNeighborhoods.map((area) => (
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

      {/* Case Studies */}
      <CaseStudies city="Abuja" studies={abujaCaseStudies} />

      {/* FAQ Section */}
      <FAQSection
        title="Abuja Real Estate FAQs"
        subtitle="Common questions about investing in Abuja property"
        faqs={abujaFAQs}
      />

      {/* CTA Section */}
      <section className="section-padding bg-charcoal text-ivory">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Ready to Invest in Abuja?
          </h2>
          <p className="text-ivory/70 text-lg mb-8 max-w-2xl mx-auto">
            Our Abuja property experts will help you find verified properties 
            matching your investment goals and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-charcoal">
              <Link to="/properties?city=Abuja">
                Browse Abuja Properties
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
