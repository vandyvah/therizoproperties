import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/currency/CurrencySwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/vault", label: "The Vault", icon: Lock, exclusive: true },
  { href: "/calculator", label: "ROI Calculator" },
  { href: "/our-standard", label: "Our Standard" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-navy/98 backdrop-blur-md shadow-sm py-3"
          : "bg-navy py-5"
      )}
    >
      <div className="container-wide flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="font-display text-2xl font-semibold tracking-tight text-ivory transition-colors"
          >
            Therizo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gold flex items-center gap-1.5",
                location.pathname === link.href
                  ? "text-gold"
                  : link.exclusive ? "text-gold" : "text-ivory/90"
              )}
            >
              {link.icon && <link.icon className="h-3.5 w-3.5" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle variant="compact" />
          <CurrencySwitcher variant="compact" />
          <Button
            variant="gold"
            size="sm"
            asChild
          >
            <Link to="/contact">Book a Call</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-md text-ivory hover:bg-ivory/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-navy shadow-lg transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container-wide py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-base font-medium py-2 transition-colors hover:text-gold flex items-center gap-2",
                location.pathname === link.href
                  ? "text-gold"
                  : link.exclusive ? "text-gold" : "text-ivory"
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-ivory/10">
            <Button variant="gold" className="w-full" asChild>
              <Link to="/contact">Book a Call</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
