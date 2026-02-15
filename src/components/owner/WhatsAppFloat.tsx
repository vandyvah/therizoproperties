import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE, trackEvent } from "@/lib/owner-config";

export function WhatsAppFloat() {
  return (
    <a
      href={getWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("whatsapp_cta_click", { location: "floating" })}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline font-semibold text-sm">WhatsApp Us</span>
    </a>
  );
}
