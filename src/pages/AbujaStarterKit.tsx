import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  XCircle,
  Phone,
  Printer,
  ShieldCheck,
} from "lucide-react";

const zones = [
  {
    name: "KARSANA",
    price: "₦12M – ₦20M",
    note: "FCT extension zone. R of O in progress. Infrastructure is coming.",
  },
  {
    name: "LUGBE",
    price: "₦15M – ₦25M",
    note: "Established commuter belt. Airport + city access.",
  },
  {
    name: "KURUDU",
    price: "₦15M – ₦22M",
    note: "Military expansion corridor. Stable demand. Low fraud risk.",
  },
  {
    name: "KUJE",
    price: "₦10M – ₦18M",
    note: "Airport-adjacent. Long-game bet on FCT westward growth.",
  },
  {
    name: "GWAGWALADA",
    price: "₦8M – ₦15M",
    note: "Cheapest FCT entry. Education + hospital proximity.",
  },
];

const titleChecks = [
  "Run full title search at AGIS. No exceptions, no shortcuts.",
  "Confirm plot number matches survey plan and deed of assignment.",
  "Cross-check seller's government ID against the registered title holder.",
  "Physical inspection with a certified, licensed surveyor.",
  "Encumbrance check. Any liens, disputes, or prior claims.",
  "Chain-of-title trace for at least 2 previous owners.",
  "Same-day video walk of the plot, survey plan in hand.",
  "Escrow hold on funds until verification returns 100% clean.",
];

const workflow = [
  { n: "01", title: "Brief us.", desc: "30-minute video call. Budget, zones, timeline, use-case." },
  { n: "02", title: "We shortlist.", desc: "3–5 plots matched to your budget and goal. Paper-trail pre-verified." },
  { n: "03", title: "You shortlist further.", desc: "Pick the top 2. We run deeper AGIS and surveyor diligence." },
  { n: "04", title: "Title verification.", desc: "Full AGIS search. 3–5 business days. You get the report." },
  { n: "05", title: "Live walkthrough.", desc: "Video walk with a licensed surveyor, plot and survey plan on camera." },
  { n: "06", title: "Escrow, transfer, done.", desc: "Funds in escrow. Title transferred to your name. Documents couriered." },
];

const dontDo = [
  "Inflated prices",
  "Off-register titles",
  "Trust-me deals",
  "Unsolicited calls",
  "Fees before verification",
];

export default function AbujaStarterKit() {
  return (
    <Layout>
      <SEOHead
        title="Abuja Diaspora Property Starter Kit | Thérizo Properties"
        description="The one-page Abuja starter kit for diaspora buyers: 5 zones that still work in 2026, an 8-step title verification checklist, and a remote-buying workflow with zero flights."
        canonicalUrl="https://therizoproperties.com/abuja-starter-kit"
        keywords="Abuja diaspora property, Abuja land for sale, AGIS title verification, remote property buying Nigeria, Karsana Lugbe Kurudu Kuje Gwagwalada"
      />
      <JsonLd
        data={createBreadcrumbSchema([
          { name: "Home", url: "https://therizoproperties.com/" },
          { name: "Abuja Diaspora Starter Kit", url: "https://therizoproperties.com/abuja-starter-kit" },
        ])}
      />

      <div className="bg-background">
        <div className="container mx-auto px-4 pt-6">
          <Breadcrumbs
            items={[{ label: "Abuja Diaspora Starter Kit", href: "/abuja-starter-kit" }]}
          />
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden bg-foreground text-background">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
            <div className="flex items-center gap-3 mb-6 text-xs tracking-[0.3em] uppercase opacity-70">
              <span>Thérizo</span>
              <span className="h-px w-8 bg-background/40" />
              <span>Property &amp; Development Corporation</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Abuja Diaspora<br />
              <span className="text-primary">Property Starter Kit</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl opacity-80 max-w-2xl">
              Three pages of work, compressed to one. Read it. Print it. Use it.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none">
                <Link to="/contact">
                  Book a 30-minute call <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-none border-background/40 bg-transparent text-background hover:bg-background hover:text-foreground"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" /> Print this kit
              </Button>
            </div>
          </div>
        </section>

        {/* 01 - Zones */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-display text-5xl md:text-6xl font-bold text-primary">01</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                5 Abuja zones that still work in 2026
              </h2>
            </div>
            <p className="text-muted-foreground mb-10 max-w-3xl">
              Price ranges are for 500–600sqm plots. Figures rounded. Local currency shown as ₦ (NGN Naira).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {zones.map((z) => (
                <div key={z.name} className="bg-card p-6 md:p-8 flex flex-col">
                  <h3 className="font-display text-xl font-bold tracking-wider">{z.name}</h3>
                  <p className="font-display text-3xl md:text-4xl font-bold text-primary my-4">
                    {z.price}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{z.note}</p>
                </div>
              ))}
              <div className="bg-primary text-primary-foreground p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wider">DM "ABUJA"</h3>
                  <p className="text-sm italic opacity-90 mt-4">
                    For live inventory + zone scoring.
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 rounded-none border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Link to="/contact">
                    Get the live list <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 02 - Title checklist */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-display text-5xl md:text-6xl font-bold text-primary">02</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                Title verification checklist
              </h2>
            </div>
            <p className="text-muted-foreground mb-10 max-w-3xl">
              If a seller refuses any of these 8 steps, walk. Zero exceptions on Thérizo deals.
            </p>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {titleChecks.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 bg-card border border-border p-5"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-foreground leading-relaxed mt-1">{item}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 03 - Workflow */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-display text-5xl md:text-6xl font-bold text-primary">03</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                Remote-buying workflow. Zero flights.
              </h2>
            </div>
            <p className="text-muted-foreground mb-10 max-w-3xl">
              From first call to keys in hand. Average: 45 days. You never need to get on a plane.
            </p>

            <div className="space-y-px bg-border border border-border">
              {workflow.map((step) => (
                <div
                  key={step.n}
                  className="bg-card grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-8 p-6 md:p-8 items-start"
                >
                  <span className="font-display text-3xl md:text-5xl font-bold text-primary">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-bold mb-1">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we don't do */}
        <section className="py-16 md:py-20 bg-foreground text-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide mb-8">
              What we do <span className="text-primary">not</span> do
            </h2>
            <div className="flex flex-wrap gap-3 mb-10">
              {dontDo.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-2 border border-background/30 px-4 py-2 text-sm"
                >
                  <XCircle className="h-4 w-4 text-primary" /> {d}
                </span>
              ))}
            </div>
            <div className="border-l-4 border-primary pl-6 max-w-3xl">
              <p className="text-lg md:text-xl leading-relaxed opacity-90">
                We lose more deals than we close. The ones we close, we close clean.
              </p>
              <p className="mt-4 flex items-start gap-3 text-base opacity-80">
                <ShieldCheck className="h-5 w-5 text-primary mt-1 shrink-0" />
                Every Thérizo deal runs through AGIS, survey, escrow, and video walk.
                Zero exceptions. Zero losses.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">Ready to start?</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6">
              Book a 30-minute call. We will shortlist plots before you hang up.
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              No pitch. No pressure. You walk away with a real list — or nothing.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-none">
                <Link to="/contact">
                  Book the call <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none">
                <a href="tel:+2348034830087">
                  <Phone className="mr-2 h-4 w-4" /> +234 803 483 0087
                </a>
              </Button>
            </div>
            <p className="mt-12 text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Thérizo Property &amp; Development Corporation · Abuja, Nigeria · Disclaimer:
              figures are directional, not investment advice. Always verify title at AGIS
              before transacting. Past price movement does not guarantee future returns.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
