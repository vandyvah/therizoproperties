import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const standards = [
  "Ownership and title checks",
  "Basic legal and regulatory review",
  "Market sanity checks on price and rental potential",
  "Internal risk assessment",
];

export function OurStandardSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative bg-card rounded-2xl p-8 md:p-10 shadow-therizo-md border border-border">
              <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                Every property goes through:
              </h3>
              <ul className="space-y-4">
                {standards.map((standard) => (
                  <li
                    key={standard}
                    className="flex items-start gap-4 text-foreground"
                  >
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={14} className="text-gold" />
                    </div>
                    <span>{standard}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  We would rather walk away from a deal than push something we
                  do not trust.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Our Standard: No Shortcuts
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We operate with a simple rule: if we cannot explain a deal in
              plain language and defend it on paper, we will not touch it.
            </p>
            <Button variant="default" size="lg" asChild>
              <Link to="/our-standard">
                Learn About Our Process
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
