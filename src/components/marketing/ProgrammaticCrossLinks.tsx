// Phase 9 batch 2: Cross-linking strip surfacing programmatic /invest and
// /diaspora entry points from high-intent pages (Contact, Calculator).
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Globe2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AREAS, STRATEGIES, DIASPORA_COUNTRIES } from "@/data/programmatic";

interface Props {
  variant?: "contact" | "calculator";
}

// Curated defaults so we don't dump every combo — pick one strong pick per city.
const FEATURED_COMBOS: Array<{ area: string; strategy: string }> = [
  { area: "lekki", strategy: "rental-yield" },
  { area: "maitama", strategy: "buy-and-hold" },
  { area: "gra-phase-2", strategy: "capital-appreciation" },
];

const FEATURED_COUNTRIES = ["uk", "usa", "canada"];

export function ProgrammaticCrossLinks({ variant = "contact" }: Props) {
  const combos = FEATURED_COMBOS
    .map(({ area, strategy }) => {
      const a = AREAS.find((x) => x.slug === area);
      const s = STRATEGIES[strategy as keyof typeof STRATEGIES];
      return a && s ? { area: a, strategy: s } : null;
    })
    .filter((v): v is { area: (typeof AREAS)[number]; strategy: (typeof STRATEGIES)[keyof typeof STRATEGIES] } => v !== null);

  const countries = DIASPORA_COUNTRIES.filter((c) => FEATURED_COUNTRIES.includes(c.slug));

  const heading =
    variant === "calculator"
      ? "Next step: match a strategy to a location"
      : "While you're here — explore our investment playbooks";

  const subhead =
    variant === "calculator"
      ? "Your numbers are only as good as the corridor and paperwork behind them. Pick a playbook to see realistic yields, title notes, and demand drivers."
      : "Before you reach out, skim a corridor brief or a diaspora guide so we can move faster on the call.";

  return (
    <section className="section-padding bg-muted/30 border-t border-border">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">
            {heading}
          </h2>
          <p className="text-muted-foreground">{subhead}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {combos.map(({ area, strategy }) => (
            <Link
              key={`${area.slug}-${strategy.id}`}
              to={`/invest/${area.slug}/${strategy.id}`}
              className="group block h-full"
              aria-label={`${area.name} ${strategy.label} playbook`}
            >
              <Card className="h-full bg-card border-border hover:border-gold/60 transition-colors">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-gold text-xs font-medium uppercase tracking-wider mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {area.city} · {area.name}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-gold transition-colors">
                    {strategy.label}
                  </h3>
                  <p className="text-sm text-muted-foreground flex-1">{strategy.summary}</p>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span>Yield band: <span className="font-medium text-foreground">{area.typicalYield}</span></span>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:text-gold">
                    Open playbook
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <Globe2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-lg font-semibold">Investing from the diaspora?</h3>
                <p className="text-sm text-muted-foreground">
                  Country-specific guides on remittance, tax, and paperwork:
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <Link
                  key={c.slug}
                  to={`/diaspora/${c.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium hover:border-gold/60 hover:text-gold transition-colors"
                >
                  {c.country}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
              <Link
                to="/diaspora"
                className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-gold/90 transition-colors"
              >
                All countries
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/invest"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            Browse every location × strategy playbook
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
