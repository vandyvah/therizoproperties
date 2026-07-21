import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { AREAS, STRATEGIES } from "@/data/programmatic";

export default function InvestIndex() {
  const canonical = "/invest";

  const breadcrumbs = [
    { name: "Home", url: "https://therizoproperties.com/" },
    { name: "Invest", url: "https://therizoproperties.com/invest" },
  ];

  return (
    <Layout>
      <SEOHead
        title="Invest in Nigerian Real Estate — Location × Strategy Playbooks"
        description="Every combination of blue-chip Nigerian neighborhood and investment strategy — rental yield, capital appreciation, short-let, off-plan, and buy-and-hold — with verified paperwork."
        canonical={canonical}
        keywords={["invest Nigeria real estate", "Lagos property investment", "Abuja property investment", "diaspora investment playbook"]}
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />

      <section className="bg-navy text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Breadcrumbs className="!text-white/70 mb-6" items={[{ label: "Invest" }]} />
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4">
            Invest by neighborhood and strategy
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            Pick a district and the strategy that matches your horizon. Every combination on this page is one
            Therizo actively transacts — no thin combos, no fluff.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl space-y-10">
          {AREAS.map((area) => (
            <div key={area.slug}>
              <h2 className="font-display text-2xl font-semibold mb-1 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gold" />
                {area.name}
                <span className="text-sm text-muted-foreground font-normal">— {area.city}</span>
              </h2>
              <p className="text-muted-foreground mb-4 max-w-3xl">{area.intro}</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {area.strategies.map((sid) => (
                  <Link
                    key={sid}
                    to={`/invest/${area.slug}/${sid}`}
                    className="group"
                  >
                    <Card className="h-full hover:border-gold transition-colors">
                      <CardContent className="p-5">
                        <div className="text-xs uppercase tracking-wider text-gold mb-1">
                          {STRATEGIES[sid].label}
                        </div>
                        <div className="font-display font-semibold mb-1 group-hover:text-gold transition-colors">
                          {STRATEGIES[sid].label} in {area.name}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {STRATEGIES[sid].summary}
                        </div>
                        <div className="mt-3 text-sm text-navy inline-flex items-center gap-1 group-hover:text-gold">
                          Read playbook <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
