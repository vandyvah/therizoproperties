import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, MapPin, ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import bayoImage from "@/assets/team-bayo.jpg";

const founder = {
  name: "Victor",
  role: "Founder & Chief Executive Officer",
  bio: "Victor leads Therizo's strategy, capital deployment, and key relationships. He focuses on finding properties and projects where the paperwork, numbers, and execution can support long-term value for both the firm and its clients. Victor personally oversees high-value transactions and all joint-venture and development discussions.",
  initial: "V",
};

const consultants = [
  {
    name: "Bayo",
    role: "Senior Property Consultant",
    location: "Lagos Island",
    bio: "Bayo focuses on Lagos Island corridors such as Lekki, Ajah, and surrounding estates. He works with buyers, investors, and developers on mid-to-high value residential and mixed-use properties, with an emphasis on strong rental demand and practical design. Clients rely on him for realistic expectations, straight feedback, and diligent follow-up.",
    initial: "B",
    image: bayoImage,
  },
  {
    name: "Kelly",
    role: "Senior Property Consultant",
    location: "Ikoyi & Victoria Island",
    bio: "Kelly covers Ikoyi, Banana Island, Victoria Island, and other prime luxury pockets. He works with high-net-worth individuals, family offices, and corporate clients looking for secure, trophy-level or income-producing assets. He is known for rigorous deal preparation and careful management of complex negotiations.",
    initial: "K",
    image: null,
  },
  {
    name: "Aisha",
    role: "Senior Property Consultant",
    location: "Abuja & Emerging Markets",
    bio: "Aisha focuses on Abuja and select mainland and emerging growth markets. She serves both end-users and investors, especially those looking for structured payment plans, affordable but documented housing, and developments with solid fundamentals. Her strength is clear communication and patient guidance through the full acquisition process.",
    initial: "A",
    image: null,
  },
];

const workflowSteps = [
  "The CEO sets strategy and approves properties",
  "Senior consultants drive deals and manage client relationships",
  "Legal and external partners support documentation and compliance",
];

const Team = () => {
  return (
    <Layout>
      <SEOHead
        title="Meet the Therizo Team | Nigerian Property Consultants"
        description="Meet our experienced property consultants serving Lagos, Abuja, and key Nigerian markets. Trusted advisors for buyers, investors, and developers."
        keywords="Nigerian real estate team, Lagos property consultants, Abuja real estate agents, Therizo team, Nigerian property experts"
        canonicalUrl="/team"
        ogImage="https://therizoproperties.com/og/og-team.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy">
        <div className="container-wide">
          <Breadcrumbs items={[{ label: "Team", href: "/team" }]} />
          <div className="max-w-3xl mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center">
                <Users className="text-gold" size={24} />
              </div>
              <span className="text-gold font-medium">Our People</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-ivory mb-6">
              Team & Advisors
            </h1>
            <p className="text-lg text-ivory/80 leading-relaxed">
              Therizo is built for clients who want clear answers and
              accountable people. Our team combines capital, on-ground
              experience, and local relationships across Nigeria's key markets.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-1">
              <div className="text-center lg:text-left">
                <div className="w-32 h-32 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center mb-6">
                  <span className="text-5xl font-display font-semibold text-ivory">
                    {founder.initial}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-ink mb-2">
                  {founder.name}
                </h2>
                <p className="text-gold font-medium">{founder.role}</p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="text-lg text-slate leading-relaxed">
                {founder.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Senior Consultants */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="max-w-3xl mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
              Senior Property Consultants
            </h2>
            <p className="text-lg text-slate">
              Each senior consultant is responsible for a defined market and a
              clear revenue target. They manage listings, viewings,
              negotiations, and client communication from first contact to
              completion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {consultants.map((consultant) => (
              <div
                key={consultant.name}
                className="bg-warm-white rounded-sm border border-sand p-6 md:p-8 hover:shadow-md transition-all duration-300"
              >
                <div className="text-center mb-4 md:mb-6">
                  {consultant.image ? (
                    <img
                      src={consultant.image}
                      alt={consultant.name}
                      className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full object-cover object-top mb-4 border-2 border-gold/30"
                    />
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4">
                      <span className="text-3xl md:text-4xl font-display font-semibold text-navy">
                        {consultant.initial}
                      </span>
                    </div>
                  )}
                  <h3 className="font-display text-lg md:text-xl font-semibold text-ink mb-1">
                    {consultant.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gold font-medium mb-2">
                    {consultant.role}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-slate">
                    <MapPin size={14} />
                    <span>{consultant.location}</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate leading-relaxed text-center sm:text-left">
                  {consultant.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding bg-ivory">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
                How We Work as a Team
              </h2>
              <p className="text-lg text-slate leading-relaxed mb-8">
                Every client of Therizo is supported by the entire firm, not
                just one person.
              </p>
              <ul className="space-y-4 mb-8">
                {workflowSteps.map((step) => (
                  <li key={step} className="flex items-start gap-4">
                    <ArrowRight className="text-gold shrink-0 mt-1" size={20} />
                    <span className="text-ink">{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-slate">
                We keep communications simple, transparent, and written. From
                first enquiry to closing, you know who is responsible at each
                stage.
              </p>
            </div>
            <div>
              <div className="bg-navy rounded-sm p-10 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gold/20 flex items-center justify-center mb-6">
                  <Users className="text-gold" size={40} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-ivory mb-4">
                  One Team. One Standard.
                </h3>
                <p className="text-ivory/70">
                  Clear accountability from first contact to completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-ivory">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-6">
            Ready to Work with Us?
          </h2>
          <p className="text-lg text-slate leading-relaxed mb-10 max-w-2xl mx-auto">
            Connect with our team and discuss how we can help you find the right
            property.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/contact">Contact the Therizo Team</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Team;
