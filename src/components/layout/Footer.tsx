import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { href: "/our-standard", label: "Our Standard" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
  ],
  services: [
    { href: "/properties", label: "Properties" },
    { href: "/calculator", label: "ROI Calculator" },
    { href: "/contact", label: "Book Consultation" },
  ],
  locations: ["Lagos", "Abuja", "Port Harcourt", "Ogun State"],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-semibold text-primary-foreground">
                Therizo
              </span>
            </Link>
            <p className="mt-4 text-primary-foreground/70 text-sm leading-relaxed">
              Curated Nigerian properties, clean titles, and disciplined returns
              for buyers and investors who take their money seriously.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary-foreground">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-primary-foreground">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin size={18} className="shrink-0 mt-0.5 text-gold" />
                <span>Lagos, Abuja & Key Growth Markets</span>
              </li>
              <li>
                <a
                  href="mailto:hello@therizo.com"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  <Mail size={18} className="shrink-0 text-gold" />
                  <span>hello@therizo.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2341234567890"
                  className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  <Phone size={18} className="shrink-0 text-gold" />
                  <span>+234 123 456 7890</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Therizo Property and Development
            Corporation. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-primary-foreground/40">
              Nigerian Real Estate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
