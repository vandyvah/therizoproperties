import { Link } from "react-router-dom";
import { Calculator, TrendingUp, Clock, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const metrics = [
  { icon: TrendingUp, label: "Total capital at risk" },
  { icon: Calculator, label: "Net annual income" },
  { icon: Percent, label: "Cash-on-cash return" },
  { icon: Clock, label: "Estimated payback period" },
];

export function ROITeaserSection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">
              Run the Numbers Before You Buy
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed mb-8">
              Property decisions should not be based on vibes. Use the Therizo
              ROI Calculator to model your potential returns in Nigerian Naira
              (₦) for both long-term tenants and Airbnb.
            </p>
            <p className="text-primary-foreground/70 mb-8">
              In a few seconds, you can see:
            </p>
            <ul className="grid grid-cols-2 gap-4 mb-10">
              {metrics.map((metric) => (
                <li
                  key={metric.label}
                  className="flex items-center gap-3 text-primary-foreground/90"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
                    <metric.icon size={20} className="text-gold" />
                  </div>
                  <span className="text-sm">{metric.label}</span>
                </li>
              ))}
            </ul>
            <Button variant="gold" size="lg" asChild>
              <Link to="/calculator">Open ROI Calculator</Link>
            </Button>
          </div>

          <div className="relative">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20">
              <div className="text-center mb-6">
                <span className="text-sm text-primary-foreground/60">
                  Sample Calculation
                </span>
                <h3 className="font-display text-2xl font-semibold mt-2">
                  ₦150,000,000 Property
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-primary-foreground/10">
                  <span className="text-primary-foreground/70">
                    Total Investment
                  </span>
                  <span className="font-semibold">₦162,000,000</span>
                </div>
                <div className="flex justify-between py-3 border-b border-primary-foreground/10">
                  <span className="text-primary-foreground/70">
                    Net Annual Income
                  </span>
                  <span className="font-semibold text-gold">₦14,400,000</span>
                </div>
                <div className="flex justify-between py-3 border-b border-primary-foreground/10">
                  <span className="text-primary-foreground/70">
                    Cash-on-Cash Return
                  </span>
                  <span className="font-semibold text-gold">8.89%</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-primary-foreground/70">
                    Payback Period
                  </span>
                  <span className="font-semibold">11.25 years</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
