import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { getWhatsAppUrl, OWNER_NAME, trackEvent } from "@/lib/owner-config";

const schema = z.object({
  owner_name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(8, "Phone is required").max(30),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  area: z.string().max(200).optional(),
  property_type: z.string().min(1, "Property type is required"),
  bedrooms: z.string().max(20).optional(),
  plot_size: z.string().max(100).optional(),
  asking_price: z.string().trim().min(1, "Asking price is required").max(50),
  title_status: z.string().optional(),
  is_tenanted: z.string().optional(),
  can_inspect_this_week: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["Your Details", "Property Info", "Final Details"];

export default function SubmitProperty() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      owner_name: "", phone: "", email: "", city: "", area: "",
      property_type: "", bedrooms: "", plot_size: "", asking_price: "",
      title_status: "", is_tenanted: "", can_inspect_this_week: "", notes: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form;

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      ["owner_name", "phone", "email"],
      ["city", "property_type", "asking_price"],
      ["title_status"],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    trackEvent("submit_property_start");
    try {
      const insertData = {
        owner_name: data.owner_name,
        phone: data.phone,
        email: data.email || null,
        city: data.city,
        area: data.area || null,
        property_type: data.property_type,
        bedrooms: data.bedrooms || null,
        plot_size: data.plot_size || null,
        asking_price: data.asking_price,
        title_status: data.title_status || null,
        is_tenanted: data.is_tenanted === "yes" ? true : data.is_tenanted === "no" ? false : null,
        can_inspect_this_week: data.can_inspect_this_week === "yes" ? true : data.can_inspect_this_week === "no" ? false : null,
        notes: data.notes || null,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("property_submissions").insert(insertData);
      if (error) throw error;
      setSubmittedData(data);
      setSubmitted(true);
      trackEvent("submit_property_complete");
    } catch (err) {
      console.error("Submission error:", err);
    }
    setSubmitting(false);
  };

  if (submitted && submittedData) {
    const msg = `Hello ${OWNER_NAME}, I just submitted my property details.\n\nName: ${submittedData.owner_name}\nCity: ${submittedData.city}\nType: ${submittedData.property_type}\nPrice: ${submittedData.asking_price}\nTitle: ${submittedData.title_status || "Not specified"}`;
    return (
      <OwnerLayout>
        <section className="py-20 sm:py-32">
          <div className="max-w-lg mx-auto px-4 text-center space-y-6">
            <CheckCircle className="mx-auto h-16 w-16 text-[#25D366]" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0E1626]">Submission Received!</h1>
            <p className="text-[#6B7280]">Thank you, {submittedData.owner_name}. Our team will review your property details within 24 hours.</p>
            <a href={getWhatsAppUrl(msg)} target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold px-8 py-3 text-base w-full sm:w-auto">
                <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp {OWNER_NAME} Now
              </Button>
            </a>
            <p className="text-xs text-[#9CA3AF]">For the fastest response, send a WhatsApp message with your details.</p>
          </div>
        </section>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout>
      <section className="py-12 sm:py-20">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0E1626]">Submit Your Property</h1>
            <p className="text-[#6B7280] text-sm mt-2">Fill in your details and we'll get back to you within 24 hours.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${i <= step ? "bg-[#C8A24A] text-[#0E1626]" : "bg-[#D8D1C5]/40 text-[#9CA3AF]"}`}>{i + 1}</div>
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-[#C8A24A]" : "bg-[#D8D1C5]"}`} />}
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-[#0E1626] mb-6">{STEPS[step]}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Step 1 */}
            {step === 0 && (
              <>
                <Field label="Full Name *" error={errors.owner_name?.message}>
                  <Input {...register("owner_name")} placeholder="Your full name" />
                </Field>
                <Field label="Phone / WhatsApp *" error={errors.phone?.message}>
                  <Input {...register("phone")} placeholder="+234..." />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <Input {...register("email")} type="email" placeholder="your@email.com" />
                </Field>
              </>
            )}

            {/* Step 2 */}
            {step === 1 && (
              <>
                <Field label="City *" error={errors.city?.message}>
                  <Select onValueChange={(v) => setValue("city", v)} value={watch("city")}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lagos">Lagos</SelectItem>
                      <SelectItem value="Abuja">Abuja</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Area / Neighborhood / Estate">
                  <Input {...register("area")} placeholder="e.g. Lekki Phase 1, Ikoyi" />
                </Field>
                <Field label="Property Type *" error={errors.property_type?.message}>
                  <Select onValueChange={(v) => setValue("property_type", v)} value={watch("property_type")}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Land", "Duplex", "Semi-Detached", "Terrace", "Apartment/Flat", "Commercial", "Other"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bedrooms">
                    <Input {...register("bedrooms")} placeholder="e.g. 4" />
                  </Field>
                  <Field label="Plot Size / Floor Area">
                    <Input {...register("plot_size")} placeholder="e.g. 650sqm" />
                  </Field>
                </div>
                <Field label="Asking Price (₦) *" error={errors.asking_price?.message}>
                  <Input {...register("asking_price")} placeholder="e.g. 150,000,000" />
                </Field>
              </>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <>
                <Field label="Title Status">
                  <Select onValueChange={(v) => setValue("title_status", v)} value={watch("title_status")}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {["C of O", "Governor's Consent", "Deed of Assignment", "Survey Plan", "Not Sure"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Is property tenanted?">
                  <Select onValueChange={(v) => setValue("is_tenanted", v)} value={watch("is_tenanted")}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Can we inspect this week?">
                  <Select onValueChange={(v) => setValue("can_inspect_this_week", v)} value={watch("can_inspect_this_week")}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Notes">
                  <Textarea {...register("notes")} placeholder="Any additional details about your property..." rows={4} />
                </Field>
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1 border-[#D8D1C5]">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
              {step < 2 ? (
                <Button type="button" onClick={nextStep} className="flex-1 bg-[#0E1626] hover:bg-[#1a2a40] text-white">
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting} className="flex-1 bg-[#C8A24A] text-[#0E1626] hover:bg-[#b8923a] font-semibold">
                  <Send className="h-4 w-4 mr-2" /> {submitting ? "Submitting..." : "Submit Property"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </section>
    </OwnerLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[#374151]">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
