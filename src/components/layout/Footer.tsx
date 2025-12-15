import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { href: "/our-standard", label: "Our Standard" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
    { href: "/press", label: "Press & Media" },
  ],
  services: [
    { href: "/properties", label: "Properties" },
    { href: "/calculator", label: "ROI Calculator" },
    { href: "/contact", label: "Book Consultation" },
  ],
  guides: [
    { href: "/guides/title-verification", label: "Title Verification Guide" },
    { href: "/guides/buyer-guide", label: "Property Buyer's Guide" },
    { href: "/guides/roi-methodology", label: "ROI Methodology" },
  ],
  locations: [
    { href: "/locations/lagos", label: "Lagos" },
    { href: "/locations/abuja", label: "Abuja" },
    { href: "/locations/port-harcourt", label: "Port Harcourt" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-semibold text-ivory">
                Therizo
              </span>
            </Link>
            <p className="mt-4 text-ivory/70 text-sm leading-relaxed">
              Curated Nigerian properties, clean titles, and disciplined returns
              for buyers and investors who take their money seriously.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-ivory">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-ivory">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-ivory">
              Guides
            </h4>
            <ul className="space-y-3">
              {footerLinks.guides.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Locations Row */}
        <div className="mt-10 pt-8 border-t border-ivory/10">
          <h4 className="font-display text-lg font-semibold mb-4 text-ivory">
            Locations
          </h4>
          <div className="flex flex-wrap gap-4">
            {footerLinks.locations.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-ivory/70 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Row */}
        <div className="mt-12 pt-8 border-t border-ivory/10 grid md:grid-cols-2 gap-8">
          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-ivory">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-ivory/70">
                <MapPin size={18} className="shrink-0 mt-0.5 text-gold" />
                <span>Suite C1, Plot 759, Kubwa Extension, F15, Abuja</span>
              </li>
              <li>
                <a
                  href="mailto:hello@therizo.com"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-gold transition-colors"
                >
                  <Mail size={18} className="shrink-0 text-gold" />
                  <span>hello@therizo.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348034830087"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-gold transition-colors"
                >
                  <Phone size={18} className="shrink-0 text-gold" />
                  <span>+234 803 483 0087</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ivory/50">
            © {new Date().getFullYear()} Therizo Property and Development
            Corporation. A subsidiary of Therizo Group. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/press" className="text-xs text-ivory/40 hover:text-gold transition-colors">
              Press
            </Link>
            <span className="text-xs text-ivory/40">
              Nigerian Real Estate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
