import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ROITeaserSection() {
  return (
    <section className="py-20 md:py-28 bg-navy text-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              <span className="italic text-white">Run the Numbers.</span>
              <br />
              <span className="italic text-gold">Remove the Emotion.</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-md">
              Property decisions should not be based on vibes. Use the Therizo ROI Calculator to model your potential returns in Nigerian Naira (₦). Calculate Cash-on-Cash return, Cap Rate, and Payback Period in seconds.
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-6 py-5"
              asChild
            >
              <Link to="/calculator" className="flex items-center gap-2">
                Open ROI Calculator
                <BarChart3 size={18} />
              </Link>
            </Button>
          </div>

          {/* Right Content - Bar Chart */}
          <div className="relative">
            {/* ROI Label */}
            <div className="absolute -top-2 right-8 bg-navy border border-white/20 rounded px-3 py-1.5 z-10">
              <span className="text-gold font-display font-bold text-lg">22%</span>
              <span className="text-white/70 text-sm ml-1">ROI</span>
            </div>

            {/* Chart Container */}
            <div className="flex items-end justify-center gap-6 h-64 pt-8">
              {/* Year 1 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-20 md:w-24 h-24 bg-slate-500/60 rounded-t-sm" />
                <span className="text-white/60 text-sm mt-3 tracking-wider">YEAR 1</span>
              </div>
              
              {/* Year 3 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-20 md:w-24 h-36 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-sm" />
                <span className="text-white/60 text-sm mt-3 tracking-wider">YEAR 3</span>
              </div>
              
              {/* Year 5 Bar */}
              <div className="flex flex-col items-center">
                <div className="w-20 md:w-24 h-48 bg-gradient-to-t from-gold to-gold-light rounded-t-sm" />
                <span className="text-white/60 text-sm mt-3 tracking-wider">YEAR 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
