import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, MapPin } from "lucide-react";

export interface CaseStudy {
  neighborhood: string;
  assetType: string;
  closedOn: string; // e.g. "Q1 2026"
  entryPriceNgn: string;
  currentValueNgn?: string;
  grossYieldPct?: string;
  outcome: string;
}

interface CaseStudiesProps {
  city: string;
  studies: CaseStudy[];
}

export function CaseStudies({ city, studies }: CaseStudiesProps) {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-gold mb-3">
            Recent transactions
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            {city} Case Studies
          </h2>
          <p className="text-muted-foreground text-lg">
            Anonymised outcomes from recent {city} deals we closed. Figures are
            rounded and client identities withheld for confidentiality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((s, i) => (
            <Card
              key={i}
              className="bg-card border-border hover:border-gold/50 transition-colors"
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {s.neighborhood}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {s.closedOn}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold leading-snug">
                  {s.assetType}
                </h3>

                <dl className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
                  <div>
                    <dt className="text-muted-foreground text-xs">Entry</dt>
                    <dd className="font-medium">{s.entryPriceNgn}</dd>
                  </div>
                  {s.currentValueNgn && (
                    <div>
                      <dt className="text-muted-foreground text-xs">
                        Current value
                      </dt>
                      <dd className="font-medium text-green-600">
                        {s.currentValueNgn}
                      </dd>
                    </div>
                  )}
                  {s.grossYieldPct && (
                    <div className="col-span-2">
                      <dt className="text-muted-foreground text-xs">
                        Gross yield
                      </dt>
                      <dd className="font-medium inline-flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {s.grossYieldPct}
                      </dd>
                    </div>
                  )}
                </dl>

                <p className="text-sm text-muted-foreground border-t border-border pt-4">
                  {s.outcome}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/70 text-center mt-8 max-w-2xl mx-auto">
          Past performance is not a guarantee of future results. Every deal is
          underwritten independently against current market conditions.
        </p>
      </div>
    </section>
  );
}
