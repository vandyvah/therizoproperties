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
    <section className="relative min-h-screen flex flex-col overflow-hidden">
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
        
        {/* Glossy light effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent" />
        
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12 animate-[shimmer_8s_ease-in-out_infinite]" />
        </div>
        
        {/* Floating light orbs for glossy effect */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* News Modal */}
      {showNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in border border-white/10">
            {/* Glossy modal header */}
            <div className="bg-gradient-to-r from-primary via-primary to-primary/90 p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="flex items-center gap-3 relative z-10">
                <Newspaper className="text-gold w-6 h-6 drop-shadow-lg" />
                <h3 className="font-display text-xl font-bold text-primary-foreground drop-shadow-sm">Therizo News</h3>
              </div>
              <button 
                onClick={() => setShowNews(false)}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors relative z-10"
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
                    className="p-4 rounded-xl bg-muted/50 border border-border hover:border-gold/30 transition-colors backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      {announcement.is_featured && (
                        <Star className="w-4 h-4 text-gold fill-gold drop-shadow-sm" />
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
            {/* Brand Label - Glossy pill */}
            <div className="flex items-center gap-3 mb-6 animate-fade-up">
              <div className="relative">
                <div className="w-1.5 h-8 bg-gradient-to-b from-gold via-gold to-gold-light rounded-full shadow-lg shadow-gold/30" />
                <div className="absolute inset-0 w-1.5 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
              </div>
              <span className="text-gold text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase drop-shadow-lg">
                Therizo Property and Development
              </span>
            </div>

            {/* Main Headline - Enhanced with text shadow */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 animate-fade-up drop-shadow-2xl" style={{ animationDelay: "0.1s" }}>
              Real Estate for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold drop-shadow-lg" style={{ textShadow: "0 0 40px rgba(212, 175, 55, 0.4)" }}>
                disciplined capital.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl animate-fade-up drop-shadow-md" style={{ animationDelay: "0.2s" }}>
              We curate Nigerian properties with clean titles and verified returns. No hype. No ambiguity. Just ownership.
            </p>

            {/* CTA Buttons - Glossy styling */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg" 
                className="relative overflow-hidden bg-gradient-to-r from-gold via-gold to-gold-light text-navy font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 hover:scale-105 group"
                asChild
              >
                <Link to="/properties">
                  {/* Glossy shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10">See Verified Properties</span>
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="relative overflow-hidden bg-white/5 backdrop-blur-md border-2 border-white/30 text-white px-8 py-6 text-base hover:bg-white/15 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
                asChild
              >
                <Link to="/calculator">
                  {/* Glass shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center">
                    Calculate Your ROI
                    <ArrowRight className="ml-2" size={18} />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Latest News Button - Glossy glass effect */}
            <button
              onClick={fetchNews}
              disabled={loadingNews}
              className="mt-6 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-gold/40 transition-all duration-300 animate-fade-up shadow-lg hover:shadow-xl relative overflow-hidden group"
              style={{ animationDelay: "0.4s" }}
            >
              {/* Glossy top highlight */}
              <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full" />
              <span className="text-white/90 text-sm font-medium flex items-center gap-2 relative z-10">
                <Newspaper className="w-4 h-4 drop-shadow-sm" />
                {loadingNews ? 'Loading...' : 'Latest News'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Glossy glass effect */}
      <div className="relative z-10 border-t border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        <div className="container-wide py-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/70">
            {/* Cities */}
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition-colors cursor-pointer hover:drop-shadow-lg">Lagos</span>
              <span className="hover:text-white transition-colors cursor-pointer hover:drop-shadow-lg">Abuja</span>
              <span className="hover:text-white transition-colors cursor-pointer hover:drop-shadow-lg">Port Harcourt</span>
              <span className="hidden sm:block w-2 h-2 rounded-full bg-gradient-to-r from-gold to-gold-light shadow-lg shadow-gold/50" />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light font-semibold drop-shadow-lg">₦12B+ Transacted</span>
              <span className="drop-shadow-sm">100% Verified Titles</span>
              <span className="drop-shadow-sm">Diaspora Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
