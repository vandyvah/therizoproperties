import { OwnerLayout } from "@/components/owner/OwnerLayout";

export default function OwnerPrivacy() {
  return (
    <OwnerLayout>
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm">
          <h1 className="font-display text-3xl font-bold text-[#0E1626]">Privacy Policy</h1>
          <p className="text-[#6B7280]">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Information We Collect</h2>
          <p>When you submit property details through our form, we collect your name, phone number, email address, and property information. This data is used solely to evaluate your property and communicate with you about our services.</p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To respond to your property submission and provide a valuation or audit</li>
            <li>To communicate with you about our services via WhatsApp, phone, or email</li>
            <li>To improve our services and user experience</li>
          </ul>

          <h2>Data Storage & Security</h2>
          <p>Your information is stored securely using industry-standard encryption. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

          <h2>Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us via WhatsApp or email.</p>

          <h2>Contact</h2>
          <p>For privacy-related inquiries, please contact Thérizo Properties via WhatsApp or email at info@therizoproperties.com.</p>
        </div>
      </section>
    </OwnerLayout>
  );
}
