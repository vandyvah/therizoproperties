import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema, createFAQSchema } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const contactFAQs = [
  {
    question: "How quickly does Therizo respond to enquiries?",
    answer: "We acknowledge all enquiries within the same business day when possible. A senior consultant will review your request and respond with next steps, typically within 24-48 hours depending on volume and time zones."
  },
  {
    question: "Can I schedule a property viewing before visiting Nigeria?",
    answer: "Yes. We offer virtual property tours and can coordinate in-person viewings to align with your travel schedule. Our concierge service also includes airport pickup for serious buyers."
  },
  {
    question: "Does Therizo charge consultation fees?",
    answer: "Initial consultations are complimentary. We operate on a commission basis when transactions are completed, ensuring our interests are aligned with yours."
  },
  {
    question: "What information should I prepare before contacting Therizo?",
    answer: "Please share your budget range, preferred locations, property type, and timeline. This helps us match you with suitable properties and assign the right consultant to your needs."
  }
];

const clientTypes = ["Buyer", "Seller", "Investor / Developer", "Landowner", "Other"];

const locations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ogun State",
  "Ibadan",
  "Enugu",
  "Other",
];

const operatingLocations = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Select growth corridors in other states",
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const clientType = formData.get("clientType") as string;
    const budget = formData.get("budget") as string;
    const preferredLocation = formData.get("preferredLocation") as string;
    const message = formData.get("message") as string;

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name,
        email,
        phone: phone || null,
        client_type: clientType || null,
        budget: budget || null,
        preferred_location: preferredLocation || null,
        message,
        page: "contact",
      });

      if (error) throw error;

      toast({
        title: "Enquiry Submitted",
        description:
          "Thank you for your message. A senior consultant will review your request and respond shortly.",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your enquiry. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Contact Therizo | Nigerian Property Consultation & Enquiries"
        description="Get in touch with Therizo for Nigerian real estate consultation. Speak with senior property consultants in Lagos, Abuja & Port Harcourt. Same-day response for serious buyers."
        keywords="contact Nigerian real estate agent, Lagos property consultant, Abuja real estate enquiry, diaspora property investment help, Nigerian property consultation"
        canonicalUrl="/contact"
        ogImage="https://therizoproperties.com/og/og-contact.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />
      <JsonLd data={createFAQSchema(contactFAQs)} />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Contact", href: "/contact" }]} />
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <MessageSquare className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Get in Touch</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Contact Therizo
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Tell us what you are looking for and where you are in your
              property journey. A senior consultant will review your message and
              respond with next steps, usually within a reasonable time window
              depending on volume and time zones.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-sand shadow-md bg-warm-white">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName" className="mb-2 block">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="mb-2 block">
                          Phone / WhatsApp Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+234..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientType" className="mb-2 block">
                          Are You *
                        </Label>
                        <Select name="clientType" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="budget" className="mb-2 block">
                          Budget Range (₦)
                        </Label>
                        <Input
                          id="budget"
                          name="budget"
                          placeholder="e.g., 100M - 200M"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredLocation" className="mb-2 block">
                          Preferred Location(s)
                        </Label>
                        <Select name="preferredLocation">
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="mb-2 block">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Briefly describe what you need and your timeline."
                        rows={5}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full md:w-auto"
                    >
                      {isSubmitting ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send size={18} className="mr-2" />
                          Submit Enquiry
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="border-sand bg-warm-white">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Prefer to Speak Directly?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    If you would rather talk first, you can reach us via:
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:+2348034830087"
                      className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Phone size={18} className="text-gold" />
                      </div>
                      <span>+234 803 483 0087</span>
                    </a>
                    <a
                      href="mailto:hello@therizoproperties.com"
                      className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Mail size={18} className="text-gold" />
                      </div>
                      <span>hello@therizoproperties.com</span>
                    </a>
                  </div>
                  <p className="text-xs text-slate pt-4 border-t border-sand">
                    Please share your name, location, and a short summary of
                    what you need before the call, so we can prepare.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-sand bg-warm-white">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Where We Operate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate mb-4">
                    Therizo is focused on Nigeria, with core activity in:
                  </p>
                  <ul className="space-y-2">
                    {operatingLocations.map((loc) => (
                      <li
                        key={loc}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <MapPin
                          size={16}
                          className="text-gold shrink-0 mt-0.5"
                        />
                        <span>{loc}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate mt-4 pt-4 border-t border-sand">
                    We also serve diaspora clients across the UK, Europe, North
                    America, and the Middle East who need a disciplined local
                    partner.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-4">
              Contact FAQs
            </h2>
          </div>
          <FAQSection faqs={contactFAQs} />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-padding bg-ivory">
        <div className="container-narrow text-center">
          <p className="text-lg text-slate leading-relaxed mb-6">
            Real estate decisions carry weight.
          </p>
          <p className="text-xl text-ink font-medium">
            If you want clear answers, realistic numbers, and properties that
            can stand scrutiny, we are ready to speak with you.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
