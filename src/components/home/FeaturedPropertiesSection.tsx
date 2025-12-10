import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    price: "₦180,000,000",
  },
  {
    id: 2,
    title: "Luxury Apartment in Ikoyi",
    location: "Ikoyi, Lagos",
    description: "High-floor unit, city and water views",
    tag: "New",
    image: property2,
    price: "₦320,000,000",
  },
  {
    id: 3,
    title: "Serviced Apartments in Abuja",
    location: "Maitama, Abuja",
    description: "Ideal for corporate lets and Airbnb",
    tag: "Developer Direct",
    image: property3,
    price: "₦95,000,000",
  },
];

export function FeaturedPropertiesSection() {
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
              className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-therizo-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-gold text-foreground hover:bg-gold-light">
                  {property.tag}
                </Badge>
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
                    {property.price}
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
