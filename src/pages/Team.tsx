import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MapPin, ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

import founderAsset from "@/assets/founder-ugo-v2.png.asset.json";
const founderImage = founderAsset.url;

const founder = {
  name: "Ugo Uzoukwu",
  role: "Founder & Chief Executive Officer",
  bio: "Ugo Uzoukwu leads Therizo's strategy, capital deployment, and key relationships. His background spans cybersecurity, real estate, law, and oil and gas. Ugo personally oversees high-value transactions, joint-venture discussions, and development opportunities.",
  image: founderImage,
};

const consultants = [
  {
    name: "Mr. Solomon Adebayo",
    role: "CFO / Admin",
    location: "Lagos Island",
    bio: "A distinguished mathematician and accounting professional, Mr. Solomon Adebayo brings analytical rigour and financial discipline to Therizo's operations. He oversees the firm's financial management, administrative processes, and ensures every transaction meets the highest standards of fiscal accountability and transparency.",
    initial: "S",
    image: null,
  },
  {
    name: "Mr Kelly Amiwero",
    role: "Vice President, Operations",
    location: "FCT Abuja / Northern Region",
    bio: "Mr Kelly Amiwero oversees Therizo's operations across FCT Abuja and the Northern Region. He coordinates deal execution, manages consultant performance, and ensures operational standards are maintained across markets. With deep knowledge of the Abuja property landscape and northern investment corridors, he serves high-net-worth individuals, institutional clients, and diaspora investors seeking well-documented assets in Nigeria's political capital and emerging northern markets.",
    initial: "K",
    image: null,
  },
  {
    name: "Mrs Aisha Collins A.",
    role: "Vice President, Emerging Markets and High-Volume Properties",
    location: "FCT, Middle Belt, Ibadan, Port Harcourt & Emerging Markets",
    bio: "Mrs Aisha Collins A. leads Therizo's expansion into Nigeria's high-growth corridors, covering Inlands and Chief Lands in FCT, the Middle Belt Region, and emerging markets including Ibadan and Port Harcourt. Fluent in the three major Nigerian languages, she brings unmatched versatility across residential, commercial, and agricultural properties. Investors trust her to identify the right opportunities across diverse markets and deal structures.",
    initial: "A",
    image: null,
  },
];

const workflowSteps = [
  "The CEO sets strategy and approves properties",
  "Senior consultants drive deals and manage client relationships",
  "Legal and external partners support documentation and compliance",
];

const Team = () => {
  return (
    <Layout>
      <SEOHead
        title="Meet the Therizo Leadership Team | Nigerian Real Estate Experts"
        description="Meet Therizo's executive team: CFO, Vice Presidents, and leadership driving real estate excellence across Lagos, Abuja, FCT, and Nigeria's emerging markets."
        keywords="Nigerian real estate leadership, Therizo team, Lagos property experts, Abuja real estate, FCT property consultants, Nigerian investment advisors, emerging markets Nigeria"
        canonicalUrl="/team"
        ogImage="https://therizoproperties.com/og/og-team.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Team", href: "/team" }]} />
          <div className="max-w-3xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Users className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Our People</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Team & Advisors
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Therizo is built for clients who want clear answers and
              accountable people. Our team combines capital, on-ground
              experience, and local relationships across Nigeria's key markets.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-2">
              <div className="relative w-[160px] sm:w-[180px] md:w-[200px] mx-auto lg:mx-0">
                <div className="absolute -inset-2 bg-gradient-to-br from-gold/30 to-navy/20 rounded-sm blur-xl opacity-60" />
                <div className="relative aspect-square overflow-hidden rounded-sm border-2 border-gold/30 shadow-therizo-lg bg-navy">
                  <img
                    src={founder.image}
                    alt={`${founder.name}, Founder & CEO of Therizo Properties`}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">
                Founder & CEO
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-ink mb-3">
                {founder.name}
              </h2>
              <p className="text-gold font-medium mb-6">{founder.role}</p>
              <p className="text-lg text-slate leading-relaxed">
                {founder.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Senior Consultants */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Leadership Team
            </h2>
            <p className="text-lg text-slate">
              Each member of our leadership team is responsible for defined
              markets and clear objectives. They oversee operations, manage key
              relationships, and ensure every client receives the firm's full
              support from first contact to completion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {consultants.map((consultant) => (
              <div
                key={consultant.name}
                className="bg-warm-white rounded-sm border border-sand p-6 md:p-8 hover:shadow-md transition-all duration-300"
              >
                <div className="text-center mb-4 md:mb-6">
                  {consultant.image ? (
                    <img
                      src={consultant.image}
                      alt={consultant.name}
                      className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full object-cover object-[center_20%] mb-4 border-2 border-gold/30"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4">
                      <span className="text-3xl md:text-4xl font-display font-semibold text-navy">
                        {consultant.initial}
                      </span>
                    </div>
                  )}
                  <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-1">
                    {consultant.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gold font-medium mb-2">
                    {consultant.role}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-slate">
                    <MapPin size={14} />
                    <span>{consultant.location}</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate leading-relaxed text-center sm:text-left">
                  {consultant.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
                How We Work as a Team
              </h2>
              <p className="text-lg text-slate leading-relaxed mb-8">
                Every client of Therizo is supported by the entire firm, not
                just one person.
              </p>
              <ul className="space-y-4 mb-8">
                {workflowSteps.map((step) => (
                  <li key={step} className="flex items-start gap-4">
                    <ArrowRight className="text-gold shrink-0 mt-1" size={20} />
                    <span className="text-ink">{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-slate">
                We keep communications simple, transparent, and written. From
                first enquiry to closing, you know who is responsible at each
                stage.
              </p>
            </div>
            <div>
              <div className="bg-navy rounded-sm p-10 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <Users className="text-gold" size={40} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-ivory mb-4">
                  One Team. One Standard.
                </h3>
                <p className="text-ivory/70">
                  Clear accountability from first contact to completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ivory">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
            Ready to Work with Us?
          </h2>
          <p className="text-lg text-slate leading-relaxed mb-10 max-w-2xl mx-auto">
            Connect with our team and discuss how we can help you find the right
            property.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/contact">Contact the Therizo Team</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Team;
