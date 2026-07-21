import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  JsonLd,
  createBreadcrumbSchema,
  createFAQSchema,
} from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Globe2, Clock, Coins } from "lucide-react";
import { DIASPORA_BY_SLUG, DIASPORA_COUNTRIES } from "@/data/programmatic";

// Per-country hreflang alternates so Google routes each locale to its own page.
function useHreflangAlternates(activeSlug: string) {
  useEffect(() => {
    const removed: HTMLLinkElement[] = [];
    document.querySelectorAll('link[data-diaspora-hreflang="1"]').forEach((el) => el.remove());

    DIASPORA_COUNTRIES.forEach((c) => {
      const link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", c.hreflang);
      link.setAttribute("href", `https://therizoproperties.com/diaspora/${c.slug}`);
      link.setAttribute("data-diaspora-hreflang", "1");
      document.head.appendChild(link);
      removed.push(link);
    });
    const xDefault = document.createElement("link");
    xDefault.setAttribute("rel", "alternate");
    xDefault.setAttribute("hreflang", "x-default");
    xDefault.setAttribute("href", `https://therizoproperties.com/diaspora/${activeSlug}`);
    xDefault.setAttribute("data-diaspora-hreflang", "1");
    document.head.appendChild(xDefault);
    removed.push(xDefault);

    return () => {
      removed.forEach((el) => el.remove());
    };
  }, [activeSlug]);
}

export default function DiasporaCountry() {
  const { country = "" } = useParams();
  const c = DIASPORA_BY_SLUG[country];
  useHreflangAlternates(country);

  if (!c) return <Navigate to="/diaspora" replace />;

  const canonical = `/diaspora/${c.slug}`;
  const title = `Investing in Nigerian Property from ${c.country} — Diaspora Guide`;
  const description = `How ${c.country}-based Nigerians buy verified property in Lagos, Abuja, and Port Harcourt — remittance in ${c.currency}, tax treatment, and remote acquisition.`;

  const faqs = [
    {
      question: `Can I buy property in Nigeria while living in ${c.country}?`,
      answer: `Yes. Therizo executes the entire acquisition remotely — title verification, viewings, escrow, and handover — with signed reports at each milestone. Most of our ${c.country}-based clients close without travelling back.`,
    },
    {
      question: `How do I send money from ${c.country} to Nigeria for a property purchase?`,
      answer: c.remittance,
    },
    {
      question: `Do I pay tax in ${c.country} on Nigerian rental income?`,
      answer: c.tax,
    },
    {
      question: `How do you protect me from fraud from ${c.country}?`,
      answer: `Every purchase goes through independent title verification at the relevant land registry, a documented escrow release schedule tied to milestone triggers, and a signed handover report. We publicly warn against Omo-onile and fake C-of-O scams in our /report-fraud channel.`,
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "https://therizoproperties.com/" },
    { name: "Diaspora", url: "https://therizoproperties.com/diaspora" },
    { name: c.country, url: `https://therizoproperties.com${canonical}` },
  ];

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        keywords={[
          `Nigeria property ${c.country}`,
          `buy Nigerian property from ${c.country}`,
          `diaspora ${c.country} Nigeria`,
          `Lagos property ${c.currency}`,
        ]}
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={createFAQSchema(faqs)} />

      <section className="bg-navy text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Breadcrumbs
            className="!text-white/70 mb-6"
            items={[{ label: "Diaspora", href: "/diaspora" }, { label: c.country }]}
          />
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs uppercase tracking-wider text-gold mb-4">
            <Globe2 className="h-3.5 w-3.5" /> {c.country}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 leading-tight">
            Investing in Nigerian property from {c.country}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl">{c.intro}</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tile icon={<Coins className="h-4 w-4" />} label="Currency" value={c.currency} />
            <Tile icon={<Clock className="h-4 w-4" />} label="Time zone" value={c.timezoneNote} />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">Sending funds from {c.country}</h2>
            <p className="text-muted-foreground leading-relaxed">{c.remittance}</p>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">Tax treatment</h2>
            <p className="text-muted-foreground leading-relaxed">{c.tax}</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              This is not legal or tax advice. Confirm with a qualified {c.country} adviser before filing.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3">
              What {c.country}-based clients typically worry about
            </h2>
            <ul className="space-y-2">
              {c.concerns.map((concern) => (
                <li key={concern} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span className="text-muted-foreground">{concern}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="border-gold/30 bg-gold/5">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold mb-1">
                  Ready to look at live opportunities?
                </h3>
                <p className="text-muted-foreground text-sm">
                  A 20-minute call with a Therizo consultant — no obligation, no hard sell.
                </p>
              </div>
              <Button asChild className="bg-navy hover:bg-navy/90 text-white">
                <Link to="/contact">
                  Book a call <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FAQSection title={`FAQ — ${c.country} diaspora buyers`} faqs={faqs} />
        </div>
      </section>

      <section className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-xl font-semibold mb-4">Other diaspora markets we serve</h2>
          <div className="flex flex-wrap gap-2">
            {DIASPORA_COUNTRIES.filter((x) => x.slug !== c.slug).map((x) => (
              <Link
                key={x.slug}
                to={`/diaspora/${x.slug}`}
                className="px-4 py-2 border border-border rounded-full text-sm hover:border-gold hover:text-gold transition-colors"
              >
                {x.country}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Tile({
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
      <div className="text-white">{value}</div>
    </div>
  );
}
