import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { JsonLd, createArticleSchema } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Calculator, 
  TrendingUp, 
  PieChart,
  Target,
  AlertCircle,
  Calendar,
  CheckCircle
} from "lucide-react";

const metrics = [
  {
    name: "Cap Rate (Capitalization Rate)",
    formula: "(Net Operating Income ÷ Property Value) × 100",
    description: "Measures the rate of return based on income the property generates. Higher cap rates indicate potentially higher returns but often come with more risk.",
    interpretation: "Nigerian properties typically range from 4-10%. Lagos prime areas often show 4-6%, while growth corridors may offer 7-10%.",
  },
  {
    name: "Cash-on-Cash Return",
    formula: "(Annual Cash Flow ÷ Total Cash Invested) × 100",
    description: "Shows the return on your actual cash investment, accounting for financing if applicable. More relevant than cap rate if you're using financing.",
    interpretation: "For cash purchases, this equals cap rate. Leverage can amplify returns (and losses), potentially pushing cash-on-cash to 12-20%+.",
  },
  {
    name: "Payback Period",
    formula: "Total Investment ÷ Net Annual Income",
    description: "How many years until your investment is fully recouped through rental income alone, not counting appreciation.",
    interpretation: "Nigerian rental yields typically result in 10-18 year payback periods. Shorter is better, but location quality matters for appreciation.",
  },
  {
    name: "Gross Rental Yield",
    formula: "(Annual Rent ÷ Property Price) × 100",
    description: "Simple measure of rental income relative to price, before expenses. Quick comparison metric but doesn't reflect true returns.",
    interpretation: "Lagos gross yields: 4-7% in prime, 6-10% in growth areas. Abuja similar. Mainland/emerging areas often higher but with more risk.",
  },
];

const assumptions = [
  {
    title: "Operating Expenses",
    items: [
      "Property management: 10% of gross rental income",
      "Maintenance reserve: 1-2% of property value annually",
      "Insurance: 0.3-0.5% of property value annually",
      "Property tax (where applicable): Varies by state",
    ],
  },
  {
    title: "Airbnb/Short-Term Calculations",
    items: [
      "Occupancy rates: Lagos typically 45-65%, Abuja 40-55%",
      "Seasonal variations factored into annual projections",
      "Higher management fees (15-20%) for short-term rentals",
      "Additional costs: cleaning, supplies, utilities",
    ],
  },
  {
    title: "What We Don't Include",
    items: [
      "Capital appreciation (uncertain, market-dependent)",
      "Financing costs (varies by buyer situation)",
      "Currency fluctuation for diaspora buyers",
      "Inflation adjustments to rental income",
    ],
  },
];

const faqs = [
  {
    question: "Why don't you include property appreciation in ROI calculations?",
    answer: "Capital appreciation is highly speculative and depends on factors outside anyone's control—infrastructure development, economic conditions, zoning changes, and market sentiment. We focus on rental income because it's measurable and more predictable. If appreciation happens, consider it a bonus.",
  },
  {
    question: "Are these projections guaranteed returns?",
    answer: "Absolutely not. These are estimates based on current market data and reasonable assumptions. Actual returns depend on tenant quality, vacancy periods, maintenance needs, and market conditions. Always stress-test projections with conservative assumptions.",
  },
  {
    question: "How do you estimate rental income for properties?",
    answer: "We research comparable rentals in the same area, consult with property managers, and review our own transaction data. We typically use mid-range estimates—not the highest asking rents, which often don't materialize.",
  },
  {
    question: "Should I rely only on rental yield for investment decisions?",
    answer: "No. Yield is one factor among many. Consider location quality, title security, infrastructure trajectory, exit liquidity, and your personal financial situation. A high-yield property in a poorly documented area is not a good investment.",
  },
  {
    question: "How accurate are Airbnb/short-term rental projections?",
    answer: "Short-term rental income is more volatile and location-dependent. Our estimates use conservative occupancy rates (45-55% in most Lagos areas). Actual performance depends heavily on property quality, marketing, and management quality.",
  },
  {
    question: "What's a 'good' cap rate in Nigeria?",
    answer: "It depends on location and risk profile. Prime Lagos (Ikoyi, VI) typically sees 4-6% cap rates—lower yields but more stable and liquid. Growth corridors (Lekki, Ajah) might offer 6-8%. Higher cap rates often come with higher risk.",
  },
];

export default function ROIMethodology() {
  return (
    <Layout>
      <SEOHead
        title="ROI Calculation Methodology for Nigerian Real Estate"
        description="Understand how Therizo calculates property returns. Learn about cap rates, cash-on-cash returns, and rental yields in the Nigerian real estate market."
        canonical="/guides/roi-methodology"
        keywords={[
          "Nigerian property ROI",
          "real estate cap rate Nigeria",
          "rental yield Lagos",
          "property investment returns Nigeria",
          "ROI calculation real estate",
          "Nigerian property investment analysis"
        ]}
        ogImage="https://therizo.com/og/og-roi-methodology.jpg"
      />
      <JsonLd data={createArticleSchema({
        headline: "ROI Calculation Methodology for Nigerian Real Estate Investments",
        description: "How we calculate and present property investment returns - cap rates, yields, and payback periods explained.",
        author: "Therizo Property and Development Corporation",
        datePublished: "2025-01-15",
        dateModified: "2025-12-15",
      })} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "ROI Methodology" },
            ]}
            className="mb-8 text-ivory/60"
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Calculator className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Investment Analysis</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              How We Calculate Property ROI
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Transparency is core to how we operate. This guide explains the methodology 
              behind our ROI calculator and property return projections, including 
              assumptions, limitations, and how to interpret the numbers.
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-ivory/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated: December 2025</span>
              </div>
              <span>•</span>
              <span>8 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Key Investment Metrics Explained
            </h2>
            <p className="text-lg text-slate">
              These are the core metrics we use to evaluate property investment potential.
            </p>
          </div>

          <div className="space-y-6">
            {metrics.map((metric) => (
              <div
                key={metric.name}
                className="bg-warm-white rounded-sm border border-sand p-8"
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink mb-2">
                      {metric.name}
                    </h3>
                    <div className="bg-muted rounded px-3 py-2 font-mono text-sm text-navy">
                      {metric.formula}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-2 flex items-center gap-2">
                      <PieChart className="text-gold" size={16} />
                      What It Measures
                    </h4>
                    <p className="text-slate text-sm leading-relaxed">
                      {metric.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink mb-2 flex items-center gap-2">
                      <TrendingUp className="text-gold" size={16} />
                      Nigerian Context
                    </h4>
                    <p className="text-slate text-sm leading-relaxed">
                      {metric.interpretation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assumptions */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Our Calculation Assumptions
            </h2>
            <p className="text-lg text-slate">
              Every projection relies on assumptions. Here's what we assume—and what we don't.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {assumptions.map((section) => (
              <div
                key={section.title}
                className="bg-warm-white rounded-sm border border-sand p-6"
              >
                <h3 className="font-display text-lg font-semibold text-ink mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate">
                      <CheckCircle className="text-gold shrink-0 mt-0.5" size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimer */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-sm p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-amber-600 shrink-0" size={24} />
                <div>
                  <h3 className="font-display text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3">
                    Important Disclaimer
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    All projections and calculations provided by Therizo are estimates for 
                    informational purposes only. They do not constitute financial advice, 
                    investment recommendations, or guarantees of future performance. Real estate 
                    investments carry risks including loss of capital, illiquidity, and market 
                    volatility. Always conduct your own due diligence and consult with qualified 
                    financial and legal advisors before making investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="ROI & Investment FAQs"
        subtitle="Common questions about property investment returns"
        items={faqs}
        className="bg-muted/50"
      />

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
            Run Your Own Numbers
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Use our ROI calculator to model potential returns for any property. 
            Input your own assumptions and see how different scenarios affect your returns.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/calculator">Open ROI Calculator</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
