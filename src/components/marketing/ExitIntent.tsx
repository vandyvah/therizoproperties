import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { analytics, getUtm } from "@/lib/analytics";

const DISMISS_KEY = "therizo_exit_intent_dismissed_v1";

/**
 * Fires once per session on high-value pages when the pointer leaves through
 * the top of the viewport (desktop) or after a long idle scroll pause (mobile).
 * Captures email into contact_submissions so it flows into the existing lead pipeline.
 */
export function ExitIntent() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    let fired = false;

    const trigger = () => {
      if (fired) return;
      fired = true;
      analytics.exitIntentShown();
      setOpen(true);
    };

    // Desktop: pointer leaves through the top edge
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    };

    // Mobile fallback: 45s dwell on page
    const dwellTimer = window.setTimeout(trigger, 45_000);

    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(dwellTimer);
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const utm = getUtm();
      const { error } = await supabase.from("contact_submissions").insert({
        name: "Diaspora Briefing (exit intent)",
        email,
        message: `Requested the Therizo diaspora briefing from ${location.pathname}. Please send verified off-market opportunities and next-step guidance.`,
        page: `exit-intent:${location.pathname}`,
        utm_source: utm.utm_source || null,
        utm_medium: utm.utm_medium || null,
        utm_campaign: utm.utm_campaign || null,
        referrer: utm.referrer || null,
      });
      if (error) throw error;
      analytics.exitIntentSubmit({ path: location.pathname });
      sessionStorage.setItem(DISMISS_KEY, "1");
      toast.success("Briefing on its way. A senior consultant will follow up shortly.");
      setOpen(false);
    } catch (err: any) {
      console.error("[exit-intent] submission failed", err);
      toast.error(err?.message || "Couldn't submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleDismiss())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold mb-2">
            <Shield className="h-3.5 w-3.5" />
            Diaspora briefing
          </div>
          <DialogTitle className="font-display text-2xl">
            Before you go — get the Therizo briefing
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Verified off-market opportunities, current yields, and diaspora-safe
            purchase steps. One email, no spam, unsubscribe anytime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            autoComplete="email"
          />
          <Button type="submit" variant="gold" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send me the briefing"}
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, continue browsing
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
