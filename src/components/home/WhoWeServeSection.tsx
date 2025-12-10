import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Globe, Building2, MapPin } from "lucide-react";

const audiences = [
  {
    icon: Users,
    title: "High-Net-Worth Buyers",
    description: "Families seeking quality homes with verified documentation",
  },
  {
    icon: Globe,
    title: "Diaspora Investors",
    description: "Trusted local execution for international clients",
  },
  {
    icon: Building2,
    title: "Developers",
    description: "Disciplined sales partners for quality projects",
  },
  {
    icon: MapPin,
    title: "Landowners",
    description: "Joint-venture development opportunities",
  },
];

export function WhoWeServeSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Who We Serve
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Therizo works with clients who want more than glossy photos and
            empty promises. If you care about title, numbers, and long-term
            value, we are built for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="group p-6 bg-card rounded-lg border border-border hover:border-gold/50 hover:shadow-therizo-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <item.icon className="text-gold" size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="default" size="lg" asChild>
            <Link to="/contact">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
