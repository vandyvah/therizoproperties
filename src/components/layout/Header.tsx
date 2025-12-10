import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/calculator", label: "ROI Calculator" },
  { href: "/our-standard", label: "Our Standard" },
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
          ? "bg-card/95 backdrop-blur-md shadow-therizo-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container-wide flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span
            className={cn(
              "font-display text-2xl font-semibold tracking-tight transition-colors",
              isScrolled ? "text-primary" : "text-primary-foreground"
            )}
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
                "text-sm font-medium transition-colors hover:text-gold",
                location.pathname === link.href
                  ? "text-gold"
                  : isScrolled
                  ? "text-foreground"
                  : "text-primary-foreground/90"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant={isScrolled ? "gold" : "hero"}
            size="sm"
            asChild
          >
            <Link to="/contact">Book a Call</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "lg:hidden p-2 rounded-md transition-colors",
            isScrolled
              ? "text-foreground hover:bg-muted"
              : "text-primary-foreground hover:bg-primary-foreground/10"
          )}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-card shadow-therizo-lg transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container-wide py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-base font-medium py-2 transition-colors hover:text-gold",
                location.pathname === link.href
                  ? "text-gold"
                  : "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border">
            <Button variant="gold" className="w-full" asChild>
              <Link to="/contact">Book a Call</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
