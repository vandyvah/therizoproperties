import { FileCheck, Calculator, Shield, Users } from "lucide-react";

const pillars = [
  {
    icon: FileCheck,
    title: "Verified Paperwork",
    description:
      "We do not list everything. We list what we can defend. Before a property appears on Therizo, we confirm ownership, title status, and approvals with our legal partners.",
  },
  {
    icon: Calculator,
    title: "Disciplined Numbers",
    description:
      "Every property can be run through our ROI Calculator in Nigerian Naira (₦). You see projected net income, cash-on-cash return, and payback period before you commit.",
  },
  {
    icon: Shield,
    title: "Curated Portfolio",
    description:
      "We are not a mass listing site. We prefer fewer, stronger properties that meet our standard on documentation, location, and risk.",
  },
  {
    icon: Users,
    title: "On-Ground Execution",
    description:
      "Viewings, due diligence, and negotiations are handled by our senior consultants in Nigeria, with clear reporting for local and diaspora clients.",
  },
];

export function WhyTherizoSection() {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Why Therizo
          </h2>
          <p className="text-lg text-muted-foreground">
            Four pillars that define how we operate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="relative p-8 bg-card rounded-lg border border-border hover:shadow-therizo-md transition-all duration-300 group"
            >
              <div className="absolute top-6 right-6 text-6xl font-display font-bold text-muted/50 group-hover:text-gold/20 transition-colors">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-5">
                  <pillar.icon className="text-primary-foreground" size={28} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
