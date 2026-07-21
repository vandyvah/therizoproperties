import { ShieldCheck, FileCheck2, Landmark, HandshakeIcon } from "lucide-react";

/**
 * Phase 10 — trust badges strip.
 * Surfaces verification, title, escrow and diaspora-ready signals
 * on every property detail page to reduce fraud anxiety.
 */
const BADGES = [
  { icon: ShieldCheck, label: "Title verified", detail: "Deeds & C of O reviewed" },
  { icon: FileCheck2, label: "Paperwork audited", detail: "Independent legal check" },
  { icon: Landmark, label: "Escrow ready", detail: "Funds held until handover" },
  { icon: HandshakeIcon, label: "Diaspora-ready", detail: "Remote signing & POA" },
] as const;

export function TrustBadgesStrip() {
  return (
    <div
      role="region"
      aria-label="Trust and verification badges"
      className="bg-warm-white border border-sand rounded-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {BADGES.map(({ icon: Icon, label, detail }) => (
        <div key={label} className="flex items-start gap-3">
          <span className="shrink-0 h-9 w-9 rounded-full bg-navy/5 border border-navy/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-navy" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink leading-tight">{label}</p>
            <p className="text-[11px] text-slate leading-snug">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
