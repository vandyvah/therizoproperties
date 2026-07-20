import { ShieldAlert } from "lucide-react";

/**
 * Anti-fraud warning strip.
 * Ticket: Phase 0 P0 — add fraud warning to every property and payment-related page.
 * Wording per the July 2026 audit; do not soften without compliance review.
 */
export function FraudWarning({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      role="note"
      aria-label="Payment security notice"
      className="border border-amber-500/40 bg-amber-50 text-ink rounded-sm"
    >
      <div className={compact ? "px-4 py-3" : "px-5 py-4"}>
        <div className="flex items-start gap-3">
          <ShieldAlert
            className="h-5 w-5 text-amber-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-ink mb-1">
              Payment security notice
            </p>
            <p className="text-slate">
              Therizo will never ask you to send property funds to an employee's
              personal account. Always confirm every payment instruction through
              our official transaction team, using the phone number and email
              published on this website, before transferring any money. If you
              receive a suspicious message claiming to be from Therizo, email{" "}
              <a
                href="mailto:hello@therizoproperties.com"
                className="underline text-navy hover:text-gold"
              >
                hello@therizoproperties.com
              </a>{" "}
              before acting on it.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
