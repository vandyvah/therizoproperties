import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Building } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const properties = [
  {
    id: 1,
    title: "4-Bedroom Terrace in Lekki Phase 1",
    location: "Lekki, Lagos",
    description:
      "Secure estate, strong rental demand, serviced. Modern finishing with spacious rooms and dedicated parking. Ideal for families or long-term rental investment.",
    tag: "Exclusive Listing",
    image: property1,
    price: "₦180,000,000",
    beds: 4,
    baths: 5,
    sqm: 320,
  },
  {
    id: 2,
    title: "Luxury Apartment in Ikoyi",
    location: "Ikoyi, Lagos",
    description:
      "High-floor unit with panoramic city and water views. Premium finishing, smart home features, and access to world-class amenities including pool, gym, and concierge.",
    tag: "New",
    image: property2,
    price: "₦320,000,000",
    beds: 3,
    baths: 4,
    sqm: 250,
  },
  {
    id: 3,
    title: "Serviced Apartments in Abuja",
    location: "Maitama, Abuja",
    description:
      "Ideal for corporate lets and Airbnb. Fully furnished units in a secure development with 24/7 power, security, and maintenance. Strong corporate tenant demand.",
    tag: "Developer Direct",
    image: property3,
    price: "₦95,000,000",
    beds: 2,
    baths: 2,
    sqm: 120,
  },
  {
    id: 4,
    title: "Waterfront Penthouse in Victoria Island",
    location: "Victoria Island, Lagos",
    description:
      "Ultra-luxury penthouse with private terrace, unobstructed ocean views, and premium smart home integration. Boutique development with only 8 units.",
    tag: "Premium",
    image: property2,
    price: "₦650,000,000",
    beds: 4,
    baths: 5,
    sqm: 450,
  },
  {
    id: 5,
    title: "Smart Home in Ajah",
    location: "Ajah, Lagos",
    description:
      "Contemporary 5-bedroom detached house with full smart home automation. Large compound, BQ, and excellent access to major roads.",
    tag: "New Development",
    image: property1,
    price: "₦120,000,000",
    beds: 5,
    baths: 6,
    sqm: 400,
  },
  {
    id: 6,
    title: "Investment Flats in Wuse",
    location: "Wuse 2, Abuja",
    description:
      "Block of 6 units perfect for rental income. Established location with steady demand from diplomats and executives. Clean documentation.",
    tag: "Investment",
    image: property3,
    price: "₦280,000,000",
    beds: 12,
    baths: 12,
    sqm: 600,
  },
];

const Properties = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                <Building className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Our Portfolio</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Selected Properties
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              A focused selection of properties we are comfortable standing
              behind. Each listing comes with clear documentation, transparent
              pricing, and support from a senior consultant.
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <article
                key={property.id}
                className="group bg-warm-white rounded-sm overflow-hidden border border-sand hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-gold text-navy hover:bg-gold-dark">
                    {property.tag}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-sm text-slate mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate mb-4 pb-4 border-b border-sand">
                    <span>{property.beds} Beds</span>
                    <span>{property.baths} Baths</span>
                    <span>{property.sqm} sqm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-semibold text-navy">
                      {property.price}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/calculator`}>
                        View & ROI
                        <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
            Looking for Something Specific?
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Tell us your requirements and budget. We can source properties that
            match your criteria and meet our documentation standards.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/contact">
              Speak with a Consultant
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
