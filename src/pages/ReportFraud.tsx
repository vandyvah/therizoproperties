import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
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
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, CheckCircle2, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reportSchema = z.object({
  reporter_name: z.string().trim().max(120).optional().or(z.literal("")),
  reporter_email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email" })
    .max(255)
    .optional()
    .or(z.literal("")),
  reporter_phone: z.string().trim().max(40).optional().or(z.literal("")),
  suspicious_channel: z.string().trim().max(30).optional().or(z.literal("")),
  suspicious_sender: z.string().trim().max(200).optional().or(z.literal("")),
  incident_details: z
    .string()
    .trim()
    .min(20, { message: "Please describe what happened (at least 20 characters)" })
    .max(4000),
  amount_requested_ngn: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

const channels = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call / SMS" },
  { value: "social", label: "Social media / DM" },
  { value: "in_person", label: "In person" },
  { value: "other", label: "Other" },
];

export default function ReportFraud() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    suspicious_channel: "",
    suspicious_sender: "",
    incident_details: "",
    amount_requested_ngn: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parsed = reportSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Please review your report",
        description:
          parsed.error.issues[0]?.message ?? "Some fields are invalid.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const amountNum = form.amount_requested_ngn
      ? Number(form.amount_requested_ngn.replace(/[^0-9.]/g, ""))
      : null;

    const { error } = await supabase.from("fraud_reports").insert({
      reporter_name: form.reporter_name || null,
      reporter_email: form.reporter_email || null,
      reporter_phone: form.reporter_phone || null,
      suspicious_channel: form.suspicious_channel || null,
      suspicious_sender: form.suspicious_sender || null,
      incident_details: form.incident_details,
      amount_requested_ngn: amountNum && !Number.isNaN(amountNum) ? amountNum : null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not submit report",
        description:
          "Please try again, or email hello@therizoproperties.com directly.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Report received",
      description: "Our team will review it and follow up if we need more details.",
    });
  };

  return (
    <Layout>
      <SEOHead
        title="Report Suspicious Contact or Scam Attempt"
        description="Report a suspicious message, call, or payment request claiming to be from Therizo Properties. Our team reviews every report and follows up when needed."
        canonicalUrl="/report-fraud"
        noindex
      />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-navy">
        <div className="container-wide px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <ShieldAlert className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Report Fraud</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Report a scam or suspicious contact
            </h1>
            <p className="text-base sm:text-lg text-ivory/80 leading-relaxed">
              If someone has contacted you claiming to represent Therizo — or
              requested payment to a personal account — please tell us. Every
              report is reviewed by a senior member of our team.
            </p>
          </div>
        </div>
      </section>

      {/* Form / Success */}
      <section className="py-12 sm:section-padding bg-ivory">
        <div className="container-wide px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <Card className="border-emerald-500/30 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <CheckCircle2
                    className="mx-auto mb-4 h-12 w-12 text-emerald-700"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-2xl font-semibold text-ink mb-3">
                    Thank you — your report was received
                  </h2>
                  <p className="text-slate mb-6">
                    A senior member of our team will review it. If we need
                    additional details, we will contact you using the details
                    you provided. In the meantime, do not send any funds and do
                    not share personal or banking information with the
                    suspicious sender.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button asChild variant="gold">
                      <Link to="/">Return home</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="mailto:hello@therizoproperties.com">
                        <Mail className="mr-2 h-4 w-4" />
                        Email us directly
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-sand shadow-md bg-warm-white">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-sm text-slate mb-6">
                    All fields except the incident description are optional,
                    but leaving your email or phone number lets us follow up if
                    we need more information.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reporter_name" className="mb-2 block text-sm">
                          Your name
                        </Label>
                        <Input
                          id="reporter_name"
                          value={form.reporter_name}
                          onChange={(e) =>
                            handleChange("reporter_name", e.target.value)
                          }
                          maxLength={120}
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reporter_email" className="mb-2 block text-sm">
                          Your email
                        </Label>
                        <Input
                          id="reporter_email"
                          type="email"
                          value={form.reporter_email}
                          onChange={(e) =>
                            handleChange("reporter_email", e.target.value)
                          }
                          maxLength={255}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reporter_phone" className="mb-2 block text-sm">
                          Your phone (optional)
                        </Label>
                        <Input
                          id="reporter_phone"
                          value={form.reporter_phone}
                          onChange={(e) =>
                            handleChange("reporter_phone", e.target.value)
                          }
                          maxLength={40}
                          autoComplete="tel"
                        />
                      </div>
                      <div>
                        <Label htmlFor="suspicious_channel" className="mb-2 block text-sm">
                          How did they contact you?
                        </Label>
                        <Select
                          value={form.suspicious_channel}
                          onValueChange={(v) =>
                            handleChange("suspicious_channel", v)
                          }
                        >
                          <SelectTrigger id="suspicious_channel">
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {channels.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="suspicious_sender" className="mb-2 block text-sm">
                        Suspicious sender (phone number, email, handle, etc.)
                      </Label>
                      <Input
                        id="suspicious_sender"
                        value={form.suspicious_sender}
                        onChange={(e) =>
                          handleChange("suspicious_sender", e.target.value)
                        }
                        maxLength={200}
                        placeholder="e.g. +234 812 000 0000 or fake@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount_requested_ngn" className="mb-2 block text-sm">
                        Amount they asked for (₦, optional)
                      </Label>
                      <Input
                        id="amount_requested_ngn"
                        inputMode="numeric"
                        value={form.amount_requested_ngn}
                        onChange={(e) =>
                          handleChange("amount_requested_ngn", e.target.value)
                        }
                        placeholder="e.g. 500000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="incident_details" className="mb-2 block text-sm">
                        What happened? *
                      </Label>
                      <Textarea
                        id="incident_details"
                        value={form.incident_details}
                        onChange={(e) =>
                          handleChange("incident_details", e.target.value)
                        }
                        required
                        minLength={20}
                        maxLength={4000}
                        rows={6}
                        placeholder="Describe the message, request, or interaction. Paste any messages verbatim if you can."
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        disabled={submitting}
                        className="w-full sm:w-auto"
                      >
                        {submitting ? "Submitting..." : "Submit report"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Direct contact */}
            <div className="mt-8 text-center text-sm text-slate">
              <p className="mb-2">
                Prefer to reach us directly? Both go to the same team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:hello@therizoproperties.com"
                  className="inline-flex items-center gap-2 text-navy hover:text-gold"
                >
                  <Mail className="h-4 w-4" />
                  hello@therizoproperties.com
                </a>
                <a
                  href="tel:+2348034830087"
                  className="inline-flex items-center gap-2 text-navy hover:text-gold"
                >
                  <Phone className="h-4 w-4" />
                  +234 803 483 0087
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
