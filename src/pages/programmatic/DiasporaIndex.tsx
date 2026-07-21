import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createBreadcrumbSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, ArrowRight } from "lucide-react";
import { DIASPORA_COUNTRIES } from "@/data/programmatic";

export default function DiasporaIndex() {
  const breadcrumbs = [
    { name: "Home", url: "https://therizoproperties.com/" },
    { name: "Diaspora", url: "https://therizoproperties.com/diaspora" },
  ];

  return (
    <Layout>
      <SEOHead
        title="Diaspora Investors — Buy Nigerian Property from Anywhere"
        description="Country-by-country guides for diaspora Nigerians buying property back home: UK, US, Canada, UAE, Germany, and the Netherlands. Verified paperwork, remote execution."
        canonical="/diaspora"
        keywords={["diaspora Nigeria property", "buy Nigerian property abroad", "UK Nigeria property", "US Nigeria property"]}
      />
      <JsonLd data={createBreadcrumbSchema(breadcrumbs)} />

      <section className="bg-navy text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Breadcrumbs className="!text-white/70 mb-6" items={[{ label: "Diaspora" }]} />
          <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4">
            Diaspora investor playbooks
          </h1>
          <p className="text-lg text-white/80 max-w-3xl">
            Pick your country of residence. We've written a specific playbook for each of the six diaspora
            markets we serve — remittance, tax treatment, common concerns, and how we execute remotely.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-4">
          {DIASPORA_COUNTRIES.map((c) => (
            <Link key={c.slug} to={`/diaspora/${c.slug}`} className="group">
              <Card className="h-full hover:border-gold transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wider mb-2">
                    <Globe2 className="h-4 w-4" /> {c.currency}
                  </div>
                  <div className="font-display text-xl font-semibold mb-2 group-hover:text-gold transition-colors">
                    {c.country}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{c.intro}</p>
                  <div className="mt-4 text-sm text-navy inline-flex items-center gap-1 group-hover:text-gold">
                    Read {c.country} playbook <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
