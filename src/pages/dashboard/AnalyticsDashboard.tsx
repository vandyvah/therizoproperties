import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, MousePointerClick, MessageCircle, Target, AlertTriangle } from "lucide-react";

type ErrorGroup = {
  key: string;
  message: string;
  source: string;
  count: number;
  sessions: number;
  firstSeen: string;
  lastSeen: string;
  lastUrl: string;
};

type EventRow = {
  event_name: string;
  path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  session_id: string | null;
  properties: any;
  created_at: string;
};

const RANGES = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
];

function pct(n: number, d: number) {
  if (!d) return "0.0%";
  return ((n / d) * 100).toFixed(1) + "%";
}

function topN<T extends string>(map: Map<T, number>, n = 10) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState(RANGES[1]);
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - range.hours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event_name, path, referrer, utm_source, utm_medium, utm_campaign, session_id, properties, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (cancelled) return;
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(data as EventRow[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const stats = useMemo(() => {
    const empty = {
      total: 0,
      sessions: 0,
      pageViews: 0,
      whatsapp: 0,
      calls: 0,
      calcComplete: 0,
      leads: 0,
      exitShown: 0,
      exitSubmit: 0,
      propertyView: 0,
      topPages: [] as [string, number][],
      topUtm: [] as [string, number][],
      topReferrers: [] as [string, number][],
      byDay: [] as { day: string; count: number }[],
      errors: [] as ErrorGroup[],
      errorTotal: 0,
    };
    if (!rows) return empty;

    const sessions = new Set<string>();
    const pathMap = new Map<string, number>();
    const utmMap = new Map<string, number>();
    const refMap = new Map<string, number>();
    const dayMap = new Map<string, number>();
    const errMap = new Map<string, ErrorGroup & { sessionSet: Set<string> }>();
    let pageViews = 0,
      whatsapp = 0,
      calls = 0,
      calcComplete = 0,
      leads = 0,
      exitShown = 0,
      exitSubmit = 0,
      propertyView = 0,
      errorTotal = 0;

    for (const r of rows) {
      if (r.session_id) sessions.add(r.session_id);
      if (r.event_name === "page_view") {
        pageViews++;
        if (r.path) pathMap.set(r.path, (pathMap.get(r.path) || 0) + 1);
      }
      if (r.event_name === "whatsapp_click") whatsapp++;
      if (r.event_name === "call_click") calls++;
      if (r.event_name === "calculator_complete") calcComplete++;
      if (r.event_name === "lead_submit") leads++;
      if (r.event_name === "exit_intent_shown") exitShown++;
      if (r.event_name === "exit_intent_submit") exitSubmit++;
      if (r.event_name === "property_view") propertyView++;

      const utm = r.utm_source || "(direct)";
      utmMap.set(utm, (utmMap.get(utm) || 0) + 1);

      if (r.referrer) {
        try {
          const host = new URL(r.referrer).hostname.replace(/^www\./, "");
          if (host) refMap.set(host, (refMap.get(host) || 0) + 1);
        } catch {}
      }

      const day = r.created_at.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }

    const byDay = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));

    return {
      total: rows.length,
      sessions: sessions.size,
      pageViews,
      whatsapp,
      calls,
      calcComplete,
      leads,
      exitShown,
      exitSubmit,
      propertyView,
      topPages: topN(pathMap, 10),
      topUtm: topN(utmMap, 8),
      topReferrers: topN(refMap, 8),
      byDay,
    };
  }, [rows]);

  const maxDay = Math.max(1, ...stats.byDay.map((d) => d.count));

  return (
    <DashboardLayout>
      <SEOHead title="Analytics — Therizo Dashboard" description="Internal analytics" noindex />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-semibold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              First-party event stream. No cookies, no third-party trackers.
            </p>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant={range.label === r.label ? "default" : "outline"}
                onClick={() => setRange(r)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<TrendingUp />} label="Sessions" value={stats.sessions} />
              <StatCard icon={<MousePointerClick />} label="Page views" value={stats.pageViews} />
              <StatCard icon={<MessageCircle />} label="WhatsApp clicks" value={stats.whatsapp} />
              <StatCard icon={<Target />} label="Leads" value={stats.leads} />
            </div>

            {/* Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FunnelRow label="Page views" value={stats.pageViews} base={stats.pageViews} />
                <FunnelRow label="Property views" value={stats.propertyView} base={stats.pageViews} />
                <FunnelRow label="Calculator complete" value={stats.calcComplete} base={stats.pageViews} />
                <FunnelRow label="WhatsApp / Call intent" value={stats.whatsapp + stats.calls} base={stats.pageViews} />
                <FunnelRow label="Lead submit" value={stats.leads} base={stats.pageViews} />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Traffic by day */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Events per day</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.byDay.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32">
                      {stats.byDay.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                          <div
                            className="w-full bg-gold rounded-sm"
                            style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 2 }}
                          />
                          <span className="text-[10px] text-muted-foreground">{d.day.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exit intent */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exit intent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Shown" value={stats.exitShown} />
                  <Row label="Submitted" value={stats.exitSubmit} />
                  <Row label="Conversion" value={pct(stats.exitSubmit, stats.exitShown)} />
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <ListCard title="Top pages" rows={stats.topPages} />
              <ListCard title="Traffic source (UTM)" rows={stats.topUtm} />
              <ListCard title="Top referrers" rows={stats.topReferrers} emptyLabel="No external referrers" />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, value, base }: { label: string; value: number; base: number }) {
  const width = base ? Math.min(100, (value / base) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">
          {value.toLocaleString()} <span className="text-muted-foreground">({pct(value, base)})</span>
        </span>
      </div>
      <div className="h-2 bg-muted rounded overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ListCard({ title, rows, emptyLabel }: { title: string; rows: [string, number][]; emptyLabel?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel || "No data"}</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {rows.map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2">
                <span className="truncate text-muted-foreground" title={k}>{k}</span>
                <span className="font-medium tabular-nums">{v.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
