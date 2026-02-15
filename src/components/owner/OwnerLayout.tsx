import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { getWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE, OWNER_NAME, trackEvent } from "@/lib/owner-config";

export function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#D8D1C5]/50 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/owner-brief" className="flex items-center gap-2">
            <span className="font-display text-lg sm:text-xl font-bold text-[#0E1626] tracking-tight">
              Thérizo Properties
            </span>
          </Link>
          <a
            href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_cta_click", { location: "header" })}
            className="flex items-center gap-2 rounded-md bg-[#25D366] px-3 py-2 text-white text-sm font-semibold transition hover:bg-[#1fb855]"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp {OWNER_NAME.split(" ").pop()}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#D8D1C5]/50 bg-[#0E1626] text-white/70">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-display text-white/90">© {new Date().getFullYear()} Thérizo Properties</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <Link to="/submit-property" className="hover:text-[#C8A24A] transition">Submit Property</Link>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
