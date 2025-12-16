import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const team = [
  {
    name: "Victor",
    role: "Founder & CEO",
    description:
      "Leads strategy, capital allocation, and key partnerships. Personally oversees high-value and complex transactions.",
  },
  {
    name: "Mr. Adebayo",
    role: "CFO / Admin",
    description:
      "A distinguished mathematician and accounting professional overseeing financial management and administrative processes.",
  },
  {
    name: "Mr Kelly",
    role: "Vice President, Operations",
    description:
      "Oversees operations across FCT Abuja and the Northern Region, coordinating deal execution and consultant performance.",
  },
  {
    name: "Mrs Aisha",
    role: "Vice President, Emerging Markets",
    description:
      "Leads expansion into FCT, Middle Belt, Ibadan, Port Harcourt, and emerging markets. Fluent in three major Nigerian languages.",
  },
];

export function TeamPreviewSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Meet the Therizo Team
          </h2>
          <p className="text-lg text-muted-foreground">
            Therizo is driven by a founder-investor and senior consultants with
            on-ground relationships in Nigeria's key markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {team.map((member) => (
            <div
              key={member.name}
              className="group p-6 bg-card rounded-lg border border-border hover:border-gold/50 hover:shadow-therizo-md transition-all duration-300 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center mb-4">
                <span className="text-2xl font-display font-semibold text-primary-foreground">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-gold font-medium mb-3">
                {member.role}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/team">
              View Full Team Profiles
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
