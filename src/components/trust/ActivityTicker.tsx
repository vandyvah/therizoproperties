import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivitySignal = {
  id: string;
  headline: string;
  city: string | null;
  category: string;
  occurred_at: string;
};

/**
 * Phase 10 — live activity ticker (anonymised, staff-curated).
 * Reads from public.activity_signals via RLS; falls back to a static
 * proof-of-execution rail if no rows are published yet.
 */
export function ActivityTicker() {
  const { data } = useQuery({
    queryKey: ["activity-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_signals" as never)
        .select("id,headline,city,category,occurred_at")
        .eq("published", true)
        .order("occurred_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data || []) as ActivitySignal[];
    },
    staleTime: 60_000,
  });

  const items: ActivitySignal[] =
    data && data.length > 0
      ? data
      : [
          {
            id: "s1",
            headline: "Diaspora client (UK) closed a Lekki apartment",
            city: "Lagos",
            category: "deal",
            occurred_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "s2",
            headline: "Verified title pack issued for a Maitama plot",
            city: "Abuja",
            category: "verification",
            occurred_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "s3",
            headline: "Consultant call booked from Canada",
            city: "Diaspora",
            category: "call",
            occurred_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          },
        ];

  return (
    <div
      className="w-full border-y border-sand bg-warm-white overflow-hidden"
      role="region"
      aria-label="Recent Therizo activity"
    >
      <div className="container-wide flex items-center gap-4 py-3">
        <div className="flex items-center gap-2 shrink-0 text-navy">
          <Activity className="h-4 w-4 text-gold" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Live activity
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ul className="flex gap-8 animate-[marquee_40s_linear_infinite] whitespace-nowrap">
            {[...items, ...items].map((it, i) => (
              <li
                key={`${it.id}-${i}`}
                className="flex items-center gap-2 text-sm text-slate"
              >
                <span className="font-medium text-ink">{it.headline}</span>
                {it.city ? (
                  <span className="inline-flex items-center gap-1 text-slate/70">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {it.city}
                  </span>
                ) : null}
                <span className="text-slate/60">
                  · {formatDistanceToNow(new Date(it.occurred_at), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Recent Therizo activity"] ul { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
