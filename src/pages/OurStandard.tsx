import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  XCircle,
  CheckCircle,
  FileSearch,
  Building2,
  Users,
  Heart,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createFAQSchema, createOrganizationSchema } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const standardFAQs = [
  {
    question: "How does Therizo verify property ownership in Nigeria?",
    answer: "We work with licensed legal partners to verify ownership through land registry searches, title document review (C of O, Governor's Consent, Survey Plans), and confirmation of the chain of ownership before any property is listed."
  },
  {
    question: "What happens if a property fails Therizo's vetting process?",
    answer: "We walk away. If documentation is incomplete, pricing is unrealistic, or we identify red flags, we do not list the property—even if it means losing potential commission."
  },
  {
    question: "Does Therizo provide legal services?",
    answer: "No. We are not a law firm. However, we work with trusted legal partners and can coordinate with your own solicitor to ensure proper due diligence and documentation."
  },
  {
    question: "How does Therizo evaluate developer projects?",
    answer: "We assess track record of completion, transparency on costs and timelines, quality of construction, planning approvals, and the realism of projected returns before recommending any developer project."
  }
];

const refusals = [
  "We do not push deals we cannot explain.",
  "We do not hide title issues behind marketing language.",
  "We do not overstate rental income just to close a sale.",
  "If we are not comfortable putting our name on a property, we will not list it.",
];

const vettingSteps = [
  {
    title: "Confirm Ownership and Title",
    description:
      "We verify ownership and title status with our legal partners and relevant authorities, and we request supporting documentation from the seller or developer.",
  },
  {
    title: "Check Approvals and Compliance",
    description:
      "Where applicable, we review planning permissions, building approvals, and estate regulations to understand what is allowed and what has been done.",
  },
  {
    title: "Test the Price Against the Market",
    description:
      "We look at comparable sales, rental levels, and demand in the area. If the numbers do not make sense, we say so and we either renegotiate or walk away.",
  },
  {
    title: "Assess Risk and Exit Options",
    description:
      "We consider vacancy risk, resale possibilities, and likely holding period. We prefer assets where a buyer has more than one realistic exit.",
  },
];

const developerChecks = [
  "Track record of completing projects and handing over units",
  "Transparency on costs, timelines, and approvals",
  "Quality of construction and infrastructure",
  "Realistic sales and rental assumptions",
];

const promises = [
  "Tell you when a deal looks strong",
  "Tell you when a deal has issues",
  "Tell you when we think you should walk away",
];

const OurStandard = () => {
  return (
    <Layout>
      <SEOHead
        title="Our Standard | Nigerian Property Due Diligence & Verification"
        description="Learn how Therizo vets Nigerian properties. Our rigorous due diligence process includes title verification, price validation, and risk assessment to protect buyers."
        keywords="Nigerian property verification, title due diligence Nigeria, property vetting Lagos, real estate verification Abuja, safe property investment Nigeria"
        canonicalUrl="/our-standard"
        ogImage="https://therizoproperties.com/og/og-standard.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />
      <JsonLd data={createFAQSchema(standardFAQs)} />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Our Standard", href: "/our-standard" }]} />
          <div className="max-w-3xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Shield className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Our Process</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Our Standard
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Nigerian real estate can reward you or punish you. The difference
              is in the paperwork and the numbers. Therizo exists to reduce
              uncertainty for serious buyers, investors, and partners. We do
              this by holding every property we touch to a clear internal
              standard.
            </p>
          </div>
        </div>
      </section>

      {/* What We Refuse */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
                What We Refuse to Do
              </h2>
              <ul className="space-y-4">
                {refusals.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <XCircle
                      className="text-destructive shrink-0 mt-1"
                      size={20}
                    />
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
                <div className="bg-warm-white rounded-sm p-8 shadow-md border border-sand">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <XCircle className="text-destructive" size={40} />
                  </div>
                  <p className="font-display text-xl font-semibold text-ink">
                    We walk away from deals we cannot defend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Vet */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              How We Vet Properties
            </h2>
            <p className="text-lg text-slate">
              Before a property appears on Therizo, we:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {vettingSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative p-8 bg-warm-white rounded-sm border border-sand hover:shadow-md transition-all duration-300 group"
              >
                <div className="absolute top-6 right-6 text-5xl font-display font-bold text-muted/50 group-hover:text-gold/20 transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                    <FileSearch className="text-gold" size={24} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers & JV */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-warm-white rounded-sm p-8 shadow-md border border-sand">
                <h3 className="font-display text-lg font-semibold text-ink mb-6">
                  For every developer or JV opportunity, we look at:
                </h3>
                <ul className="space-y-4">
                  {developerChecks.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <CheckCircle
                        className="text-gold shrink-0 mt-0.5"
                        size={20}
                      />
                      <span className="text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-sand">
                  <p className="text-sm text-slate italic">
                    If these elements are missing or unclear, we do not proceed.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-sm bg-navy flex items-center justify-center">
                  <Building2 className="text-ivory" size={24} />
                </div>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
                Developers and Joint-Venture Partners
              </h2>
              <p className="text-lg text-slate leading-relaxed">
                We work with developers and landowners who understand that
                long-term success depends on more than just launching projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protection */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-navy flex items-center justify-center mb-6">
              <Users className="text-ivory" size={32} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Protection for Buyers and Investors
            </h2>
            <p className="text-lg text-slate leading-relaxed">
              Our role is not to replace your lawyer, but to reduce noise and
              filter out weak deals. By the time a property reaches you through
              Therizo, it has already been screened through legal, numerical,
              and practical checks. We then work with your advisors to complete
              your own independent verification, rather than pushing you to rush
              into a commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="section-padding bg-navy">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <Heart className="text-gold" size={32} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
              Our Promise to You
            </h2>
            <p className="text-lg text-ivory/80 leading-relaxed mb-8">
              We cannot remove all risk from real estate. No one can. What we
              can do is refuse to play with your trust. We will:
            </p>
            <ul className="space-y-3 mb-10">
              {promises.map((promise) => (
                <li
                  key={promise}
                  className="flex items-center justify-center gap-3 text-ivory"
                >
                  <CheckCircle className="text-gold shrink-0" size={20} />
                  <span>{promise}</span>
                </li>
              ))}
            </ul>
            <p className="text-ivory/70 italic mb-10">
              We would rather lose a commission than help you buy a problem.
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/contact">Speak with Therizo About Our Process</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OurStandard;
