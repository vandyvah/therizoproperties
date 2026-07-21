import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { JsonLd, createArticleSchema, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { GuideByline, GuideCitations } from "@/components/guides/GuideByline";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Target, 
  Search, 
  FileCheck,
  Banknote,
  Key,
  CheckCircle,
  ArrowRight,
  Calendar
} from "lucide-react";

const buyingSteps = [
  {
    number: "01",
    icon: Target,
    title: "Define Your Requirements",
    description: "Clarify your budget, preferred locations, property type, and investment goals. Consider whether you're buying for personal use, rental income, or capital appreciation.",
    tips: [
      "Set a realistic budget including transaction costs (10-15% extra)",
      "Research neighbourhoods for infrastructure and appreciation potential",
      "Decide between completed properties vs. off-plan purchases",
    ],
  },
  {
    number: "02",
    icon: Search,
    title: "Search and Shortlist",
    description: "Work with Therizo to identify properties that match your criteria. We pre-screen all listings for documentation and value before presenting them.",
    tips: [
      "Request detailed property information and photos",
      "Ask about comparable sales in the area",
      "Schedule physical viewings for shortlisted properties",
    ],
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Due Diligence",
    description: "Before making an offer, verify the property's title, documentation, and physical condition. This is non-negotiable in Nigerian real estate.",
    tips: [
      "Verify title documents with our legal partners",
      "Conduct physical inspection and structural survey if needed",
      "Check for any encumbrances or pending litigation",
    ],
  },
  {
    number: "04",
    icon: Banknote,
    title: "Negotiation and Offer",
    description: "Make an informed offer based on market comparables and property condition. We negotiate on your behalf to secure the best terms.",
    tips: [
      "Start with a reasonable offer based on market data",
      "Negotiate payment terms if needed",
      "Get agreement in writing before proceeding",
    ],
  },
  {
    number: "05",
    icon: FileCheck,
    title: "Legal Documentation",
    description: "Your lawyer prepares the Sale Agreement and oversees the transaction. Ensure all parties sign and funds are properly escrowed.",
    tips: [
      "Review Sale Agreement carefully with your lawyer",
      "Use escrow services for fund protection",
      "Ensure seller provides all original documents",
    ],
  },
  {
    number: "06",
    icon: Key,
    title: "Completion and Handover",
    description: "Once payment is complete and documents transferred, you receive the keys. Post-completion, work towards perfecting your title.",
    tips: [
      "Obtain Governor's Consent if required",
      "Register your interest at the Land Registry",
      "Keep all documents in a secure location",
    ],
  },
];

const costs = [
  { name: "Legal Fees", percentage: "5-10%", description: "Lawyer fees for documentation and representation" },
  { name: "Agency Commission", percentage: "5%", description: "Standard real estate agency fee" },
  { name: "Stamp Duty", percentage: "3%", description: "Government tax on property transfer" },
  { name: "Governor's Consent Fee", percentage: "3-6%", description: "Required for C of O transfer (if applicable)" },
  { name: "Registration Fees", percentage: "1-2%", description: "Land registry and documentation fees" },
  { name: "Survey/Inspection", percentage: "₦200K-500K", description: "Physical and structural survey costs" },
];

const faqs = [
  {
    question: "How much deposit is typically required when buying property in Nigeria?",
    answer: "Most sellers require a 10-30% initial deposit to take the property off the market. The remainder is paid upon signing the Sale Agreement or at completion, depending on the agreed terms. Off-plan purchases often have structured payment plans spread over the construction period.",
  },
  {
    question: "Can foreigners buy property in Nigeria?",
    answer: "Yes, foreigners can buy property in Nigeria, though with some restrictions. Land ownership is typically through a lease (usually 99 years) rather than outright freehold. Foreigners should work with local legal counsel to navigate the process and ensure compliance with the Land Use Act.",
  },
  {
    question: "What's the difference between buying in an estate vs. independent land?",
    answer: "Estate properties typically offer better infrastructure, security, and managed common areas but come with service charges and estate rules. Independent land offers more freedom but requires you to handle all infrastructure. Estates in established areas tend to appreciate more consistently.",
  },
  {
    question: "How long does the entire buying process take?",
    answer: "From finding a property to completion, expect 3-6 months for a straightforward transaction. This includes due diligence (2-4 weeks), negotiation and documentation (2-4 weeks), and completion processes. Properties with title issues or complex documentation can take longer.",
  },
  {
    question: "Should I buy off-plan or completed properties?",
    answer: "Off-plan can offer lower entry prices and payment flexibility but carries construction risk. Completed properties are immediately available and verifiable but typically cost more. Choose based on your timeline, risk tolerance, and need for rental income.",
  },
  {
    question: "What happens if I discover problems after purchase?",
    answer: "This is why due diligence is critical. Post-purchase, your legal recourse depends on the Sale Agreement terms. If fraud is involved, legal action is possible but time-consuming. Prevention through thorough verification is always better than cure.",
  },
];

export default function BuyerGuide() {
  return (
    <Layout>
      <SEOHead
        title="How to Buy Property in Nigeria: Complete Diaspora Buyer's Guide"
        description="Evergreen step-by-step guide for diaspora investors buying verified Nigerian properties. Due diligence, title verification, transaction costs, and how to avoid common pitfalls. Last reviewed July 2026."
        canonical="/guides/buyer-guide"
        keywords={[
          "diaspora property investment Nigeria",
          "buy property Nigeria guide",
          "Nigerian real estate diaspora",
          "Lagos property buying guide",
          "verified Nigerian properties",
          "title verification Nigeria",
          "clean title Nigeria"
        ]}
        ogImage="https://therizoproperties.com/og/og-buyer-guide.jpg"
        pinterestImage="https://therizoproperties.com/pinterest/pin-buyer-guide.jpg"
      />
      <JsonLd data={createArticleSchema({
        headline: "How to Buy Property in Nigeria: Complete Diaspora Buyer's Guide",
        description: "Evergreen guide for diaspora investors purchasing verified Nigerian properties. Due diligence, title verification, and transaction discipline.",
        author: {
          name: "Ugo Uzoukwu",
          jobTitle: "Founder & Principal, Therizo Property and Development Corporation",
          url: "https://therizoproperties.com/team",
        },
        reviewedBy: {
          name: "Solomon Adaji",
          jobTitle: "Head of Client Advisory",
          url: "https://therizoproperties.com/team",
        },
        datePublished: "2025-01-15",
        dateModified: "2026-07-20",
        url: "https://therizoproperties.com/guides/buyer-guide",
        articleSection: "Diaspora Investing",
        keywords: ["buy property Nigeria", "diaspora real estate", "Lagos property investment", "Abuja property", "Nigerian buyer's guide"],
        citations: [
          "https://www.cbn.gov.ng/",
          "https://lagosstate.gov.ng/ministries/lands/",
          "https://fcta.gov.ng/",
          "https://www.nigeria-law.org/LandUseAct.htm",
        ],
      })} />
      <JsonLd data={createBreadcrumbSchema([
        { name: "Home", url: "https://therizoproperties.com/" },
        { name: "Guides", url: "https://therizoproperties.com/guides" },
        { name: "Buyer's Guide", url: "https://therizoproperties.com/guides/buyer-guide" },
      ])} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Diaspora Buyer's Guide" },
            ]}
            className="mb-8 text-ivory/60"
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <BookOpen className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Diaspora Buyer's Guide</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              How to Buy Verified Nigerian Property as a Diaspora Investor
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              A comprehensive, step-by-step guide for diaspora investors purchasing 
              property in Nigeria. Learn how to verify titles, avoid pitfalls, 
              and work with trusted partners like Therizo.
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-ivory/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last reviewed: July 2026</span>
              </div>
              <span>•</span>
              <span>15 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Author byline */}
      <section className="bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <GuideByline
              author={{ name: "Ugo Uzoukwu", role: "Founder & Principal, Therizo Properties" }}
              reviewedBy={{ name: "Solomon Adaji", role: "Head of Client Advisory" }}
              datePublished="2025-01-15"
              dateModified="2026-07-20"
              readTime="15 min read"
            />
          </div>
        </div>
      </section>

      {/* Quick Answer Box */}
      <section className="py-8 bg-gold/10 border-b border-gold/20">

        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-lg font-semibold text-ink mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gold" />
              Quick Answer
            </h2>
            <p className="text-slate leading-relaxed">
              To buy property in Nigeria as a diaspora investor: (1) Define your budget and goals, 
              (2) Work with a verified agent like Therizo who pre-screens properties, 
              (3) Conduct thorough title verification through legal partners, 
              (4) Negotiate with market data, (5) Complete documentation with proper legal oversight, 
              and (6) Perfect your title post-purchase. Budget 10-15% extra for transaction costs. 
              The entire process typically takes 3-6 months.
            </p>
          </div>
        </div>
      </section>

      {/* Buying Steps */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              The 6-Step Buying Process
            </h2>
            <p className="text-lg text-slate">
              Follow this proven process to navigate the Nigerian property market safely and efficiently.
            </p>
          </div>

          <div className="space-y-8">
            {buyingSteps.map((step, index) => (
              <div
                key={step.title}
                className="bg-warm-white rounded-sm border border-sand p-8 lg:p-10"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-5xl font-display font-bold text-muted/30">
                        {step.number}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-ink mb-2">
                          {step.title}
                        </h3>
                        <p className="text-slate leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-sm p-6">
                    <h4 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                      <CheckCircle className="text-gold" size={18} />
                      Key Tips
                    </h4>
                    <ul className="space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-slate flex items-start gap-2">
                          <ArrowRight className="text-gold shrink-0 mt-1" size={12} />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction Costs */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Transaction Costs to Budget For
            </h2>
            <p className="text-lg text-slate">
              Beyond the purchase price, plan for these additional costs (typically 10-15% extra).
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {costs.map((cost) => (
              <div
                key={cost.name}
                className="bg-warm-white rounded-sm border border-sand p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-ink">
                    {cost.name}
                  </h3>
                  <span className="text-gold font-semibold">
                    {cost.percentage}
                  </span>
                </div>
                <p className="text-slate text-sm">
                  {cost.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate">
              * Percentages are based on property value. Actual costs vary by location and transaction type.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Diaspora Investor FAQs"
        subtitle="Common questions from diaspora buyers investing in Nigerian property"
        items={faqs}
        className="bg-ivory"
      />

      {/* Related Reading */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <h2 className="font-display text-2xl font-semibold text-ink mb-8 text-center">
            Related Guides for Diaspora Investors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/guides/title-verification" className="p-6 bg-warm-white rounded-sm border border-sand hover:border-gold/30 transition-colors group">
              <h3 className="font-display font-semibold text-ink mb-2 group-hover:text-gold transition-colors">
                Title Verification Guide
              </h3>
              <p className="text-sm text-slate">
                Learn how to verify property titles and avoid documentation fraud in Nigeria.
              </p>
            </Link>
            <Link to="/guides/roi-methodology" className="p-6 bg-warm-white rounded-sm border border-sand hover:border-gold/30 transition-colors group">
              <h3 className="font-display font-semibold text-ink mb-2 group-hover:text-gold transition-colors">
                ROI Methodology
              </h3>
              <p className="text-sm text-slate">
                Understand how we calculate investment returns for Nigerian properties.
              </p>
            </Link>
            <Link to="/calculator" className="p-6 bg-warm-white rounded-sm border border-sand hover:border-gold/30 transition-colors group">
              <h3 className="font-display font-semibold text-ink mb-2 group-hover:text-gold transition-colors">
                ROI Calculator
              </h3>
              <p className="text-sm text-slate">
                Calculate potential returns on your Nigerian property investment.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
            Ready to Invest in Verified Nigerian Properties?
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Work with a team that serves diaspora investors with disciplined due diligence. 
            Every property we present has clean titles and documented ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/properties">Browse Verified Properties</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10" asChild>
              <Link to="/contact">Speak with a Consultant</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
