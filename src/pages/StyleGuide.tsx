import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Star, Home, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const colorSwatches = [
  { name: "Brand Navy", variable: "--navy", hex: "#081A2F", usage: "Primary (60-70%)" },
  { name: "Charcoal", variable: "--charcoal", hex: "#0F1216", usage: "Footer, deep backgrounds" },
  { name: "Champagne Gold", variable: "--gold", hex: "#C7A86A", usage: "Accent (5-10%) - CTAs, highlights" },
  { name: "Emerald", variable: "--emerald", hex: "#1F6F5B", usage: "Optional - link hover states" },
  { name: "Ivory", variable: "--ivory", hex: "#F7F3EA", usage: "Background (20-30%)" },
  { name: "Warm White", variable: "--warm-white", hex: "#FFFCF6", usage: "Cards, surfaces" },
  { name: "Sand Gray", variable: "--sand", hex: "#D8D1C5", usage: "Borders" },
  { name: "Ink", variable: "--ink", hex: "#111827", usage: "Primary text" },
  { name: "Slate", variable: "--slate", hex: "#6B7280", usage: "Muted text" },
];

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="bg-navy py-16">
        <div className="container-wide">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ivory mb-4">
            Therizo Style Guide
          </h1>
          <p className="text-ivory/70 text-lg max-w-2xl">
            A comprehensive guide to the Therizo luxury brand identity, color system, typography, and UI components.
          </p>
        </div>
      </header>

      <main className="container-wide py-16 space-y-20">
        {/* Color Palette */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Color Palette</h2>
          <p className="text-slate mb-8">The refined color system that defines Therizo's luxury brand identity.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorSwatches.map((color) => (
              <div key={color.name} className="bg-warm-white border border-sand rounded-sm overflow-hidden">
                <div 
                  className="h-20 w-full" 
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-4">
                  <h3 className="font-display font-semibold text-ink">{color.name}</h3>
                  <p className="text-sm text-slate font-mono">{color.hex}</p>
                  <p className="text-xs text-slate mt-1">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Typography</h2>
          <p className="text-slate mb-8">Playfair Display for headings, DM Sans for body text.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Light Background */}
            <Card className="bg-warm-white border-sand">
              <CardHeader>
                <CardTitle className="text-ink">Light Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h1 className="font-display text-4xl font-bold text-ink">Heading 1</h1>
                <h2 className="font-display text-3xl font-bold text-ink">Heading 2</h2>
                <h3 className="font-display text-2xl font-semibold text-ink">Heading 3</h3>
                <h4 className="font-display text-xl font-semibold text-ink">Heading 4</h4>
                <p className="text-ink">Body text in Ink (#111827) for maximum readability on light surfaces.</p>
                <p className="text-slate">Muted text in Slate (#6B7280) for secondary information.</p>
              </CardContent>
            </Card>

            {/* Dark Background */}
            <div className="bg-navy rounded-sm p-6 space-y-4">
              <h3 className="font-display text-xl font-semibold text-ivory mb-4">Navy Background</h3>
              <h1 className="font-display text-4xl font-bold text-ivory">Heading 1</h1>
              <h2 className="font-display text-3xl font-bold text-ivory">Heading 2</h2>
              <h3 className="font-display text-2xl font-semibold text-ivory">Heading 3</h3>
              <p className="text-ivory">Body text in Ivory (#F7F3EA) on navy backgrounds.</p>
              <p className="text-ivory/60">Muted text with reduced opacity.</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Buttons</h2>
          <p className="text-slate mb-8">Three button variants for different contexts.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Light Background Buttons */}
            <Card className="bg-warm-white border-sand">
              <CardHeader>
                <CardTitle className="text-ink">On Light Backgrounds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate font-medium">Primary CTA (Gold)</p>
                  <Button variant="gold" size="lg">
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate font-medium">Secondary (Outline)</p>
                  <Button variant="outline" size="lg" className="border-gold text-gold hover:bg-gold/10">
                    Learn More
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate font-medium">Default</p>
                  <Button size="lg">
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dark Background Buttons */}
            <div className="bg-navy rounded-sm p-6 space-y-6">
              <h3 className="font-display text-xl font-semibold text-ivory">On Navy Backgrounds</h3>
              <div className="space-y-2">
                <p className="text-sm text-ivory/60 font-medium">Inverse CTA</p>
                <Button size="lg" className="bg-ivory text-navy hover:bg-ivory/90">
                  Schedule Viewing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-ivory/60 font-medium">Gold Outline</p>
                <Button variant="outline" size="lg" className="border-gold text-gold hover:bg-gold/10">
                  Explore Portfolio
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-ivory/60 font-medium">Ghost</p>
                <Button variant="ghost" size="lg" className="text-ivory hover:bg-ivory/10">
                  View All
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Cards</h2>
          <p className="text-slate mb-8">Warm White cards with Sand Gray borders and minimal shadows.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-warm-white border-sand shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-gold mb-2">
                  <Home className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Featured</span>
                </div>
                <CardTitle className="text-ink">Luxury Villa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm mb-4">5 Bed • 6 Bath • 850 sqm</p>
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="text-sm">Banana Island, Lagos</span>
                </div>
                <p className="font-display text-2xl font-bold text-ink mt-4">₦1.2B</p>
              </CardContent>
            </Card>

            <Card className="bg-warm-white border-sand shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald mb-2">
                  <Check className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Verified</span>
                </div>
                <CardTitle className="text-ink">Penthouse Suite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm mb-4">4 Bed • 5 Bath • 420 sqm</p>
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="text-sm">Ikoyi, Lagos</span>
                </div>
                <p className="font-display text-2xl font-bold text-ink mt-4">₦850M</p>
              </CardContent>
            </Card>

            <Card className="bg-warm-white border-sand shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-gold mb-2">
                  <Star className="h-5 w-5" />
                  <span className="text-xs font-semibold tracking-wider uppercase">Premium</span>
                </div>
                <CardTitle className="text-ink">Waterfront Estate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm mb-4">6 Bed • 8 Bath • 1200 sqm</p>
                <div className="flex items-center gap-2 text-ink">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span className="text-sm">Victoria Island, Lagos</span>
                </div>
                <p className="font-display text-2xl font-bold text-ink mt-4">₦2.5B</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Links</h2>
          <p className="text-slate mb-8">Links use Emerald for hover states, Gold for emphasis.</p>
          
          <Card className="bg-warm-white border-sand">
            <CardContent className="pt-6 space-y-4">
              <p>
                <a href="#" className="text-emerald hover:text-emerald-light hover:underline transition-colors">
                  Standard Emerald Link
                </a>
              </p>
              <p>
                <a href="#" className="text-gold hover:text-gold-dark hover:underline transition-colors">
                  Gold Accent Link
                </a>
              </p>
              <p>
                <a href="#" className="text-ink hover:text-gold transition-colors">
                  Ink Link with Gold Hover
                </a>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Premium Section Example */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Premium Section</h2>
          <p className="text-slate mb-8">Navy background sections for premium content areas.</p>
          
          <div className="bg-navy rounded-sm p-8 md:p-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gold" />
                <span className="text-gold text-xs font-bold tracking-widest uppercase">Private Client</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory mb-4">
                Exclusive Off-Market Properties
              </h2>
              <p className="text-ivory/70 mb-8">
                Access our curated portfolio of premium properties not available to the general market. 
                Vetted for documentation, returns, and investment potential.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg">
                  Request Access <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-ivory/30 text-ivory hover:bg-ivory/10">
                  <Phone className="mr-2 h-4 w-4" />
                  Schedule Call
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="font-display text-3xl font-bold text-ink mb-2">Usage Guidelines</h2>
          <p className="text-slate mb-8">Color distribution and styling rules.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-warm-white border-sand">
              <CardHeader>
                <CardTitle className="text-ink">Navy (60-70%)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm">
                  Dominates as the primary brand color. Used for headers, premium sections, 
                  navigation, and establishing authority.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-warm-white border-sand">
              <CardHeader>
                <CardTitle className="text-ink">Ivory/White (20-30%)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm">
                  Creates breathing room. Page backgrounds, cards, content areas. 
                  Ensures readability and elegance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-warm-white border-sand">
              <CardHeader>
                <CardTitle className="text-ink">Gold (5-10%)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate text-sm">
                  Surgical accent use only. CTAs, icons, key highlights, dividers. 
                  Never large backgrounds. Maintains luxury feel.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer Preview */}
      <footer className="bg-charcoal py-12">
        <div className="container-wide text-center">
          <p className="text-ivory/60 text-sm">
            Footer uses Charcoal (#0F1216) background with Ivory text
          </p>
          <Link to="/" className="text-gold hover:text-gold-light transition-colors text-sm mt-2 inline-block">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
