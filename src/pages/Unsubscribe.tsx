import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";

type State = "loading" | "success" | "already" | "error" | "invalid";

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() ?? "";
  const type = params.get("type")?.trim() ?? "nurture";
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setState("invalid");
      return;
    }
    const fn = type === "saved_search" ? "saved-search-unsubscribe" : "nurture-unsubscribe";
    const url = PROJECT_REF
      ? `https://${PROJECT_REF}.supabase.co/functions/v1/${fn}?token=${encodeURIComponent(token)}`
      : `/functions/v1/${fn}?token=${encodeURIComponent(token)}`;
    fetch(url)
      .then((r) => {
        if (r.status === 400) setState("invalid");
        else if (!r.ok) setState("error");
        else return r.text().then((body) => setState(body.includes("Already") ? "already" : "success"));
      })
      .catch(() => setState("error"));
  }, [token, type]);

  const heading =
    state === "loading" ? "Processing your request…"
    : state === "success" ? "You're unsubscribed"
    : state === "already" ? "Already unsubscribed"
    : state === "invalid" ? "Invalid link"
    : "Something went wrong";

  const body =
    state === "loading" ? "One moment."
    : state === "success" ? "You won't receive further nurture emails from Therizo. Direct replies to your consultant are unaffected."
    : state === "already" ? "This link has already been used."
    : state === "invalid" ? "This unsubscribe link is not valid or has expired."
    : "Please email hello@therizoproperties.com and we'll remove you manually.";

  return (
    <Layout>
      <SEOHead title="Unsubscribe · Therizo" description="Manage your Therizo email preferences." noindex />
      <section className="min-h-dvh flex items-center justify-center bg-ivory px-4 py-24">
        <div className="max-w-lg w-full bg-white border border-sand p-10 text-center">
          <div className="font-display text-gold tracking-widest text-sm mb-2">THERIZO</div>
          <h1 className="font-display text-2xl text-navy mb-4">{heading}</h1>
          <p className="text-slate-700 leading-relaxed">{body}</p>
          <a href="/" className="inline-block mt-6 text-navy underline">Return to Therizo</a>
        </div>
      </section>
    </Layout>
  );
}
