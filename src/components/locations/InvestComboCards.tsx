// Phase 9 batch 2: Surface the matching /invest/:location/:strategy playbooks
// on each city location page so visitors can drill into a specific strategy.
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AREAS, STRATEGIES, type LocationArea } from "@/data/programmatic";

interface Props {
  city: "Lagos" | "Abuja" | "Port Harcourt";
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function InvestComboCards({ city, title, subtitle, limit }: Props) {
  const areas: LocationArea[] = AREAS.filter((a) => a.city === city);
  const combos = areas.flatMap((area) =>
    area.strategies.map((sid) => ({ area, strategy: STRATEGIES[sid] })),
  );
  const shown = typeof limit === "number" ? combos.slice(0, limit) : combos;

  if (shown.length === 0) return null;

  return (
    <section className="section-padding bg-background border-t border-border">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
            {title ?? `${city} Investment Playbooks`}
          </h2>
          <p className="text-muted-foreground text-lg">
            {subtitle ??
              `Neighbourhood × strategy briefs — realistic yields, paperwork notes, and the demand drivers behind each ${city} corridor.`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map(({ area, strategy }) => {
            const href = `/invest/${area.slug}/${strategy.id}`;
            return (
              <Link
                key={`${area.slug}-${strategy.id}`}
                to={href}
                className="group block h-full"
                aria-label={`${area.name} — ${strategy.label} playbook`}
              >
                <Card className="h-full bg-card border-border hover:border-gold/60 transition-colors">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 text-gold text-xs font-medium uppercase tracking-wider mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {area.name}
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-gold transition-colors">
                      {strategy.label} · {strategy.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {strategy.summary}
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        <span>Typical yield: <span className="font-medium text-foreground">{area.typicalYield}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                        <span>{area.paperwork}</span>
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-gold">
                      Read the playbook
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/invest"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            Browse every location × strategy combo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
