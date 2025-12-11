import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-lagos.jpg";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_featured: boolean;
  published_at: string;
}

export function HeroSection() {
  const [showNews, setShowNews] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setAnnouncements(data || []);
      setShowNews(true);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'listing': return 'bg-gold text-navy';
      case 'report': return 'bg-blue-500 text-white';
      case 'news': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury Nigerian Real Estate"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-navy/30" />
      </div>

      {/* News Modal */}
      {showNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="bg-primary p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="text-gold w-6 h-6" />
                <h3 className="font-display text-xl font-bold text-primary-foreground">Therizo News</h3>
              </div>
              <button 
                onClick={() => setShowNews(false)}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {announcements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No announcements at this time.</p>
              ) : (
                announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border hover:border-gold/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      {announcement.is_featured && (
                        <Star className="w-4 h-4 text-gold fill-gold" />
                      )}
                    </div>
                    <h4 className="font-display font-semibold text-foreground mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.published_at).toLocaleDateString('en-NG', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center pt-20">
        <div className="container-wide">
          <div className="max-w-2xl">
            {/* Brand Label */}
            <div className="flex items-center gap-2 mb-6 animate-fade-up">
              <div className="w-1 h-6 bg-gold" />
              <span className="text-gold text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                Therizo Property and Development
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Real Estate for<br />
              <span className="text-gold">disciplined capital.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl animate-fade-up" style={{ animationDelay: "0.2s" }}>
              We curate Nigerian properties with clean titles and verified returns. No hype. No ambiguity. Just ownership.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg" 
                className="bg-gold hover:bg-gold-light text-navy font-semibold px-8 py-6 text-base transition-all duration-300"
                asChild
              >
                <Link to="/properties">
                  View Curated Portfolio
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-2 border-white/40 text-white px-8 py-6 text-base hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                asChild
              >
                <Link to="/calculator">
                  Model Your Returns
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </Button>
            </div>

            {/* Latest News Button */}
            <button
              onClick={fetchNews}
              disabled={loadingNews}
              className="mt-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-gold/30 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="text-white/90 text-sm font-medium flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                {loadingNews ? 'Loading...' : 'Latest News'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="container-wide py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/70">
            {/* Cities */}
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Lagos</span>
              <span className="hover:text-white transition-colors cursor-pointer">Abuja</span>
              <span className="hover:text-white transition-colors cursor-pointer">Port Harcourt</span>
              <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gold" />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-6">
              <span className="text-gold font-semibold">₦12B+ Transacted</span>
              <span>100% Verified Titles</span>
              <span>Diaspora Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
