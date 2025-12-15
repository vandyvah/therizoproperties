import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd, createOrganizationSchema } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Newspaper, 
  Download, 
  Mail, 
  Building2,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  ExternalLink
} from "lucide-react";

const stats = [
  { label: "Transaction Volume", value: "₦12B+", description: "Total property value transacted" },
  { label: "Properties Verified", value: "500+", description: "Properties through due diligence" },
  { label: "Client Base", value: "4", description: "Countries with active clients" },
  { label: "Years Operating", value: "5+", description: "Years in Nigerian real estate" },
];

const pressReleases = [
  {
    title: "Therizo Launches Private Vault for Ultra-High-Net-Worth Clients",
    date: "December 2025",
    summary: "Exclusive off-market platform provides verified clients access to trophy properties not publicly listed.",
  },
  {
    title: "New Diaspora Mortgage Calculator Helps Foreign Income Buyers",
    date: "November 2025",
    summary: "Tool enables diaspora investors to estimate Nigerian mortgage eligibility using international income.",
  },
  {
    title: "Therizo Expands to Port Harcourt Market",
    date: "September 2025",
    summary: "Company extends verified property portfolio to Nigeria's key oil and gas hub.",
  },
];

const mediaAssets = [
  { name: "Therizo Logo (Dark)", format: "PNG, SVG", size: "2 KB" },
  { name: "Therizo Logo (Light)", format: "PNG, SVG", size: "2 KB" },
  { name: "Brand Guidelines", format: "PDF", size: "1.2 MB" },
  { name: "Executive Headshots", format: "ZIP", size: "5 MB" },
];

export default function Press() {
  return (
    <Layout>
      <SEOHead
        title="Press & Media Kit | Therizo Nigerian Real Estate"
        description="Press resources, media kit, and company information for journalists and partners. Download logos, brand assets, and get company facts about Therizo."
        canonical="/press"
        keywords={[
          "Therizo press",
          "Nigerian real estate news",
          "Lagos property company",
          "Therizo media kit",
          "real estate press release Nigeria"
        ]}
        ogImage="https://therizoproperties.com/og/og-press.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs
            items={[{ label: "Press & Media" }]}
            className="mb-8 text-ivory/60"
          />
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Newspaper className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Media Resources</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Press & Media Kit
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Resources for journalists, analysts, and partners. Download brand 
              assets, access company information, and find contact details for 
              media inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink mb-6">
                About Therizo
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate leading-relaxed mb-4">
                  Therizo Property and Development Corporation is a boutique Nigerian 
                  real estate firm specializing in curated, verified properties for 
                  serious buyers and investors.
                </p>
                <p className="text-slate leading-relaxed mb-4">
                  Founded with a mission to bring transparency and discipline to 
                  Nigerian real estate, Therizo operates across Lagos, Abuja, Port 
                  Harcourt, and key growth corridors. The company serves both domestic 
                  buyers and diaspora investors who need trusted local execution.
                </p>
                <p className="text-slate leading-relaxed">
                  Every property listed by Therizo undergoes rigorous title verification 
                  and market analysis. The company refuses to list properties that fail 
                  its due diligence standards—a practice that has built its reputation 
                  among discerning clients.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink mb-6">
                Key Facts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-warm-white border border-sand rounded-sm p-6"
                  >
                    <p className="font-display text-3xl font-bold text-gold mb-1">
                      {stat.value}
                    </p>
                    <p className="font-semibold text-ink text-sm mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xs text-slate">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Locations */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-warm-white border border-sand rounded-sm p-6">
              <Building2 className="text-gold mb-4" size={32} />
              <h3 className="font-display text-lg font-semibold text-ink mb-3">
                Services
              </h3>
              <ul className="text-slate text-sm space-y-2">
                <li>Property Sales & Acquisitions</li>
                <li>Investment Advisory</li>
                <li>Title Verification & Due Diligence</li>
                <li>Developer Partnerships</li>
                <li>Diaspora Client Services</li>
              </ul>
            </div>
            <div className="bg-warm-white border border-sand rounded-sm p-6">
              <MapPin className="text-gold mb-4" size={32} />
              <h3 className="font-display text-lg font-semibold text-ink mb-3">
                Markets Served
              </h3>
              <ul className="text-slate text-sm space-y-2">
                <li>Lagos (Ikoyi, VI, Lekki, Ajah)</li>
                <li>Abuja (Maitama, Wuse, Asokoro)</li>
                <li>Port Harcourt</li>
                <li>Ogun State Growth Corridors</li>
                <li>Diaspora (UK, US, Europe, Middle East)</li>
              </ul>
            </div>
            <div className="bg-warm-white border border-sand rounded-sm p-6">
              <Users className="text-gold mb-4" size={32} />
              <h3 className="font-display text-lg font-semibold text-ink mb-3">
                Client Segments
              </h3>
              <ul className="text-slate text-sm space-y-2">
                <li>High-Net-Worth Buyers</li>
                <li>Diaspora Investors</li>
                <li>Developers & Landowners</li>
                <li>Corporate Clients</li>
                <li>Family Offices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-semibold text-ink mb-4">
              Media Assets
            </h2>
            <p className="text-slate">
              Download logos, brand guidelines, and visual assets for editorial use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {mediaAssets.map((asset) => (
              <div
                key={asset.name}
                className="bg-warm-white border border-sand rounded-sm p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-ink text-sm">{asset.name}</p>
                  <p className="text-xs text-slate">{asset.format} • {asset.size}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate">
              For high-resolution images or custom assets, please contact our media team.
            </p>
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-ink mb-8 text-center">
              Recent Announcements
            </h2>
            <div className="space-y-4">
              {pressReleases.map((release) => (
                <div
                  key={release.title}
                  className="bg-warm-white border border-sand rounded-sm p-6 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm text-gold font-medium mb-1">{release.date}</p>
                    <h3 className="font-display text-lg font-semibold text-ink mb-2">
                      {release.title}
                    </h3>
                    <p className="text-slate text-sm">{release.summary}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <ExternalLink size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="section-padding bg-navy">
        <div className="container-narrow text-center">
          <Mail className="mx-auto text-gold mb-6" size={48} />
          <h2 className="font-display text-3xl font-semibold text-ivory mb-4">
            Media Inquiries
          </h2>
          <p className="text-lg text-ivory/80 leading-relaxed mb-8 max-w-xl mx-auto">
            For press inquiries, interview requests, or additional information, 
            please contact our communications team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <a href="mailto:press@therizoproperties.com">
                <Mail className="mr-2" size={18} />
                press@therizoproperties.com
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10" asChild>
              <Link to="/contact">General Inquiries</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
