import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/currency/CurrencySwitcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    title: "4-Bedroom Terrace in Lekki Phase 1",
    location: "Lekki, Lagos",
    description: "Secure estate, strong rental demand, serviced",
    tag: "Exclusive Listing",
    image: property1,
    priceNGN: 180000000,
    verified: true,
    verifiedDate: "Oct 12, 2024",
  },
  {
    id: 2,
    title: "Luxury Apartment in Ikoyi",
    location: "Ikoyi, Lagos",
    description: "High-floor unit, city and water views",
    tag: "New",
    image: property2,
    priceNGN: 320000000,
    verified: true,
    verifiedDate: "Nov 5, 2024",
  },
  {
    id: 3,
    title: "Serviced Apartments in Abuja",
    location: "Maitama, Abuja",
    description: "Ideal for corporate lets and Airbnb",
    tag: "Developer Direct",
    image: property3,
    priceNGN: 95000000,
    verified: true,
    verifiedDate: "Dec 1, 2024",
  },
];

export function FeaturedPropertiesSection() {
  const { formatPrice } = useCurrency();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <article
              key={property.id}
              className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {property.tag}
                  </Badge>
                </div>
                {/* Title Verification Badge */}
                {property.verified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute top-4 right-4 bg-green-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium cursor-help">
                        <Shield className="h-3.5 w-3.5" />
                        Verified
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Title Verified
                        </p>
                        <p className="text-xs text-muted-foreground">
                          C of O verified by our legal team on {property.verifiedDate}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin size={14} />
                  <span>{property.location}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {property.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-primary">
                    {formatPrice(property.priceNGN)}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/calculator`}>
                      View Details & ROI
                      <ArrowRight size={14} className="ml-1" />
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
