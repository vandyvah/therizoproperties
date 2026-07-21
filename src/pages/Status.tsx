import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";

type Health = "operational" | "degraded" | "checking";

interface Component {
  name: string;
  description: string;
  status: Health;
}

const StatusPage = () => {
  const [components, setComponents] = useState<Component[]>([
    { name: "Website & Listings", description: "Public site, property search, and detail pages", status: "checking" },
    { name: "Database & API", description: "Property data, saved searches, and shortlists", status: "checking" },
    { name: "Lead Intake", description: "Contact forms, WhatsApp deep-links, and consultations", status: "operational" },
    { name: "ROI Calculator", description: "Investment analysis and comparison tooling", status: "operational" },
    { name: "Email Delivery", description: "Nurture sequences, shortlist emails, and alerts", status: "operational" },
    { name: "Media & Storage", description: "Property photos, video streaming, and documents", status: "operational" },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const start = Date.now();
      try {
        const { error } = await supabase.from("properties").select("id").limit(1);
        if (cancelled) return;
        const ok = !error;
        setComponents((prev) =>
          prev.map((c) => {
            if (c.name === "Database & API") return { ...c, status: ok ? "operational" : "degraded" };
            if (c.name === "Website & Listings")
              return { ...c, status: ok && Date.now() - start < 5000 ? "operational" : "degraded" };
            return c;
          }),
        );
      } catch {
        if (cancelled) return;
        setComponents((prev) =>
          prev.map((c) =>
            c.name === "Database & API" || c.name === "Website & Listings"
              ? { ...c, status: "degraded" }
              : c,
          ),
        );
      }
      setLastChecked(new Date());
    }
    check();
    const id = setInterval(check, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const anyDegraded = components.some((c) => c.status === "degraded");
  const anyChecking = components.some((c) => c.status === "checking");
  const overall: Health = anyDegraded ? "degraded" : anyChecking ? "checking" : "operational";

  return (
    <Layout>
      <Helmet>
        <title>System Status — Therizo Properties</title>
        <meta
          name="description"
          content="Live status of the Therizo Properties website, API, lead intake, and email services."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://therizoproperties.com/status" />
      </Helmet>

      <section className="container-wide section-padding">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            System Status
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            {overall === "operational" && "All systems operational"}
            {overall === "degraded" && "Some services are degraded"}
            {overall === "checking" && "Checking system status…"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Live health of Therizo Properties services. This page is maintained by
            Therizo Property and Development Corporation and refreshes every 60 seconds.
          </p>

          <div className="rounded-xl border border-border overflow-hidden">
            {components.map((c, i) => (
              <div
                key={c.name}
                className={`flex items-start gap-4 p-4 md:p-5 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {c.status === "operational" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                  )}
                  {c.status === "degraded" && (
                    <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden />
                  )}
                  {c.status === "checking" && (
                    <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-medium">{c.name}</h2>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${
                        c.status === "operational"
                          ? "text-emerald-700"
                          : c.status === "degraded"
                            ? "text-amber-700"
                            : "text-muted-foreground"
                      }`}
                    >
                      {c.status === "operational" && "Operational"}
                      {c.status === "degraded" && "Degraded"}
                      {c.status === "checking" && "Checking"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                </div>
              </div>
            ))}
          </div>

          {lastChecked && (
            <p className="text-xs text-muted-foreground mt-4">
              Last checked {lastChecked.toLocaleTimeString()}
            </p>
          )}

          <div className="mt-10 rounded-xl border border-border p-5 bg-muted/30">
            <h2 className="font-medium mb-2">Report an issue</h2>
            <p className="text-sm text-muted-foreground">
              If you're seeing something we haven't caught, email{" "}
              <a href="mailto:hello@therizoproperties.com" className="underline underline-offset-2">
                hello@therizoproperties.com
              </a>{" "}
              or WhatsApp{" "}
              <a
                href="https://wa.me/2348034830087"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                +234 803 483 0087
              </a>
              . We aim to acknowledge within one business hour.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StatusPage;
