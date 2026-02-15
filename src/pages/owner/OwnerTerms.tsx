import { OwnerLayout } from "@/components/owner/OwnerLayout";

export default function OwnerTerms() {
  return (
    <OwnerLayout>
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm">
          <h1 className="font-display text-3xl font-bold text-[#0E1626]">Terms of Service</h1>
          <p className="text-[#6B7280]">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Service Overview</h2>
          <p>Thérizo Properties provides real estate advisory, marketing, and transaction support services for property owners in Nigeria. Our services include property audits, pricing strategy, marketing campaigns, and buyer engagement.</p>

          <h2>No Guarantee of Sale</h2>
          <p>While we employ rigorous methodology and proven strategies, we do not guarantee the sale of any property within any specific timeframe. Market conditions, pricing, and other factors influence outcomes.</p>

          <h2>Property Submissions</h2>
          <p>By submitting property details through our platform, you confirm that you are the legal owner or authorized representative of the property, and that the information provided is accurate to the best of your knowledge.</p>

          <h2>Confidentiality</h2>
          <p>All property details, pricing, and owner information shared with Thérizo Properties are treated as confidential and used solely for the purpose of evaluating and marketing the property.</p>

          <h2>Commission & Fees</h2>
          <p>Commission rates and any applicable fees will be agreed upon in writing before any marketing or sales activity begins. No fees are charged for initial audits or consultations.</p>

          <h2>Limitation of Liability</h2>
          <p>Thérizo Properties shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or this platform.</p>

          <h2>Contact</h2>
          <p>For questions about these terms, contact Thérizo Properties via WhatsApp or email at info@therizoproperties.com.</p>
        </div>
      </section>
    </OwnerLayout>
  );
}
