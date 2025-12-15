import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FAQSection } from "@/components/seo/FAQSection";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  FileSearch, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Scale,
  Building,
  Calendar
} from "lucide-react";

const verificationSteps = [
  {
    icon: FileSearch,
    title: "Document Collection",
    description: "We request and collect all relevant title documents from the seller, including Certificate of Occupancy (C of O), Deed of Assignment, Survey Plans, and building approvals where applicable.",
  },
  {
    icon: Scale,
    title: "Legal Review",
    description: "Our legal partners conduct a thorough review of all documents, checking for authenticity, encumbrances, and any legal disputes or claims against the property.",
  },
  {
    icon: Building,
    title: "Government Verification",
    description: "We verify documents with relevant government agencies including the Land Registry, Survey Department, and Physical Planning Authority to confirm legitimacy.",
  },
  {
    icon: CheckCircle,
    title: "Final Certification",
    description: "Properties that pass all checks receive our verification badge. Those with issues are either rejected or flagged with specific risk advisories.",
  },
];

const documentTypes = [
  {
    name: "Certificate of Occupancy (C of O)",
    description: "The highest form of land ownership in Nigeria, issued by state governments. Valid for 99 years from date of issue.",
    importance: "Critical",
  },
  {
    name: "Deed of Assignment",
    description: "Legal document transferring ownership rights from seller to buyer. Must be properly executed and stamped.",
    importance: "Critical",
  },
  {
    name: "Survey Plan",
    description: "Detailed map showing property boundaries, dimensions, and location coordinates approved by the Surveyor General.",
    importance: "Critical",
  },
  {
    name: "Governor's Consent",
    description: "Required for transfer of property with C of O. Without this, subsequent transactions may be void.",
    importance: "Critical",
  },
  {
    name: "Building Approval",
    description: "Permission from physical planning authority for construction. Essential for developed properties.",
    importance: "Important",
  },
  {
    name: "Tax Clearance",
    description: "Proof that all land use charges and property taxes have been paid up to date.",
    importance: "Important",
  },
];

const commonRedFlags = [
  "Seller unable to produce original documents",
  "Property under litigation or court injunction",
  "Multiple parties claiming ownership",
  "Documents with inconsistent property descriptions",
  "Expired or forged government approvals",
  "Land in government-acquired areas without proper compensation",
  "Family land without proper family consent documentation",
  "Excision issues in developing areas",
];

const faqs = [
  {
    question: "What is a Certificate of Occupancy (C of O) and why is it important?",
    answer: "A Certificate of Occupancy is the most recognized proof of land ownership in Nigeria, issued by state governments under the Land Use Act of 1978. It grants the holder rights to use and occupy the land for 99 years. Without a C of O, your ownership claim may be challenged, and you cannot use the property as collateral for bank loans.",
  },
  {
    question: "How long does the title verification process take?",
    answer: "Our standard verification process takes 2-4 weeks, depending on document complexity and government agency response times. For properties with clear documentation, it can be faster. We provide regular updates throughout the process.",
  },
  {
    question: "What happens if verification reveals problems with the title?",
    answer: "If we discover issues, we immediately inform you with a detailed report. Minor issues may be resolvable through additional documentation or legal processes. Major issues like fraud or litigation typically result in us advising you to walk away from the deal.",
  },
  {
    question: "Do I still need my own lawyer if Therizo verifies the property?",
    answer: "Yes, we strongly recommend engaging your own legal counsel for final review and transaction documentation. Our verification is a comprehensive pre-screening that saves time and filters out problematic properties, but your lawyer provides independent protection of your specific interests.",
  },
  {
    question: "What's the difference between a Deed of Assignment and a C of O?",
    answer: "A Deed of Assignment is a private contract between buyer and seller transferring ownership rights. A C of O is a government-issued document confirming your right to occupy the land. The Deed is step one; obtaining C of O or Governor's Consent perfects your title officially.",
  },
  {
    question: "Can I buy land without Governor's Consent?",
    answer: "Technically yes, but it's risky. The Land Use Act requires Governor's Consent for valid transfer of land with existing C of O. Without it, you own the property but cannot legally transfer it to others, and the transaction can be voided in certain circumstances.",
  },
];

export default function TitleVerification() {
  return (
    <Layout>
      <SEOHead
        title="Property Title Verification in Nigeria: Complete Guide"
        description="Learn how Therizo verifies Nigerian property titles. Understand C of O, Deed of Assignment, Survey Plans, and red flags to avoid. Protect your real estate investment."
        canonical="/guides/title-verification"
        keywords={[
          "Nigerian property title verification",
          "C of O verification Lagos",
          "land title search Nigeria",
          "property due diligence Nigeria",
          "Certificate of Occupancy Nigeria",
          "deed of assignment verification",
          "land registry search Nigeria"
        ]}
      />
      <ArticleJsonLd
        data={{
          headline: "How We Verify Nigerian Property Titles: A Complete Guide",
          description: "Comprehensive guide to property title verification in Nigeria, including document requirements, verification process, and common red flags.",
          author: "Therizo Property and Development Corporation",
          datePublished: "2025-01-15",
          dateModified: "2025-12-15",
        }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs
            items={[
              { label: "Guides", href: "/guides" },
              { label: "Title Verification" },
            ]}
            className="mb-8 text-ivory/60"
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Shield className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Property Due Diligence</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              How We Verify Nigerian Property Titles
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Nigerian real estate requires careful title verification before any purchase. 
              This guide explains our verification process, the documents we check, and 
              the red flags that protect you from fraudulent or disputed properties.
            </p>
            <div className="flex items-center gap-4 mt-6 text-sm text-ivory/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated: December 2025</span>
              </div>
              <span>•</span>
              <span>12 min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Our 4-Step Verification Process
            </h2>
            <p className="text-lg text-slate">
              Every property listed on Therizo undergoes this rigorous verification 
              before it reaches our clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {verificationSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-warm-white rounded-sm border border-sand p-6 hover:shadow-md transition-all"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <step.icon className="text-gold" size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-3">
                  {step.title}
                </h3>
                <p className="text-slate text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Essential Documents */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Essential Title Documents in Nigeria
            </h2>
            <p className="text-lg text-slate">
              Understanding these documents is crucial for any property purchase in Nigeria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((doc) => (
              <div
                key={doc.name}
                className="bg-warm-white rounded-sm border border-sand p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText className="text-navy" size={24} />
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      doc.importance === "Critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-gold/10 text-gold-dark"
                    }`}
                  >
                    {doc.importance}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">
                  {doc.name}
                </h3>
                <p className="text-slate text-sm leading-relaxed">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
                Red Flags We Watch For
              </h2>
              <p className="text-lg text-slate leading-relaxed mb-8">
                Years of experience have taught us to recognize warning signs 
                that indicate potential problems with a property's title. If we 
                spot these issues, we either walk away or advise extreme caution.
              </p>
              <ul className="space-y-3">
                {commonRedFlags.map((flag) => (
                  <li key={flag} className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
                    <span className="text-ink">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="bg-navy rounded-sm p-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <Shield className="text-gold" size={32} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-ivory text-center mb-4">
                  Our Commitment
                </h3>
                <p className="text-ivory/80 text-center leading-relaxed">
                  We would rather lose a listing than expose a client to a 
                  problematic property. Every property we present has passed 
                  our verification standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        title="Title Verification FAQs"
        subtitle="Common questions about property title verification in Nigeria"
        items={faqs}
        className="bg-muted/50"
      />

      {/* CTA */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-6">
            Ready to Buy with Confidence?
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-10 max-w-2xl mx-auto">
            Every property in our portfolio has been verified using this process. 
            Start your property search with peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/properties">View Verified Properties</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10" asChild>
              <Link to="/our-standard">Learn Our Standards</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
