import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Search, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CANONICAL = "https://therizoproperties.com";
const SITEMAP_URL = `${CANONICAL}/sitemap.xml`;
const STORAGE_KEY = "therizo:gsc-not-indexed";

const PUBLIC_PAGES: { path: string; name: string }[] = [
  { path: "/", name: "Home" },
  { path: "/properties", name: "Properties" },
  { path: "/calculator", name: "ROI Calculator" },
  { path: "/our-standard", name: "Our Standard" },
  { path: "/team", name: "Team" },
  { path: "/contact", name: "Contact" },
  { path: "/press", name: "Press" },
  { path: "/materials-supply", name: "Materials Supply" },
  { path: "/abuja-starter-kit", name: "Abuja Starter Kit" },
  { path: "/guides/title-verification", name: "Title Verification Guide" },
  { path: "/guides/buyer-guide", name: "Buyer Guide" },
  { path: "/guides/roi-methodology", name: "ROI Methodology" },
  { path: "/locations/lagos", name: "Lagos" },
  { path: "/locations/abuja", name: "Abuja" },
  { path: "/locations/port-harcourt", name: "Port Harcourt" },
  { path: "/blog", name: "Blog" },
];

type CheckStatus = "pending" | "ok" | "warn" | "error";

interface PageCheck {
  path: string;
  name: string;
  inSitemap: CheckStatus;
  reachable: CheckStatus;
  googleIndexUrl: string;
  notes: string[];
}

export function SiteIndexingStatus() {
  const [checks, setChecks] = useState<PageCheck[]>(
    PUBLIC_PAGES.map((p) => ({
      path: p.path,
      name: p.name,
      inSitemap: "pending",
      reachable: "pending",
      googleIndexUrl: `https://www.google.com/search?q=site:therizoproperties.com${encodeURIComponent(p.path)}`,
      notes: [],
    }))
  );
  const [running, setRunning] = useState(false);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [dynamicCount, setDynamicCount] = useState<number | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  // GSC "Discovered - not indexed" tracking
  const [notIndexed, setNotIndexed] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [bulkPaste, setBulkPaste] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotIndexed(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = (urls: string[]) => {
    setNotIndexed(urls);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    } catch {
      // ignore
    }
  };

  const runChecks = async () => {
    setRunning(true);

    // 1. Fetch static sitemap
    let urls: string[] = [];
    try {
      const res = await fetch(SITEMAP_URL, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        urls = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
      }
    } catch {
      // ignore
    }
    setSitemapUrls(urls);

    // 2. Fetch dynamic sitemap (edge function) for property count
    try {
      const dyn = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`,
        { cache: "no-store" }
      );
      if (dyn.ok) {
        const text = await dyn.text();
        const matches = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g));
        setDynamicCount(matches.length);
      }
    } catch {
      // ignore
    }

    // 3. Per-page checks
    const next: PageCheck[] = await Promise.all(
      PUBLIC_PAGES.map(async (p) => {
        const fullUrl = `${CANONICAL}${p.path}`;
        const inSitemap: CheckStatus = urls.includes(fullUrl) ? "ok" : "warn";
        let reachable: CheckStatus = "pending";
        const notes: string[] = [];

        try {
          const r = await fetch(fullUrl, { method: "GET", mode: "no-cors", cache: "no-store" });
          // no-cors gives opaque response; if it didn't throw, treat as reachable
          reachable = r.type === "opaque" || r.ok ? "ok" : "warn";
        } catch {
          reachable = "error";
          notes.push("Network fetch failed");
        }

        if (inSitemap === "warn") notes.push("Not found in static sitemap.xml");

        return {
          path: p.path,
          name: p.name,
          inSitemap,
          reachable,
          googleIndexUrl: `https://www.google.com/search?q=site:therizoproperties.com${encodeURIComponent(p.path)}`,
          notes,
        };
      })
    );

    setChecks(next);
    setLastRun(new Date().toLocaleString());
    setRunning(false);
  };

  // Auto-run on mount
  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live property count from DB (these should appear in dynamic sitemap)
  const [listedProperties, setListedProperties] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("status", "listed")
      .then(({ count }) => setListedProperties(count ?? 0));
  }, []);

  const summary = useMemo(() => {
    const indexable = checks.length;
    const inSitemap = checks.filter((c) => c.inSitemap === "ok").length;
    const reachable = checks.filter((c) => c.reachable === "ok").length;
    return { indexable, inSitemap, reachable };
  }, [checks]);

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    const list = Array.from(new Set([...notIndexed, trimmed]));
    persist(list);
    setNewUrl("");
  };

  const addBulk = () => {
    const items = bulkPaste
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
    if (!items.length) return;
    persist(Array.from(new Set([...notIndexed, ...items])));
    setBulkPaste("");
  };

  const removeUrl = (u: string) => persist(notIndexed.filter((x) => x !== u));

  const triggerIndexNow = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/indexnow`,
        { method: "POST" }
      );
      alert("IndexNow ping submitted. Check edge function logs for details.");
    } catch {
      alert("IndexNow request failed. Check console.");
    }
  };

  const StatusIcon = ({ s }: { s: CheckStatus }) => {
    if (s === "ok") return <CheckCircle className="text-green-600 shrink-0" size={16} />;
    if (s === "warn") return <AlertCircle className="text-amber-500 shrink-0" size={16} />;
    if (s === "error") return <XCircle className="text-red-500 shrink-0" size={16} />;
    return <RefreshCw className="text-slate animate-spin shrink-0" size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Header / Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Search className="text-gold" size={20} />
              Site Indexing Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={runChecks} disabled={running} size="sm" variant="outline">
                <RefreshCw className={`mr-2 ${running ? "animate-spin" : ""}`} size={14} />
                {running ? "Running..." : "Re-run checks"}
              </Button>
              <Button onClick={triggerIndexNow} size="sm">
                Ping IndexNow
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate text-xs uppercase tracking-wide">Public pages</div>
              <div className="text-2xl font-semibold">{summary.indexable}</div>
            </div>
            <div>
              <div className="text-slate text-xs uppercase tracking-wide">In sitemap</div>
              <div className="text-2xl font-semibold text-green-600">
                {summary.inSitemap}/{summary.indexable}
              </div>
            </div>
            <div>
              <div className="text-slate text-xs uppercase tracking-wide">Reachable</div>
              <div className="text-2xl font-semibold text-green-600">
                {summary.reachable}/{summary.indexable}
              </div>
            </div>
            <div>
              <div className="text-slate text-xs uppercase tracking-wide">Listed properties</div>
              <div className="text-2xl font-semibold">{listedProperties ?? "—"}</div>
              <div className="text-xs text-slate">in dynamic sitemap: {dynamicCount ?? "—"}</div>
            </div>
          </div>
          {lastRun && <p className="text-xs text-slate mt-3">Last checked: {lastRun}</p>}
        </CardContent>
      </Card>

      {/* Per-page table */}
      <Card>
        <CardHeader>
          <CardTitle>Public Page Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Page</th>
                  <th className="py-2 pr-3">Path</th>
                  <th className="py-2 pr-3 text-center">In Sitemap</th>
                  <th className="py-2 pr-3 text-center">Reachable</th>
                  <th className="py-2 pr-3">Notes</th>
                  <th className="py-2 pr-3">Inspect</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.path} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-medium">{c.name}</td>
                    <td className="py-2 pr-3">
                      <a href={c.path} className="text-gold hover:underline">
                        {c.path}
                      </a>
                    </td>
                    <td className="py-2 pr-3 text-center">
                      <div className="flex justify-center">
                        <StatusIcon s={c.inSitemap} />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-center">
                      <div className="flex justify-center">
                        <StatusIcon s={c.reachable} />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate">
                      {c.notes.length ? c.notes.join("; ") : "OK"}
                    </td>
                    <td className="py-2 pr-3">
                      <a
                        href={c.googleIndexUrl}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 text-gold hover:underline text-xs"
                      >
                        site: <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate mt-3">
            "site: search" opens a Google query (<code>site:therizoproperties.com{"{path}"}</code>).
            If no results appear, the page is not yet indexed.
          </p>
        </CardContent>
      </Card>

      {/* GSC "Discovered - currently not indexed" tracker */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-amber-600" size={20} />
            Discovered – Currently Not Indexed (manual from GSC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate">
            Paste URLs that Google Search Console flags as <strong>"Discovered – currently not indexed"</strong> or
            <strong> "Crawled – currently not indexed"</strong>. Tracked locally in your browser so you can monitor
            them across sessions and re-ping IndexNow.
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="https://therizoproperties.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
            />
            <Button onClick={addUrl} size="sm">
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Paste multiple URLs (one per line or comma-separated)"
              value={bulkPaste}
              onChange={(e) => setBulkPaste(e.target.value)}
              rows={3}
            />
            <Button onClick={addBulk} size="sm" variant="outline">
              Bulk add
            </Button>
          </div>

          {notIndexed.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
              <CheckCircle size={16} />
              No flagged URLs. Indexing health looks clean.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{notIndexed.length} flagged URL{notIndexed.length > 1 ? "s" : ""}</Badge>
                <Button onClick={() => persist([])} size="sm" variant="ghost">
                  Clear all
                </Button>
              </div>
              {notIndexed.map((u) => (
                <div key={u} className="flex items-center gap-2 text-sm bg-background p-2 rounded border">
                  <AlertCircle className="text-amber-500 shrink-0" size={14} />
                  <a
                    href={u}
                    target="_blank"
                    rel="noopener"
                    className="text-gold hover:underline truncate flex-1"
                  >
                    {u}
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`site:${u}`)}`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-slate hover:text-gold"
                    title="Check on Google"
                  >
                    <Search size={14} />
                  </a>
                  <button
                    onClick={() => removeUrl(u)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-slate border-t pt-3">
            <strong>Tip:</strong> After adding URLs, click <em>Ping IndexNow</em> above to re-submit them to
            Bing/Yandex. For Google, use <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener"
              className="text-gold hover:underline"
            >Search Console → URL Inspection → Request Indexing</a>.
          </div>
        </CardContent>
      </Card>

      {/* Sitemap visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Sitemap Coverage ({sitemapUrls.length} URLs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2 text-xs max-h-64 overflow-y-auto">
            {sitemapUrls.map((u) => (
              <div key={u} className="flex items-center gap-2">
                <CheckCircle className="text-green-600 shrink-0" size={12} />
                <span className="truncate">{u.replace(CANONICAL, "")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
