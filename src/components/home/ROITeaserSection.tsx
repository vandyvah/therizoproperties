import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ROITeaserSection() {
  return (
    <section className="py-16 md:py-28 bg-navy text-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="italic text-white">Run the Numbers.</span>
              <br />
              <span className="italic text-gold">Remove the Emotion.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6 md:mb-8 max-w-md mx-auto lg:mx-0">
              Property decisions should not be based on vibes. Use the Therizo ROI Calculator to model your potential returns in Nigerian Naira (₦). Calculate Cash-on-Cash return, Cap Rate, and Payback Period in seconds.
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-5 sm:px-6 py-4 sm:py-5 text-sm sm:text-base"
              asChild
            >
              <Link to="/calculator" className="flex items-center gap-2">
                Open ROI Calculator
                <BarChart3 size={18} />
              </Link>
            </Button>
          </div>

          {/* Right Content - Bar Chart */}
          <div className="relative mt-8 lg:mt-0">
            {/* ROI Label */}
            <div className="absolute -top-2 right-4 sm:right-8 bg-navy border border-white/20 rounded px-2 sm:px-3 py-1 sm:py-1.5 z-10">
              <span className="text-gold font-display font-bold text-base sm:text-lg">22%</span>
              <span className="text-white/70 text-xs sm:text-sm ml-1">ROI</span>
            </div>

            {/* Chart Container */}
            <div className="flex items-end justify-center gap-4 sm:gap-6 h-48 sm:h-64 pt-8">
              {/* Year 1 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-20 md:w-24 h-16 sm:h-24 bg-slate-500/60 rounded-t-sm" />
                <span className="text-white/60 text-[10px] sm:text-sm mt-2 sm:mt-3 tracking-wider">YEAR 1</span>
              </div>
              
              {/* Year 3 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-20 md:w-24 h-24 sm:h-36 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-sm" />
                <span className="text-white/60 text-[10px] sm:text-sm mt-2 sm:mt-3 tracking-wider">YEAR 3</span>
              </div>
              
              {/* Year 5 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-20 md:w-24 h-32 sm:h-48 bg-gradient-to-t from-gold to-gold-light rounded-t-sm" />
                <span className="text-white/60 text-[10px] sm:text-sm mt-2 sm:mt-3 tracking-wider">YEAR 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
