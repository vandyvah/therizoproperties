import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, X, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const {
        data,
        error
      } = await supabase.from('announcements').select('*').order('published_at', {
        ascending: false
      }).limit(5);
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
      case 'listing':
        return 'bg-gold text-navy';
      case 'report':
        return 'bg-blue-500 text-white';
      case 'news':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-muted text-foreground';
    }
  };
  return <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Video/Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-[120%] -top-[10%]" style={{
        transform: `translateY(${scrollY * 0.3}px)`,
        willChange: 'transform'
      }}>
          {/* Video Background */}
          <video autoPlay muted loop playsInline poster={heroImage} className="absolute inset-0 w-full h-full object-cover">
            <source src="https://videos.pexels.com/video-files/3773486/3773486-uhd_2560_1440_30fps.mp4" type="video/mp4" />
            {/* Fallback to image if video doesn't load */}
          </video>
          
          {/* Image Fallback (shows while video loads or if video fails) */}
          <img src={heroImage} alt="Luxury Nigerian Real Estate" className="absolute inset-0 w-full h-full object-cover -z-10" />
        </div>
        
        {/* Elite dark overlay - sophisticated and refined */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a]/95 via-[#0a0f1a]/75 to-[#0a0f1a]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/80 via-transparent to-[#0a0f1a]/30" />
        
        {/* Subtle gold accent lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] via-transparent to-transparent" />
        
        {/* Refined shimmer - slower, more elegant */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-12 animate-[shimmer_12s_ease-in-out_infinite]" />
        </div>
        
        {/* Subtle ambient glow - understated luxury */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gold/[0.08] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[150px]" />
        
        {/* Fine grain texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
      }} />
      </div>

      {/* News Modal */}
      {showNews && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-scale-in border border-white/10">
            {/* Glossy modal header */}
            <div className="bg-gradient-to-r from-primary via-primary to-primary/90 p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              <div className="flex items-center gap-3 relative z-10">
                <Newspaper className="text-gold w-6 h-6 drop-shadow-lg" />
                <h3 className="font-display text-xl font-bold text-primary-foreground drop-shadow-sm">Therizo News</h3>
              </div>
              <button onClick={() => setShowNews(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors relative z-10">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {announcements.length === 0 ? <p className="text-muted-foreground text-center py-8">No announcements at this time.</p> : announcements.map(announcement => <div key={announcement.id} className="p-4 rounded-xl bg-muted/50 border border-border hover:border-gold/30 transition-colors backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      {announcement.is_featured && <Star className="w-4 h-4 text-gold fill-gold drop-shadow-sm" />}
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
                  </div>)}
            </div>
          </div>
        </div>}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center pt-20">
        <div className="container-wide">
          <div className="max-w-2xl">
            {/* Brand Label - Refined elite styling */}
            <div className="flex items-center gap-4 mb-8 animate-fade-up">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold to-gold" />
              <span className="text-gold/90 text-xs font-medium tracking-[0.3em] uppercase">
                Therizo Property & Development
              </span>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent via-gold to-gold" />
            </div>

            {/* Main Headline - Elite, authoritative */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-up tracking-tight" style={{
            animationDelay: "0.1s"
          }}>
              Prime Property for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-[#e8c252] to-gold">
                Disciplined Capital.
              </span>
            </h1>

            {/* Subheadline - Refined, confident */}
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-lg animate-fade-up font-light tracking-wide" style={{
            animationDelay: "0.2s"
          }}>Vetted Nigerian Properties with verified titles and transparent returns—before you commit a single naira.</p>

            {/* CTA Buttons - Elite, refined styling */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style={{
            animationDelay: "0.3s"
          }}>
              <Button size="lg" className="relative overflow-hidden bg-gold hover:bg-gold/90 text-[#0a0f1a] font-semibold px-10 py-6 text-sm tracking-wider uppercase transition-all duration-500 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 group" asChild>
                <Link to="/properties">
                  <span className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent" />
                  <span className="relative z-10">View Portfolio</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="relative overflow-hidden bg-transparent border border-white/20 text-white/90 px-10 py-6 text-sm tracking-wider uppercase hover:bg-white/5 hover:border-white/40 transition-all duration-500 group" asChild>
                <Link to="/calculator">
                  <span className="relative z-10 flex items-center">
                    Calculate ROI
                    <ArrowRight className="ml-3 transition-transform group-hover:translate-x-1" size={16} />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Private Client Inquiry - Exclusive CTA */}
            <div className="mt-10 pt-8 border-t border-white/[0.06] animate-fade-up" style={{
            animationDelay: "0.4s"
          }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button size="lg" className="relative overflow-hidden bg-transparent border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 px-8 py-5 text-xs tracking-[0.2em] uppercase transition-all duration-500 group" asChild>
                  <Link to="/contact?inquiry=private">
                    <Crown className="w-4 h-4 mr-3" />
                    <span className="relative z-10">Private Client Inquiry</span>
                  </Link>
                </Button>
                <span className="text-white/40 text-xs tracking-wide">
                  For investments above ₦500M
                </span>
              </div>
            </div>

            {/* Latest News Button - Subtle, refined */}
            <button onClick={fetchNews} disabled={loadingNews} className="mt-6 px-6 py-2.5 rounded-none bg-transparent border border-white/10 hover:border-gold/30 hover:bg-white/[0.02] transition-all duration-500 animate-fade-up group" style={{
            animationDelay: "0.5s"
          }}>
              <span className="text-white/60 text-xs font-medium tracking-wider uppercase flex items-center gap-3 group-hover:text-white/80 transition-colors">
                <Newspaper className="w-3.5 h-3.5" />
                {loadingNews ? "Loading..." : "Latest Updates"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Elite, minimal */}
      <div className="relative z-10 border-t border-white/[0.06] bg-[#0a0f1a]/40 backdrop-blur-sm">
        <div className="container-wide py-5">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs tracking-wider">
            {/* Cities */}
            <div className="flex items-center gap-8 text-white/50">
              <span className="hover:text-gold transition-colors cursor-pointer uppercase">Lagos</span>
              <span className="hover:text-gold transition-colors cursor-pointer uppercase">Abuja</span>
              <span className="hover:text-gold transition-colors cursor-pointer uppercase">Port Harcourt</span>
              <span className="w-1 h-1 rounded-full bg-gold/60" />
            </div>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-8 text-white/40">
              <span className="text-gold/80 font-medium">₦12B+ Transacted</span>
              <span>Verified Titles</span>
              <span>Diaspora Trusted</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
}