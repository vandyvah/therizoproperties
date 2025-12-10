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

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Enquiry Submitted",
      description:
        "Thank you for your message. A senior consultant will review your request and respond shortly.",
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-primary">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                <MessageSquare className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Get in Touch</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary-foreground mb-6">
              Contact Therizo
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Tell us what you are looking for and where you are in your
              property journey. A senior consultant will review your message and
              respond with next steps, usually within a reasonable time window
              depending on volume and time zones.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-therizo-md">
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
              <Card className="border-border">
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
                      href="tel:+2341234567890"
                      className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Phone size={18} className="text-gold" />
                      </div>
                      <span>+234 123 456 7890</span>
                    </a>
                    <a
                      href="mailto:hello@therizo.com"
                      className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Mail size={18} className="text-gold" />
                      </div>
                      <span>hello@therizo.com</span>
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                    Please share your name, location, and a short summary of
                    what you need before the call, so we can prepare.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Where We Operate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
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
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
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

      {/* Closing CTA */}
      <section className="section-padding bg-cream-dark">
        <div className="container-narrow text-center">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Real estate decisions carry weight.
          </p>
          <p className="text-xl text-foreground font-medium">
            If you want clear answers, realistic numbers, and properties that
            can stand scrutiny, we are ready to speak with you.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
