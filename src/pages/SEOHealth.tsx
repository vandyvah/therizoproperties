import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { SiteIndexingStatus } from "@/components/seo/SiteIndexingStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Globe, FileText, Link as LinkIcon, Shield } from "lucide-react";

// Route configuration for the site
const indexableRoutes = [
  { path: "/", name: "Home", priority: "1.0" },
  { path: "/properties", name: "Properties", priority: "0.9" },
  { path: "/calculator", name: "ROI Calculator", priority: "0.8" },
  { path: "/our-standard", name: "Our Standard", priority: "0.8" },
  { path: "/team", name: "Team", priority: "0.7" },
  { path: "/contact", name: "Contact", priority: "0.8" },
  { path: "/press", name: "Press", priority: "0.6" },
  { path: "/guides/title-verification", name: "Title Verification Guide", priority: "0.8" },
  { path: "/guides/buyer-guide", name: "Buyer Guide", priority: "0.8" },
  { path: "/guides/roi-methodology", name: "ROI Methodology", priority: "0.7" },
  { path: "/locations/lagos", name: "Lagos", priority: "0.9" },
  { path: "/locations/abuja", name: "Abuja", priority: "0.9" },
  { path: "/locations/port-harcourt", name: "Port Harcourt", priority: "0.9" },
  { path: "/properties/:id", name: "Property Detail (dynamic)", priority: "0.8" },
];

const noindexRoutes = [
  { path: "/dashboard", name: "Dashboard Home" },
  { path: "/dashboard/auth", name: "Dashboard Auth" },
  { path: "/dashboard/properties", name: "Dashboard Properties" },
  { path: "/dashboard/leads", name: "Dashboard Leads" },
  { path: "/dashboard/clients", name: "Dashboard Clients" },
  { path: "/dashboard/viewings", name: "Dashboard Viewings" },
  { path: "/dashboard/deals", name: "Dashboard Deals" },
  { path: "/dashboard/roi", name: "Dashboard ROI" },
  { path: "/dashboard/users", name: "User Management" },
  { path: "/dashboard/settings", name: "Dashboard Settings" },
  { path: "/vault", name: "The Vault (auth-gated)" },
  { path: "/style-guide", name: "Style Guide (internal)" },
  { path: "/seo-health", name: "SEO Health (this page)" },
];

const seoConfig = {
  canonicalDomain: "https://therizoproperties.com",
  staticSitemap: "https://therizoproperties.com/sitemap.xml",
  dynamicSitemap: "https://nvpxoxlnculbkmzkpstn.supabase.co/functions/v1/sitemap",
  robotsTxt: "https://therizoproperties.com/robots.txt",
  protocol: "HTTPS only (HTTP redirects to HTTPS)",
  wwwHandling: "Non-www canonical (www redirects to non-www)",
};

const structuredDataPages = [
  { page: "Home", schemas: ["Organization", "RealEstateAgent", "FAQPage"] },
  { page: "Properties", schemas: ["FAQPage"] },
  { page: "Contact", schemas: ["Organization", "FAQPage"] },
  { page: "Calculator", schemas: ["FAQPage"] },
  { page: "Team", schemas: ["Organization"] },
  { page: "Location Pages", schemas: ["LocalBusiness", "FAQPage"] },
  { page: "Guide Pages", schemas: ["Article", "FAQPage"] },
  { page: "Property Detail", schemas: ["RealEstateListing"] },
];

export default function SEOHealth() {
  return (
    <Layout>
      <SEOHead
        title="SEO Health Check | Internal Diagnostic"
        description="Internal SEO diagnostic page for site owners"
        noindex={true}
      />

      <section className="pt-32 pb-8 bg-navy">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-gold" size={32} />
            <Badge variant="outline" className="border-gold text-gold">
              Internal Only • noindex
            </Badge>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ivory mb-4">
            Indexing Health Dashboard
          </h1>
          <p className="text-ivory/80 max-w-2xl">
            This page summarizes SEO configuration for Google URL Inspection compliance.
            It is set to noindex and excluded from sitemaps.
          </p>
        </div>
      </section>

      <section className="section-padding bg-ivory">
        <div className="container-wide space-y-8">
          {/* NEW: Live Site Indexing Status */}
          <SiteIndexingStatus />

          {/* Canonical Domain & Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-gold" size={20} />
                Canonical Domain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">Canonical Domain:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{seoConfig.canonicalDomain}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">Protocol:</span>
                    <span className="text-sm">{seoConfig.protocol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">WWW Handling:</span>
                    <span className="text-sm">{seoConfig.wwwHandling}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">robots.txt:</span>
                    <a href={seoConfig.robotsTxt} target="_blank" rel="noopener" className="text-sm text-gold hover:underline">
                      {seoConfig.robotsTxt}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">Static Sitemap:</span>
                    <a href={seoConfig.staticSitemap} target="_blank" rel="noopener" className="text-sm text-gold hover:underline">
                      View
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-medium">Dynamic Sitemap:</span>
                    <a href={seoConfig.dynamicSitemap} target="_blank" rel="noopener" className="text-sm text-gold hover:underline">
                      View (includes properties)
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indexable Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-green-600" size={20} />
                Indexable Routes ({indexableRoutes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate mb-4">
                These pages have <code className="bg-muted px-1">index, follow</code> and are included in sitemaps.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {indexableRoutes.map((route) => (
                  <div key={route.path} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600 shrink-0" size={14} />
                    <a 
                      href={route.path} 
                      className="text-gold hover:underline truncate"
                      title={route.name}
                    >
                      {route.path}
                    </a>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {route.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Noindex Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                Noindex Routes ({noindexRoutes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate mb-4">
                These pages have <code className="bg-muted px-1">noindex, nofollow</code> and are excluded from sitemaps.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {noindexRoutes.map((route) => (
                  <div key={route.path} className="flex items-center gap-2 text-sm">
                    <XCircle className="text-red-500 shrink-0" size={14} />
                    <span className="text-slate truncate" title={route.name}>
                      {route.path}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Discovery (GEO) */}
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-purple-600" size={20} />
                AI Discovery & Citation Readiness (GEO)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate">
                Configuration for AI search assistants (ChatGPT, Perplexity, Claude) to fetch and cite content.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Allowed AI Crawlers (robots.txt)</h4>
                  <div className="space-y-1">
                    {["GPTBot", "ChatGPT-User", "OAI-SearchBot", "PerplexityBot", "Claude-Web", "Anthropic-AI", "CCBot", "Google-Extended"].map((bot) => (
                      <div key={bot} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="text-green-600 shrink-0" size={14} />
                        <code className="bg-muted px-1 rounded">{bot}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Citation-Ready Features</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={14} />
                      <span>Semantic H1/H2 structure on all pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={14} />
                      <span>FAQ sections with FAQPage schema</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={14} />
                      <span>Organization & RealEstateAgent schemas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={14} />
                      <span>Clear entity signals (name, services, locations)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600 shrink-0" size={14} />
                      <span>Content renders without JS delay</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Distribution */}
          <Card className="border-pink-200 bg-pink-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="text-pink-600" size={20} />
                Social Distribution (Reddit, Pinterest)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Open Graph Tags (All Pages)</h4>
                  <div className="space-y-1 text-sm">
                    {["og:title", "og:description", "og:url", "og:type", "og:image (1200x630)", "og:site_name", "og:locale"].map((tag) => (
                      <div key={tag} className="flex items-center gap-2">
                        <CheckCircle className="text-green-600 shrink-0" size={14} />
                        <code className="bg-muted px-1 rounded">{tag}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Twitter Cards (All Pages)</h4>
                  <div className="space-y-1 text-sm">
                    {["twitter:card (summary_large_image)", "twitter:title", "twitter:description", "twitter:image", "twitter:site (@TherizoNG)"].map((tag) => (
                      <div key={tag} className="flex items-center gap-2">
                        <CheckCircle className="text-green-600 shrink-0" size={14} />
                        <code className="bg-muted px-1 rounded text-xs">{tag}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Pinterest Rich Pins</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 shrink-0" size={14} />
                    <span>Open Graph metadata compatible with Rich Pins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-amber-500 shrink-0" size={14} />
                    <span>Domain verification: Add <code className="bg-muted px-1 rounded">pinterestDomainVerify</code> prop to SEOHead with your token</span>
                  </div>
                  <div className="text-xs text-slate mt-2">
                    To enable Pinterest Rich Pins: Get your domain verification token from Pinterest Business settings,
                    then pass it via the <code className="bg-muted px-1">pinterestDomainVerify</code> prop on the Home page SEOHead component.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Structured Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="text-gold" size={20} />
                Structured Data (JSON-LD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate mb-4">
                Schema markup present on pages (validated against visible content).
              </p>
              <div className="space-y-3">
                {structuredDataPages.map((item) => (
                  <div key={item.page} className="flex items-center gap-3">
                    <span className="font-medium min-w-[140px]">{item.page}:</span>
                    <div className="flex flex-wrap gap-2">
                      {item.schemas.map((schema) => (
                        <Badge key={schema} variant="secondary" className="text-xs">
                          {schema}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-gold" size={20} />
                URL Inspection Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">Crawl Requirements</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    robots.txt allows public pages
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    CSS/JS allowed for rendering
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    Private routes disallowed
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    No Crawl-delay for Googlebot
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">Index Requirements</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    Canonical tags on all pages
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    noindex on private pages
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    Unique titles &amp; descriptions
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="text-green-600" size={14} />
                    hreflang for international targeting
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GSC Setup Checklist */}
          <Card className="border-gold/30 bg-gold/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-gold" size={20} />
                Google Search Console Setup Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Step 1: Verify Domain Ownership</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate">
                  <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="text-gold hover:underline">Google Search Console</a></li>
                  <li>Click "Add Property" → choose "URL prefix"</li>
                  <li>Enter: <code className="bg-muted px-1 rounded">https://therizoproperties.com</code></li>
                  <li>Select "HTML file" verification method</li>
                  <li>HTML verification files are already deployed: <code className="bg-muted px-1 rounded">/google92982f5a15c6c4fe.html</code> and <code className="bg-muted px-1 rounded">/google2e061b228abc1074.html</code></li>
                  <li>Click "Verify" in GSC</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-3">Step 2: Submit Sitemaps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate">
                  <li>Go to Sitemaps section in GSC sidebar</li>
                  <li>Submit static sitemap: <code className="bg-muted px-1 rounded">sitemap.xml</code></li>
                  <li>Submit dynamic sitemap: <code className="bg-muted px-1 rounded text-xs">https://nvpxoxlnculbkmzkpstn.supabase.co/functions/v1/sitemap</code></li>
                  <li>Wait for "Success" status (may take a few minutes)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-3">Step 3: Inspect Key URLs</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate">
                  <li>Go to URL Inspection in GSC sidebar</li>
                  <li>Test these priority URLs:
                    <ul className="ml-6 mt-2 space-y-1 list-disc">
                      <li><code className="bg-muted px-1 rounded">https://therizoproperties.com/</code> (Home)</li>
                      <li><code className="bg-muted px-1 rounded">https://therizoproperties.com/properties</code></li>
                      <li><code className="bg-muted px-1 rounded">https://therizoproperties.com/calculator</code></li>
                      <li><code className="bg-muted px-1 rounded">https://therizoproperties.com/contact</code></li>
                    </ul>
                  </li>
                  <li>Click "Test Live URL" for each</li>
                  <li>Verify all show: <span className="text-green-600 font-medium">"Page is indexable"</span></li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-3">Step 4: Request Indexing (Optional)</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate">
                  <li>After "Test Live URL" shows green, click "Request Indexing"</li>
                  <li>This prioritizes the URL in Google's crawl queue</li>
                  <li>Note: Indexing may take days to weeks depending on Google's schedule</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* URL Inspection Guide */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">What to Look For in URL Inspection</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-green-600">✓ Expected Results (Public Pages)</p>
                  <ul className="space-y-1 text-slate">
                    <li>• Crawl allowed: <strong>Yes</strong></li>
                    <li>• Indexing allowed: <strong>Yes</strong></li>
                    <li>• Page is indexable</li>
                    <li>• No blocked resources</li>
                    <li>• Canonical matches declared</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-red-500">✗ Expected Results (Private Pages)</p>
                  <ul className="space-y-1 text-slate">
                    <li>• Indexing allowed: <strong>No</strong></li>
                    <li>• Page has noindex directive</li>
                    <li>• Excluded from sitemap</li>
                    <li>• e.g., /dashboard, /vault, /seo-health</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
