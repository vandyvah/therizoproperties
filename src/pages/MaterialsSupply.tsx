import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQSection } from "@/components/seo/FAQSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle,
  Truck,
  FileText,
  Clock,
  Plus,
  Trash2,
  MessageCircle,
  Upload,
  Package,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

const materialCategories = [
  "Sand",
  "Gravel",
  "Cement",
  "Iron-Rebar",
  "Blocks",
  "Granite",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Finishing",
  "Other",
];

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(1, "Please select your role"),
  company_name: z.string().optional(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  site_location: z.string().min(5, "Please provide the site location"),
  delivery_timeline: z.string().min(1, "Please select delivery timeline"),
  request_type: z.string().min(1, "Please select request type"),
  boq_file: z.any().optional(),
  items: z.array(z.object({
    category: z.string().min(1, "Select category"),
    specification: z.string().min(1, "Enter specification"),
    quantity_unit: z.string().min(1, "Enter quantity"),
    notes: z.string().optional(),
  })).optional(),
  access_constraints: z.string().optional(),
  payment_preference: z.string().min(1, "Please select payment preference"),
});

type FormValues = z.infer<typeof formSchema>;

const faqs = [
  {
    question: "Do you deliver to site?",
    answer: "Yes. We deliver directly to your construction site with proper documentation. Delivery scheduling is coordinated based on your project timeline and site accessibility.",
  },
  {
    question: "Can I send a BOQ?",
    answer: "Absolutely. You can upload your Bill of Quantities (PDF, JPG, or PNG) directly through our form. We review BOQs and respond with a comprehensive quote covering all listed items.",
  },
  {
    question: "What locations do you cover?",
    answer: "We currently serve construction sites across Abuja, Lagos, and Port Harcourt. For sites in other locations, submit a request and we will confirm coverage and logistics.",
  },
  {
    question: "Do you handle bulk supply?",
    answer: "Yes. We support bulk orders for cement, sand, gravel, and iron/rebar. Volume discounts may apply for large quantities. Contact us with your requirements for custom pricing.",
  },
  {
    question: "What info do you need for accurate quotes?",
    answer: "We need: material grade/specification, exact quantities with units, delivery location, and timeline. Incomplete specs delay processing. Upload a BOQ if available for faster turnaround.",
  },
];

export default function MaterialsSupply() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappSummary, setWhatsappSummary] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      role: "",
      company_name: "",
      phone: "",
      email: "",
      site_location: "",
      delivery_timeline: "",
      request_type: "",
      access_constraints: "",
      payment_preference: "",
      items: [{ category: "", specification: "", quantity_unit: "", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const requestType = form.watch("request_type");

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let boqFileUrl = null;

      // Upload BOQ file if provided
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("boq-files")
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from("boq-files")
          .getPublicUrl(fileName);
        
        boqFileUrl = urlData.publicUrl;
      }

      // Insert main request
      const { data: requestData, error: requestError } = await supabase
        .from("material_requests")
        .insert({
          full_name: data.full_name,
          role: data.role,
          company_name: data.company_name || null,
          phone: data.phone,
          email: data.email || null,
          site_location: data.site_location,
          delivery_timeline: data.delivery_timeline,
          request_type: data.request_type,
          boq_file_url: boqFileUrl,
          access_constraints: data.access_constraints || null,
          payment_preference: data.payment_preference,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Insert items if request type is list items
      if (data.request_type === "list_items" && data.items && data.items.length > 0) {
        const validItems = data.items.filter(
          (item) => item.category && item.specification && item.quantity_unit
        );
        
        if (validItems.length > 0) {
          const { error: itemsError } = await supabase
            .from("material_request_items")
            .insert(
              validItems.map((item) => ({
                request_id: requestData.id,
                category: item.category,
                specification: item.specification,
                quantity_unit: item.quantity_unit,
                notes: item.notes || null,
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      // Generate WhatsApp summary
      const itemsSummary = data.items
        ?.filter((i) => i.category && i.specification)
        .map((i) => `${i.category}: ${i.specification} (${i.quantity_unit})`)
        .join("; ");

      const summary = `Request from ${data.full_name} (${data.role})
Site: ${data.site_location}
Timeline: ${data.delivery_timeline}
${data.request_type === "boq" ? "BOQ attached" : `Items: ${itemsSummary || "See form"}`}
Payment: ${data.payment_preference}`;

      setWhatsappSummary(summary);
      setIsSuccess(true);
      toast.success("Request submitted successfully!");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappPrefilledMessage = useMemo(() => {
    const baseMessage = `Hello Therizo Properties. I need a quote for building materials supply.
Site location: ____
Timeline: ____
BOQ attached / Items listed: ____`;
    return encodeURIComponent(baseMessage);
  }, []);

  if (isSuccess) {
    return (
      <Layout>
        <SEOHead
          title="Request Submitted | Therizo Properties"
          description="Your material supply request has been received."
        />
        <div className="min-h-screen bg-background pt-24 pb-16">
          <div className="container-narrow text-center">
            <div className="bg-card border rounded-xl p-8 md:p-12">
              <CheckCircle className="h-16 w-16 text-emerald mx-auto mb-6" />
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Request Received
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                If your specs are complete, we respond with a quote and schedule. 
                Incomplete specs delay processing.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6 text-left mb-8">
                <h3 className="font-semibold text-foreground mb-3">WhatsApp-Ready Summary:</h3>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-body">
                  {whatsappSummary}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    setIsSuccess(false);
                    form.reset();
                    setUploadedFile(null);
                  }}
                >
                  Submit Another Request
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a
                    href={`https://wa.me/2348034830087?text=${encodeURIComponent(whatsappSummary)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Share via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Building Materials Supply in Abuja | Therizo Properties"
        description="Sand, gravel, cement, iron/rebar, and contractor-requested building materials delivered to site with verified specs and reliable scheduling."
        canonical="/materials-supply"
        ogImage="/og/og-materials-supply.jpg"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Building Materials Supply",
          description: "Verified building materials supply for contractors, developers, and site engineers in Nigeria",
          provider: {
            "@type": "Organization",
            name: "Therizo Property and Development Corporation",
          },
          areaServed: ["Abuja", "Lagos", "Port Harcourt"],
          serviceType: "Building Materials Supply",
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-navy pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-ivory mb-6 leading-tight">
              Building Materials Supply
              <span className="block text-gold text-2xl md:text-3xl mt-2 font-medium">
                Contractor & Site Engineer Support
              </span>
            </h1>
            <p className="text-ivory/80 text-lg md:text-xl leading-relaxed mb-8">
              We supply verified building materials to active construction sites—on schedule, 
              in the right quantity, and to specification. Built for contractors, developers, 
              and site engineers who cannot afford site downtime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Request a Quote
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-ivory/30 text-ivory hover:bg-ivory/10"
                asChild
              >
                <a
                  href={`https://wa.me/2348034830087?text=${whatsappPrefilledMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp a BOQ
                </a>
              </Button>
            </div>

            {/* Trust Bullets */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 text-ivory/90">
                <ShieldCheck className="h-5 w-5 text-gold flex-shrink-0" />
                <span className="text-sm">Correct grade & spec (no substitutions)</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/90">
                <CalendarCheck className="h-5 w-5 text-gold flex-shrink-0" />
                <span className="text-sm">Scheduled site delivery</span>
              </div>
              <div className="flex items-center gap-3 text-ivory/90">
                <Package className="h-5 w-5 text-gold flex-shrink-0" />
                <span className="text-sm">Multi-item sourcing from one vendor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section - Prominent placement */}
      <section id="quote-form" className="bg-background section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <div className="order-2 lg:order-1">
              <Card className="border-2">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Request a Quote
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    <strong>Hard rule:</strong> No vague requests. Provide grade/type/quantity/timeline (or upload BOQ).
                  </p>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Project / Site Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground border-b pb-2">Project / Site Details</h3>
                        
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Contractor">Contractor</SelectItem>
                                  <SelectItem value="Site Engineer">Site Engineer</SelectItem>
                                  <SelectItem value="Developer">Developer</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="company_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone *</FormLabel>
                                <FormControl>
                                  <Input placeholder="+234..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (optional)</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="site_location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site Location *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Plot 123, Gwarimpa, Abuja" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="delivery_timeline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Timeline *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="When do you need delivery?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Same day">Same day</SelectItem>
                                  <SelectItem value="24-48 hours">24-48 hours</SelectItem>
                                  <SelectItem value="This week">This week</SelectItem>
                                  <SelectItem value="Scheduled">Scheduled (specify in notes)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Materials Request */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground border-b pb-2">Materials Request</h3>

                        <FormField
                          control={form.control}
                          name="request_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Request Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="How will you provide materials list?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="boq">I have a BOQ (upload file)</SelectItem>
                                  <SelectItem value="list_items">I'll list items below</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {requestType === "boq" && (
                          <div className="space-y-2">
                            <Label>Upload BOQ (PDF/JPG/PNG) *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setUploadedFile(file);
                                }}
                                className="hidden"
                                id="boq-upload"
                              />
                              <label
                                htmlFor="boq-upload"
                                className="cursor-pointer flex flex-col items-center gap-2"
                              >
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                {uploadedFile ? (
                                  <span className="text-sm text-foreground font-medium">
                                    {uploadedFile.name}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload BOQ file
                                  </span>
                                )}
                              </label>
                            </div>
                          </div>
                        )}

                        {requestType === "list_items" && (
                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <div
                                key={field.id}
                                className="bg-muted/30 rounded-lg p-4 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Item {index + 1}</span>
                                  {fields.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.category`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {materialCategories.map((cat) => (
                                              <SelectItem key={cat} value={cat}>
                                                {cat}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.specification`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Specification/Grade</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g., Sharp sand" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity_unit`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Quantity + Unit</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g., 5 trips" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`items.${index}.notes`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Notes (optional)</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Any special notes" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                append({ category: "", specification: "", quantity_unit: "", notes: "" })
                              }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Another Item
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Operational Notes */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-foreground border-b pb-2">Operational Notes</h3>

                        <FormField
                          control={form.control}
                          name="access_constraints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Constraints (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., tight road, must deliver before 5pm, gate code needed"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="payment_preference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Preference *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="How will you pay?" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="Invoice">Invoice (for companies)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="gold"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Get Quote"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Materials We Supply */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
                  Materials We Supply
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Sand",
                      desc: "Sharp sand, plaster sand, filling sand—per spec",
                      icon: "🏗️",
                    },
                    {
                      title: "Gravel",
                      desc: "Various sizes/grades—per spec",
                      icon: "🪨",
                    },
                    {
                      title: "Cement",
                      desc: "Major brands on request; bulk supported",
                      icon: "🧱",
                    },
                    {
                      title: "Iron / Rebar",
                      desc: "Various diameters; cut-to-length optional",
                      icon: "🔩",
                    },
                  ].map((material) => (
                    <Card key={material.title} className="bg-card">
                      <CardContent className="p-5">
                        <div className="text-2xl mb-2">{material.icon}</div>
                        <h3 className="font-semibold text-foreground mb-1">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">{material.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Other items available on request based on contractor/site engineer specification.
                </p>
              </div>

              {/* Other Site Requests */}
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Other Site Requests We Fulfill
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  {[
                    'Blocks (6"/9"), stones, laterite',
                    "Granite, chippings, ballast",
                    "Binding wire, nails, formwork (plywood, timber)",
                    "Roofing materials (sheets + accessories)",
                    "Plumbing materials (pipes, fittings)",
                    "Electrical materials (conduits, cables, fittings)",
                    "Finishing materials (tiles, POP/gypsum, paint, screed materials)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card section-padding">
        <div className="container-wide">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Submit Request",
                desc: "Send BOQ / material request (WhatsApp or form)",
                icon: FileText,
              },
              {
                step: "2",
                title: "Confirm & Quote",
                desc: "We confirm specifications + quote + delivery timeline",
                icon: CheckCircle,
              },
              {
                step: "3",
                title: "Site Delivery",
                desc: "Delivery to site with documentation",
                icon: Truck,
              },
              {
                step: "4",
                title: "Repeat Scheduling",
                desc: "Weekly or milestone-based repeat orders",
                icon: Clock,
              },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-gold" />
                </div>
                <div className="text-sm font-medium text-gold mb-2">Step {step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA Strip */}
      <section className="bg-navy py-6">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <span className="text-ivory text-lg">Prefer WhatsApp? Send your BOQ now.</span>
          <Button variant="gold" asChild>
            <a
              href={`https://wa.me/2348034830087?text=${whatsappPrefilledMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp Us
            </a>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background section-padding">
        <div className="container-narrow">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
}