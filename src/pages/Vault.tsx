import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2,
  Crown,
  KeyRound,
  ArrowRight
} from "lucide-react";

interface VaultProperty {
  id: string;
  title: string;
  city: string;
  area: string | null;
  asking_price_ngn: number;
  property_type: string;
  description: string | null;
}

// Off-market opportunities are surfaced privately by consultants — no demo/stock data here.
const exclusiveProperties: Array<{
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  tag: string;
  image: string;
  verified: boolean;
}> = [];

export default function Vault() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);

  // If not logged in, show the locked state
  if (!user) {
    return (
      <Layout>
        <SEOHead title="The Vault | Private Access" description="Exclusive off-market properties" noindex={true} />
        {/* Hero - Locked State */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light" />
          
          {/* Content */}
          <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Lock className="h-4 w-4" />
              Private Access Required
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl text-ivory font-semibold mb-6">
              The Vault
            </h1>
            
            <p className="text-ivory/80 text-lg md:text-xl mb-8 leading-relaxed">
              Exclusive off-market properties reserved for verified clients. 
              These opportunities never appear on public listings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="gold"
                size="lg"
                className="gap-2"
                onClick={() => navigate("/dashboard/auth")}
              >
                <KeyRound className="h-5 w-5" />
                Request Access
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-ivory/30 text-ivory hover:bg-ivory/10"
                onClick={() => navigate("/contact")}
              >
                Speak with Consultant
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-ivory/60 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>NDA Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span>Verified Buyers Only</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Confidential Transactions</span>
              </div>
            </div>
          </div>
        </section>

        {/* Blurred Preview */}
        <section className="section-padding bg-muted">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl text-ink font-semibold mb-4">
                What's Inside The Vault
              </h2>
              <p className="text-slate max-w-2xl mx-auto">
                A glimpse of what awaits verified clients
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {exclusiveProperties.map((property) => (
                <Card
                  key={property.id}
                  className="overflow-hidden group relative"
                >
                  <div className="relative h-64">
                    <img
                      src={property.image}
                      alt="Exclusive property"
                      className="w-full h-full object-cover blur-md"
                    />
                    <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                      <Lock className="h-12 w-12 text-ivory/80" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Logged in - show the vault
  return (
    <Layout>
      <SEOHead title="The Vault | Private Access" description="Exclusive off-market properties" noindex={true} />
      {/* Hero - Unlocked State */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-light" />
        
        
        <div className="relative z-10 container-wide">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <Badge variant="outline" className="border-accent text-accent">
              Private Access Granted
            </Badge>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory font-semibold mb-4">
            The Vault
          </h1>
          
          <p className="text-ivory/80 text-lg md:text-xl max-w-2xl mb-8">
            Exclusive off-market opportunities. These properties are available only to verified clients 
            and are not listed publicly.
          </p>

          <div className="flex items-center gap-4">
            <Button
              variant={isRevealed ? "outline" : "gold"}
              onClick={() => setIsRevealed(!isRevealed)}
              className={isRevealed ? "bg-transparent border-ivory/30 text-ivory" : ""}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Reveal Properties
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exclusiveProperties.map((property, index) => (
              <Card
                key={property.id}
                className="overflow-hidden group hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-72">
                  <img
                    src={property.image}
                    alt={isRevealed ? property.title : "Exclusive property"}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isRevealed ? "" : "blur-sm"
                    }`}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-accent text-accent-foreground">
                      {property.tag}
                    </Badge>
                    {property.verified && (
                      <Badge variant="secondary" className="bg-green-500/90 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start gap-2 text-slate text-sm mb-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{isRevealed ? property.location : "••••••••, Lagos"}</span>
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold text-ink mb-3">
                    {isRevealed ? property.title : "Exclusive Property"}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-slate text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.baths}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-4 w-4" />
                      {property.sqm} sqm
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="font-display text-2xl font-semibold text-accent">
                      {isRevealed ? property.price : "•••"}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/contact?type=vault-inquiry">
                        Inquire
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Card className="inline-block p-8 bg-navy text-ivory">
              <h3 className="font-display text-2xl font-semibold mb-2">
                Interested in These Properties?
              </h3>
              <p className="text-ivory/80 mb-6">
                Schedule a confidential consultation with our team
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/contact">
                  Book Private Consultation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
