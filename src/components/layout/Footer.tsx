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
    { href: "/materials-supply", label: "Materials Supply" },
    { href: "/calculator", label: "ROI Calculator" },
    { href: "/contact", label: "Book Consultation" },
  ],
  guides: [
    { href: "/abuja-starter-kit", label: "Abuja Diaspora Starter Kit" },
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
                  href="mailto:hello@therizoproperties.com"
                  className="flex items-center gap-3 text-sm text-ivory/70 hover:text-gold transition-colors"
                >
                  <Mail size={18} className="shrink-0 text-gold" />
                  <span>hello@therizoproperties.com</span>
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

        {/* Social Links */}
        <div className="mt-10 pt-8 border-t border-ivory/10">
          <div className="flex items-center gap-5">
            <a href="https://x.com/TherizoProperty" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X" className="text-ivory/50 hover:text-gold transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.facebook.com/therizoproperties" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-ivory/50 hover:text-gold transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/therizoproperties" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" className="text-ivory/50 hover:text-gold transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.youtube.com/@therizoproperty" target="_blank" rel="noopener noreferrer" aria-label="Follow us on YouTube" className="text-ivory/50 hover:text-gold transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-ivory/10 flex flex-col md:flex-row justify-between items-center gap-4">
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
