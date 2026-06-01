import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OwnerLayout } from "@/components/owner/OwnerLayout";

import {
  DollarSign, Eye, ShieldCheck, Camera, Users, MapPin, Phone,
  TrendingUp, FileText, Globe, Calendar, CheckCircle, ArrowRight,
  Lock, MessageCircle, AlertTriangle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE, ACCESS_REQUEST_MESSAGE,
  OWNER_NAME, trackEvent,
} from "@/lib/owner-config";

/* ─── Data ──────────────────────────────────────── */
const REASONS = [
  { icon: DollarSign, title: "Wrong Price vs Real Comparables", desc: "Your price doesn't reflect what buyers actually pay in your area — it's based on hope, not evidence." },
  { icon: Eye, title: "Low Visibility to Ready Buyers", desc: "Diaspora cash buyers and serious investors never see your listing — it's buried or invisible." },
  { icon: ShieldCheck, title: "Trust Gap", desc: "Title clarity and deal readiness aren't shown upfront, making buyers hesitate." },
  { icon: Camera, title: "Poor Presentation", desc: "Bad photos, no video, weak descriptions — your property looks like a risk." },
  { icon: Users, title: "Too Many Agents / Price Confusion", desc: "Inconsistent pricing from multiple agents kills buyer confidence." },
  { icon: MapPin, title: "Viewing Friction", desc: "Property is hard to inspect — access issues, caretaker delays, or locked gates." },
  { icon: Phone, title: "Weak Follow-Up", desc: "No structured negotiation process — leads die, buyers move on." },
];

const PILLARS = [
  {
    icon: TrendingUp, letter: "A", title: "Pricing Strategy That Moves Buyers",
    items: [
      "Comparable Market Analysis (CMA) based on real transactions",
      "Price bands that trigger buyer action and urgency",
      "Negotiation buffers that protect your value",
    ],
  },
  {
    icon: FileText, letter: "B", title: "High-Trust Deal Packaging",
    items: [
      "Clear title/document summary (C of O, Gov Consent, Deed, Survey)",
      "Transaction readiness checklist shared with buyers",
      "Buyer confidence positioning — remove fear before inspection",
    ],
  },
  {
    icon: Globe, letter: "C", title: "Visibility Engine — Where Real Buyers Are",
    items: [
      "Professional photos + short cinematic walkthrough video",
      "High-converting listing copy written by specialists",
      "Distribution to qualified buyer networks + diaspora circles",
      "Targeted Meta/Instagram ads to high-intent audiences",
      "WhatsApp broadcasts to verified buyer lists",
    ],
  },
  {
    icon: Calendar, letter: "D", title: "Inspection + Offer Management",
    items: [
      "Inspection scheduling and buyer qualification",
      "Lead follow-up system — no dead leads",
      "Negotiation support to close deals faster",
    ],
  },
];

const TIMELINE = [
  { week: "Week 1", title: "Audit + Rebuild", desc: "Market comps, media production, listing rebuild, deal packaging." },
  { week: "Weeks 2–4", title: "Launch + Outreach", desc: "Ads, buyer network distribution, inspections begin." },
  { week: "Weeks 5–8", title: "Optimize + Push", desc: "Retargeting, price calibration, negotiation acceleration." },
  { week: "Weeks 9–12", title: "Close or Escalate", desc: "Final buyer push, close support, or strategic escalation." },
];

const CHECKLIST = [
  "Location and full property details",
  "Asking price (and minimum acceptable)",
  "Title status + available documents (C of O, Deed, Survey, etc.)",
  "Inspection access — can we get in this week?",
  "Your timeline and urgency level",
];

/* ─── Component ─────────────────────────────────── */
export default function OwnerBrief() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("owner_brief_session");
    if (session) {
      try {
        const { timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setIsUnlocked(true);
          return;
        }
      } catch { /* expired or invalid */ }
      localStorage.removeItem("owner_brief_session");
    }
    const lockout = localStorage.getItem("owner_brief_lockout");
    if (lockout && Date.now() - parseInt(lockout) < 15 * 60 * 1000) {
      setIsLocked(true);
    }
  }, []);

  const handleUnlock = async () => {
    if (isLocked || loading) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("owner-auth", {
        body: { password, type: "owner" },
      });
      if (fnError) throw fnError;
      if (data?.valid) {
        localStorage.setItem("owner_brief_session", JSON.stringify({ timestamp: Date.now() }));
        setIsUnlocked(true);
        trackEvent("owner_brief_login_success");
      } else {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 5) {
          localStorage.setItem("owner_brief_lockout", Date.now().toString());
          setIsLocked(true);
          setError("Too many attempts. Please try again in 15 minutes or request access via WhatsApp.");
        } else {
          setError("Incorrect password. Please try again.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  /* ── Password Gate ── */
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0E1626] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <Lock className="mx-auto h-10 w-10 text-[#C8A24A]" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Private Owner Briefing
            </h1>
            <p className="text-white/60 text-sm">Thérizo Properties — Confidential</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <Input
              type="password"
              placeholder="Enter access password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              disabled={isLocked}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#C8A24A]"
            />
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5 justify-center">
                <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}
            <Button
              onClick={handleUnlock}
              disabled={isLocked || loading || !password}
              className="w-full bg-[#C8A24A] text-[#0E1626] hover:bg-[#b8923a] font-semibold"
            >
              {loading ? "Verifying..." : "Unlock Briefing"}
            </Button>
          </div>

          <a
            href={getWhatsAppUrl(ACCESS_REQUEST_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#25D366] transition"
          >
            <MessageCircle className="h-4 w-4" />
            Request access on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  /* ── Briefing Content ── */
  return (
    <OwnerLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E1626] via-[#0E1626] to-[#1a2a4a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E1626]/40 via-transparent to-[#0E1626]/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Why Your Property Hasn't Sold <span className="text-[#C8A24A]">(Yet)</span> — And The 90-Day Plan That Fixes It
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            In Lagos and Abuja, most listings don't fail because the property is bad. They fail due to wrong pricing, low visibility, and low buyer trust. This private briefing shows what to fix.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("whatsapp_cta_click", { location: "hero" })}>
              <Button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold px-8 py-3 text-base">
                <MessageCircle className="h-5 w-5 mr-2" /> Get Free Owner Audit on WhatsApp
              </Button>
            </a>
            <Link to="/submit-property" onClick={() => trackEvent("submit_property_start", { location: "hero" })}>
              <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-3 text-base">
                Submit Property Details <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: 7 Reasons */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C8A24A] font-semibold text-sm tracking-widest uppercase mb-2">The Hard Truth</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0E1626]">
              The 7 Real Reasons Properties Don't Sell
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REASONS.map((r, i) => (
              <div key={i} className="group border border-[#D8D1C5]/60 rounded-xl p-6 hover:border-[#C8A24A]/40 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0E1626] flex items-center justify-center">
                    <r.icon className="h-5 w-5 text-[#C8A24A]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#0E1626] mb-1">{i + 1}. {r.title}</h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: 4 Pillars */}
      <section className="py-16 sm:py-24 bg-[#F7F3EA]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C8A24A] font-semibold text-sm tracking-widest uppercase mb-2">Our Method</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0E1626]">
              The 90-Day Sales Sprint
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map((p) => (
              <div key={p.letter} className="bg-white border border-[#D8D1C5]/60 rounded-xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-full bg-[#C8A24A] text-[#0E1626] flex items-center justify-center font-bold text-sm">{p.letter}</span>
                  <h3 className="font-display text-lg font-bold text-[#0E1626]">{p.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {p.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <CheckCircle className="h-4 w-4 text-[#C8A24A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Timeline */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#C8A24A] font-semibold text-sm tracking-widest uppercase mb-2">The Plan</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0E1626]">90-Day Timeline</h2>
          </div>
          <div className="space-y-0 relative">
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-[#C8A24A]/30 hidden sm:block" />
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex items-start gap-4 sm:gap-6 py-4">
                <div className="shrink-0 w-11 h-11 rounded-full border-2 border-[#C8A24A] bg-white flex items-center justify-center relative z-10">
                  <Clock className="h-5 w-5 text-[#C8A24A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#C8A24A] uppercase tracking-wider">{t.week}</p>
                  <h4 className="font-display font-semibold text-[#0E1626]">{t.title}</h4>
                  <p className="text-sm text-[#6B7280]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-lg p-4 text-sm text-[#92400E] leading-relaxed">
            <strong>Honest Disclaimer:</strong> No one can promise a guaranteed sale in any market. What we guarantee is a disciplined 90-day sales sprint process: correct pricing, premium presentation, strong visibility, and structured follow-up.
          </div>
        </div>
      </section>

      {/* Section 4: Checklist */}
      <section className="py-16 sm:py-24 bg-[#F7F3EA]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-[#C8A24A] font-semibold text-sm tracking-widest uppercase mb-2">Before We Start</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0E1626]">Owner Readiness Checklist</h2>
          </div>
          <div className="bg-white border border-[#D8D1C5]/60 rounded-xl p-6 sm:p-8">
            <ul className="space-y-3">
              {CHECKLIST.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#374151]">
                  <CheckCircle className="h-5 w-5 text-[#C8A24A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Engagement Options */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#C8A24A] font-semibold text-sm tracking-widest uppercase mb-2">How We Work</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0E1626] mb-8">Simple Engagement Options</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-[#D8D1C5]/60 rounded-xl p-6 text-left">
              <h3 className="font-display font-bold text-[#0E1626] mb-2">Option 1: Success-Based</h3>
              <p className="text-sm text-[#6B7280]">Commission only on closing. You pay nothing unless we sell your property.</p>
            </div>
            <div className="border border-[#C8A24A]/40 rounded-xl p-6 text-left bg-[#C8A24A]/5">
              <h3 className="font-display font-bold text-[#0E1626] mb-2">Option 2: Hybrid</h3>
              <p className="text-sm text-[#6B7280]">Small marketing/visibility retainer + reduced commission. Ideal for faster, more aggressive campaigns.</p>
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mt-4">We recommend the option that fits your property category and urgency.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-[#0E1626]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Want to know the <span className="text-[#C8A24A]">real reason</span> it hasn't sold?
          </h2>
          <p className="text-white/60 text-sm">Serious sellers only — we optimize price, visibility, trust, and execution.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("whatsapp_cta_click", { location: "final_cta" })}>
              <Button className="w-full sm:w-auto bg-[#C8A24A] text-[#0E1626] hover:bg-[#b8923a] font-semibold px-8 py-3 text-base">
                <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp {OWNER_NAME} for Free Audit
              </Button>
            </a>
            <Link to="/submit-property" onClick={() => trackEvent("submit_property_start", { location: "final_cta" })}>
              <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-3 text-base">
                Submit Property Details
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </OwnerLayout>
  );
}
