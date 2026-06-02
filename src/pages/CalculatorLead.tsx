import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  ArrowRight, Loader2, Lock, CheckCircle2, TrendingUp,
  Zap, ShieldCheck, Clock, MessageCircle, Sparkles, Trophy,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

const WHATSAPP_NUMBER = "2348034830087";

const STRATEGIES = [
  { id: "long-term", label: "Long-Term Rental", sub: "Steady monthly cashflow" },
  { id: "airbnb", label: "Short-Stay / Airbnb", sub: "Premium nightly rates" },
  { id: "flip", label: "Buy → Renovate → Sell", sub: "Capital appreciation" },
] as const;

const LOCATIONS = [
  "Lagos – Lekki / Ajah", "Lagos – Ikoyi / VI", "Lagos – Banana Island",
  "Abuja – Maitama / Asokoro", "Abuja – Wuse / Jabi", "Abuja – Bwari / Kubwa",
  "Port Harcourt", "Ibadan", "Other",
];

const BUDGETS = ["Under ₦20M", "₦20M – ₦50M", "₦50M – ₦150M", "₦150M – ₦500M", "₦500M+"];

const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  budget: z.string().min(1, "Select your budget"),
  location: z.string().min(1, "Select preferred location"),
});

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const shortFmt = (n: number) =>
  n >= 1e9 ? `₦${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₦${(n / 1e6).toFixed(1)}M` : `₦${Math.round(n).toLocaleString()}`;

const parseNum = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")) || 0;

export default function CalculatorLead() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [strategy, setStrategy] = useState<typeof STRATEGIES[number]["id"]>("long-term");
  const [price, setPrice] = useState("");
  const [reno, setReno] = useState("");
  const [monthly, setMonthly] = useState("");
  const [nightly, setNightly] = useState("");
  const [occupancy, setOccupancy] = useState("65");
  const [sellPrice, setSellPrice] = useState("");
  const [lead, setLead] = useState({ name: "", email: "", phone: "", budget: "", location: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const results = useMemo(() => {
    const investment = parseNum(price) + parseNum(reno);
    if (investment <= 0) return null;
    let gross = 0;
    if (strategy === "long-term") gross = parseNum(monthly) * 12;
    else if (strategy === "airbnb") gross = parseNum(nightly) * 365 * (parseNum(occupancy) / 100);
    else gross = parseNum(sellPrice) - investment;

    const net = strategy === "flip" ? gross : gross * 0.82; // 18% ops/mgmt blend
    const roi = (net / investment) * 100;
    const payback = net > 0 ? investment / net : 0;
    const tenYr = strategy === "flip" ? gross : net * 10 + investment * 0.6; // appreciation est.
    return { investment, gross, net, roi, payback, tenYr };
  }, [strategy, price, reno, monthly, nightly, occupancy, sellPrice]);

  const canAdvance = !!results && results.investment > 0 && results.gross > 0;

  const handleUnlock = async () => {
    const parsed = leadSchema.safeParse(lead);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const summary = `ROI Calculator Lead
Strategy: ${strategy}
Investment: ${fmt(results!.investment)}
Projected Annual Net: ${fmt(results!.net)}
Projected ROI: ${results!.roi.toFixed(1)}%
Payback: ${results!.payback.toFixed(1)} yrs
10-Year Wealth Est.: ${fmt(results!.tenYr)}`;

      const { error } = await supabase.from("contact_submissions").insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        budget: lead.budget,
        preferred_location: lead.location,
        client_type: "investor",
        message: summary,
        page: "roi-calculator",
      });
      if (error) throw error;
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message ?? "Try again", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappLink = () => {
    if (!results) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const msg = `Hi Therizo, I just used your ROI calculator.

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Budget: ${lead.budget}
Preferred Location: ${lead.location}

My scenario:
• Strategy: ${strategy}
• Total Investment: ${fmt(results.investment)}
• Projected Net/yr: ${fmt(results.net)}
• ROI: ${results.roi.toFixed(1)}%

Please send me your matching verified properties.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Layout>
      <SEOHead
        title="Free Nigerian Property ROI Calculator | Therizo"
        description="Discover exactly how much your next Nigerian property will earn. Get a custom ROI report + matched verified listings in 60 seconds."
        canonical="https://therizoproperties.com/calculator"
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-light text-white">
        <div className="container max-w-5xl py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Free Tool · 60 Seconds · No Signup To Start
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-5">
            See Exactly How Much Your Next Nigerian Property Will <span className="text-gold">Pay You</span> — Before You Buy a Brick.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Plug in the numbers. We'll show you the ROI, payback period, 10-year wealth projection — and hand-match you with verified, titled properties that hit your target.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Verified titles only</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-gold" /> Instant projections</span>
            <span className="flex items-center gap-2"><Trophy className="h-4 w-4 text-gold" /> Diaspora-trusted</span>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="bg-sand py-12 md:py-20">
        <div className="container max-w-3xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`h-1.5 w-16 rounded-full transition ${step >= n ? "bg-gold" : "bg-navy/15"}`} />
            ))}
          </div>

          {step === 1 && (
            <Card className="p-6 md:p-10 border-navy/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">Step 1 of 3</div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-1">Your Investment Scenario</h2>
              <p className="text-charcoal/70 mb-8">Takes 45 seconds. No email required yet.</p>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-navy">Strategy</Label>
                  <div className="grid sm:grid-cols-3 gap-3 mt-2">
                    {STRATEGIES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStrategy(s.id)}
                        className={`text-left p-4 rounded-lg border-2 transition ${
                          strategy === s.id
                            ? "border-gold bg-gold/5"
                            : "border-navy/10 hover:border-navy/30 bg-background"
                        }`}
                      >
                        <div className="font-semibold text-navy text-sm">{s.label}</div>
                        <div className="text-xs text-charcoal/60 mt-1">{s.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-semibold text-navy">Purchase Price (₦)</Label>
                    <Input id="price" inputMode="numeric" placeholder="e.g. 45,000,000" value={price}
                      onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                  </div>
                  <div>
                    <Label htmlFor="reno" className="text-sm font-semibold text-navy">Renovation / Fit-Out (₦)</Label>
                    <Input id="reno" inputMode="numeric" placeholder="Optional" value={reno}
                      onChange={(e) => setReno(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                  </div>
                </div>

                {strategy === "long-term" && (
                  <div>
                    <Label htmlFor="monthly" className="text-sm font-semibold text-navy">Expected Monthly Rent (₦)</Label>
                    <Input id="monthly" inputMode="numeric" placeholder="e.g. 600,000" value={monthly}
                      onChange={(e) => setMonthly(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                  </div>
                )}

                {strategy === "airbnb" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nightly" className="text-sm font-semibold text-navy">Nightly Rate (₦)</Label>
                      <Input id="nightly" inputMode="numeric" placeholder="e.g. 85,000" value={nightly}
                        onChange={(e) => setNightly(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                    </div>
                    <div>
                      <Label htmlFor="occ" className="text-sm font-semibold text-navy">Occupancy %</Label>
                      <Input id="occ" inputMode="numeric" placeholder="65" value={occupancy}
                        onChange={(e) => setOccupancy(e.target.value.replace(/[^\d]/g, ""))} />
                    </div>
                  </div>
                )}

                {strategy === "flip" && (
                  <div>
                    <Label htmlFor="sell" className="text-sm font-semibold text-navy">Projected Resale Value (₦)</Label>
                    <Input id="sell" inputMode="numeric" placeholder="e.g. 75,000,000" value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full bg-gold hover:bg-gold/90 text-navy font-bold h-14 text-base"
                  disabled={!canAdvance}
                  onClick={() => setStep(2)}
                >
                  Calculate My ROI <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!canAdvance && (
                  <p className="text-xs text-charcoal/60 text-center">Fill in price and income to continue.</p>
                )}
              </div>
            </Card>
          )}

          {step === 2 && results && (
            <Card className="p-6 md:p-10 border-navy/10 relative overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">Step 2 of 3</div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-navy mb-1">
                Your Report Is Ready — Unlock It Free.
              </h2>
              <p className="text-charcoal/70 mb-6">
                Enter your details and we'll instantly reveal your projection <strong>plus</strong> a curated list of verified properties that match your budget.
              </p>

              {/* Blurred preview */}
              <div className="relative mb-8">
                <div className="grid grid-cols-3 gap-3 blur-md select-none pointer-events-none">
                  <div className="bg-navy/5 rounded-lg p-4"><div className="text-2xl font-bold text-navy">{shortFmt(results.net)}</div><div className="text-xs">Net / yr</div></div>
                  <div className="bg-navy/5 rounded-lg p-4"><div className="text-2xl font-bold text-navy">{results.roi.toFixed(1)}%</div><div className="text-xs">ROI</div></div>
                  <div className="bg-navy/5 rounded-lg p-4"><div className="text-2xl font-bold text-navy">{results.payback.toFixed(1)}y</div><div className="text-xs">Payback</div></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-navy text-white rounded-full p-3 shadow-lg"><Lock className="h-5 w-5" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-navy">Full Name *</Label>
                    <Input id="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Jane Adeyemi" />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-navy">Email *</Label>
                    <Input id="email" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="you@email.com" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-navy">WhatsApp / Phone (with country code) *</Label>
                  <Input id="phone" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="+44 7XXX XXXXXX" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget" className="text-sm font-semibold text-navy">Investment Budget *</Label>
                    <select id="budget" value={lead.budget} onChange={(e) => setLead({ ...lead, budget: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select…</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
                  </div>
                  <div>
                    <Label htmlFor="loc" className="text-sm font-semibold text-navy">Preferred Location *</Label>
                    <select id="loc" value={lead.location} onChange={(e) => setLead({ ...lead, location: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select…</option>
                      {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                  </div>
                </div>

                <Button size="lg" className="w-full bg-gold hover:bg-gold/90 text-navy font-bold h-14 text-base" onClick={handleUnlock} disabled={submitting}>
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Unlock My Full ROI Report <ArrowRight className="ml-2 h-5 w-5" /></>}
                </Button>
                <p className="text-xs text-center text-charcoal/60 flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" /> Your data is private. We never spam. Used only to send your report + matched listings.
                </p>
                <button type="button" onClick={() => setStep(1)} className="block mx-auto text-xs text-charcoal/60 underline">
                  ← Edit my numbers
                </button>
              </div>
            </Card>
          )}

          {step === 3 && results && (
            <div className="space-y-6">
              <Card className="p-6 md:p-10 border-gold/30 bg-gradient-to-br from-background to-gold/5">
                <div className="flex items-center gap-2 text-gold mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Your Personalised Report</span>
                </div>
                <h2 className="font-display text-2xl md:text-4xl font-bold text-navy mb-2">
                  {lead.name.split(" ")[0]}, here's what your money can do.
                </h2>
                <p className="text-charcoal/70 mb-8">Based on your {strategy.replace("-", " ")} scenario in {lead.location}.</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Stat label="Total Investment" value={shortFmt(results.investment)} />
                  <Stat label="Net Annual Income" value={shortFmt(results.net)} highlight />
                  <Stat label="Annual ROI" value={`${results.roi.toFixed(1)}%`} highlight />
                  <Stat label="Payback Period" value={results.payback > 0 ? `${results.payback.toFixed(1)} yrs` : "—"} />
                </div>

                <div className="bg-navy text-white rounded-lg p-6 mb-6">
                  <div className="text-xs uppercase tracking-wider text-gold mb-1">10-Year Wealth Projection</div>
                  <div className="text-3xl md:text-4xl font-display font-bold">{fmt(results.tenYr)}</div>
                  <div className="text-sm text-white/70 mt-1">Compounded net cashflow + estimated appreciation.</div>
                </div>

                <div className="bg-sand rounded-lg p-5 mb-6">
                  <div className="font-semibold text-navy mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gold" /> What you get next (free):
                  </div>
                  <ul className="space-y-2 text-sm text-charcoal/80">
                    {[
                      "3–5 hand-matched verified properties for your budget",
                      "Title verification status on every listing we send",
                      "Direct WhatsApp line to a senior consultant — no call centre",
                      "Diaspora purchase walkthrough (if buying from abroad)",
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />{b}</li>
                    ))}
                  </ul>
                </div>

                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold h-14 text-base">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Send My Report on WhatsApp & Get Matched Properties
                  </Button>
                </a>
                <p className="text-xs text-center text-charcoal/60 mt-3 flex items-center justify-center gap-1.5">
                  <Clock className="h-3 w-3" /> Average consultant response: under 12 minutes during business hours.
                </p>
              </Card>

              <div className="text-center">
                <Link to="/properties" className="text-sm text-navy underline">Or browse verified listings →</Link>
              </div>
            </div>
          )}

          {/* Trust strip */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: ShieldCheck, t: "Verified Titles Only", s: "Every listing we send has paperwork checked." },
              { icon: TrendingUp, t: "Realistic Projections", s: "Numbers we'd stake our reputation on." },
              { icon: MessageCircle, t: "Real Humans", s: "Senior consultants — no bots, no chasing." },
            ].map((x) => (
              <div key={x.t} className="p-4">
                <x.icon className="h-6 w-6 text-gold mx-auto mb-2" />
                <div className="font-semibold text-navy text-sm">{x.t}</div>
                <div className="text-xs text-charcoal/60 mt-1">{x.s}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/calculator/advanced" className="text-xs text-charcoal/50 underline">
              Need advanced inputs (taxes, financing, comparison)? Open the full calculator →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? "bg-gold/10 border border-gold/30" : "bg-sand"}`}>
      <div className="text-xs text-charcoal/60 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl md:text-3xl font-display font-bold mt-1 ${highlight ? "text-navy" : "text-navy"}`}>{value}</div>
    </div>
  );
}
