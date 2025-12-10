import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export function CTASection() {
  return (
    <section className="section-padding bg-cream-dark">
      <div className="container-narrow text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
          Ready to Talk About a Real Property?
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
          Tell us where you are in your journey and the kind of property you are
          looking for. A senior consultant will review your request and get in
          touch to discuss options that fit your profile.
        </p>
        <Button variant="gold" size="xl" asChild>
          <Link to="/contact">
            <Phone size={20} className="mr-2" />
            Book a Call with Therizo
          </Link>
        </Button>
      </div>
    </section>
  );
}
