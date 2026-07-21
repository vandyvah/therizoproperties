import { useParams, Link, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  JsonLd,
  createBreadcrumbSchema,
  createArticleSchema,
  createFAQSchema,
} from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, TrendingUp, ShieldCheck, Clock } from "lucide-react";
import {
  AREA_BY_SLUG,
  STRATEGIES,
  areaSupportsStrategy,
  type StrategyId,
} from "@/data/programmatic";

const fmtNgn = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export default function InvestLocationStrategy() {
  const { location = "", strategy = "" } = useParams();
  const area = AREA_BY_SLUG[location];
  const strat = STRATEGIES[strategy as StrategyId];

  if (!area || !strat || !areaSupportsStrategy(location, strategy as StrategyId)) {
    return <Navigate to="/properties" replace />;
  }

  const canonical = `/invest/${area.slug}/${strat.id}`;
  const title = `${strat.label} in ${area.name}, ${area.city} — Investor Playbook`;
  const description = `${strat.label} strategy for ${area.name}, ${area.city}. Ticket size from ${fmtNgn(area.ticketFromNgn)}, typical yield ${area.typicalYield}, title: ${area.paperwork}. Verified paperwork, disciplined execution.`;

  const faqs = [
    {
      question: `What is a realistic yield for ${strat.label.toLowerCase()} in ${area.name}?`,
      answer: `Typical gross yields in ${area.name} range around ${area.typicalYield} for well-selected stock. Yields above that band usually indicate title, tenancy, or condition risk — we do not chase them.`,
    },
    {
      question: `What is the minimum ticket size for ${area.name}?`,
      answer: `Entry-level pricing in ${area.name} starts around ${fmtNgn(area.ticketFromNgn)} for verifiable stock. Anything materially cheaper should be treated with suspicion.`,
    },
    {
      question: `What paperwork should I insist on in ${area.name}?`,
      answer: `Typical valid title in ${area.name} is ${area.paperwork}. We independently verify at the relevant land registry before any funds are committed.`,
    },
    {
      question: `Can I execute this strategy from abroad?`,
      answer: `Yes. Therizo runs the full acquisition remotely — title verification, viewings, escrow, and handover — with signed reports at each milestone. Most of our ${strat.label.toLowerCase()} clients close without flying in.`,
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "https://therizoproperties.com/" },
    { name: "Invest", url: "https://therizoproperties.com/invest" },
    { name: area.name, url: `https://therizoproperties.com/invest/${area.slug}` },
    { name: strat.label, url: `https://therizoproperties.com${canonical}` },
  ];

  const otherStrategies = area.strategies.filter((s) => s !== strat.id);

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        keywords={[
          `${strat.label} ${area.name}`,
          `invest in ${area.name}`,
          `${area.city} real estate`,
          `${area.name} property`,
          "diaspora investment Nigeria",
        ]}
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={createArticleSchema({
          headline: title,
          description,
          author: {
            name: "Ugo Uzoukwu",
            jobTitle: "Founder, Therizo Property and Development",
            url: "https://therizoproperties.com/team",
          },
          datePublished: "2026-07-21",
          dateModified: "2026-07-21",
          articleSection: `Invest / ${area.city}`,
          keywords: [strat.label, area.name, area.city, "diaspora"],
          url: `https://therizoproperties.com${canonical}`,
        })}
      />
      <JsonLd data={createFAQSchema(faqs)} />

      <section className="bg-navy text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Breadcrumbs
            className="!text-white/70 mb-6"
            items={[
              { label: "Invest", href: "/invest" },
              { label: area.city, href: `/locations/${area.city.toLowerCase().replace(" ", "-")}` },
              { label: `${strat.label} · ${area.name}` },
            ]}
          />
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs uppercase tracking-wider text-gold mb-4">
            <MapPin className="h-3.5 w-3.5" /> {area.city}, {area.state}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 leading-tight">
            {strat.label} in {area.name}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl">
            {strat.headline}. {area.intro}
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile icon={<TrendingUp className="h-4 w-4" />} label="Typical yield" value={area.typicalYield} />
            <StatTile icon={<Clock className="h-4 w-4" />} label="Horizon" value={strat.horizon} />
            <StatTile icon={<ShieldCheck className="h-4 w-4" />} label="Risk" value={strat.risk} />
            <StatTile icon={<MapPin className="h-4 w-4" />} label="Ticket from" value={fmtNgn(area.ticketFromNgn)} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
                Why {area.name} for {strat.label.toLowerCase()}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{strat.summary}</p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Best fit:</strong> {strat.bestFor}
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">Demand drivers</h2>
              <ul className="space-y-3">
                {area.drivers.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-gold/30 bg-gold/5">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold mb-2">Paperwork we insist on</h3>
                <p className="text-muted-foreground">
                  {area.paperwork}. Independently verified at the land registry before any client funds move.
                  Read our{" "}
                  <Link to="/guides/title-verification" className="text-gold underline">
                    title verification playbook
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-3">Talk to a consultant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll walk you through live {strat.label.toLowerCase()} opportunities in {area.name} on a
                  20-minute call.
                </p>
                <Button asChild className="w-full bg-navy hover:bg-navy/90 text-white">
                  <Link to="/contact">Book a call <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/calculator">Run the ROI numbers</Link>
                </Button>
              </CardContent>
            </Card>

            {otherStrategies.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold mb-3">Other strategies for {area.name}</h3>
                  <ul className="space-y-2 text-sm">
                    {otherStrategies.map((sid) => (
                      <li key={sid}>
                        <Link
                          to={`/invest/${area.slug}/${sid}`}
                          className="text-navy hover:text-gold underline"
                        >
                          {STRATEGIES[sid].label} in {area.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FAQSection
            title={`FAQ — ${strat.label} in ${area.name}`}
            faqs={faqs}
          />
        </div>
      </section>
    </Layout>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}
