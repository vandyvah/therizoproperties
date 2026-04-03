import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { WhoWeServeSection } from "@/components/home/WhoWeServeSection";
import { WhyTherizoSection } from "@/components/home/WhyTherizoSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { ElitePropertyCarousel } from "@/components/home/ElitePropertyCarousel";
import { ROITeaserSection } from "@/components/home/ROITeaserSection";
import { OurStandardSection } from "@/components/home/OurStandardSection";
import { TeamPreviewSection } from "@/components/home/TeamPreviewSection";
import { CTASection } from "@/components/home/CTASection";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema, createRealEstateAgentSchema, createFAQSchema, createWebSiteSchema, createSpeakableSchema } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";

const homeFAQs = [
  {
    question: "What makes Therizo different from other Nigerian real estate agencies?",
    answer: "Therizo is a boutique property firm that prioritizes verified documentation, transparent pricing, and disciplined due diligence. We reject listings we cannot defend and focus on quality over volume, serving serious buyers and investors who demand accountability."
  },
  {
    question: "Does Therizo work with diaspora investors?",
    answer: "Yes. We specialize in serving diaspora clients across the UK, Europe, North America, and the Middle East who need a trusted local partner for property acquisition, management, and investment in Nigeria."
  },
  {
    question: "How does Therizo verify property titles in Nigeria?",
    answer: "We conduct thorough title verification through our legal partners, checking ownership history, Certificate of Occupancy (C of O), survey plans, and relevant land registry records before listing any property."
  },
  {
    question: "What types of properties does Therizo offer?",
    answer: "We offer curated residential and commercial properties in Lagos, Abuja, Port Harcourt, and select growth corridors—including luxury apartments, family homes, investment flats, and development opportunities."
  },
  {
    question: "Can I calculate potential returns on Nigerian property investments?",
    answer: "Yes. Our free ROI Calculator helps you estimate rental yields, cap rates, and payback periods for both long-term rental and Airbnb strategies using current Nigerian market data."
  }
];

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Verified Nigerian Properties for Diaspora Investors | Therizo"
        description="Verified Nigerian properties with clean titles and documented ownership. Therizo serves diaspora investors across Lagos, Abuja, and Port Harcourt with transparent numbers and disciplined due diligence."
        keywords="verified Nigerian properties, diaspora investors, Nigerian real estate, clean title Nigeria, documented ownership, diaspora property investment, Lagos property, Abuja real estate, Port Harcourt property"
        canonicalUrl="/"
        ogImage="https://therizoproperties.com/og/og-home.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />
      <JsonLd data={createRealEstateAgentSchema()} />
      <JsonLd data={createWebSiteSchema()} />
      <JsonLd data={createSpeakableSchema(["h1", ".hero-description", ".faq-section"])} />
      <JsonLd data={createFAQSchema(homeFAQs)} />
      
      <HeroSection />
      <WhoWeServeSection />
      <WhyTherizoSection />
      <ElitePropertyCarousel />
      <FeaturedPropertiesSection />
      <ROITeaserSection />
      <OurStandardSection />
      <TeamPreviewSection />
      
      {/* FAQ Section for SEO */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate">
              Common questions about investing in Nigerian real estate with Therizo.
            </p>
          </div>
          <FAQSection faqs={homeFAQs} />
        </div>
      </section>
      
      <CTASection />
    </Layout>
  );
};

export default Index;
