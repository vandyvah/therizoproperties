import { useState } from "react";
import { MessageCircle, X, Phone, Calendar, Car, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    {
      icon: Calendar,
      label: "Book Private Viewing",
      description: "Schedule an exclusive property tour",
      href: "/contact?type=viewing",
      color: "text-accent",
    },
    {
      icon: Phone,
      label: "Speak to Consultant",
      description: "Direct line to our experts",
      href: "https://wa.me/2348034830087?text=Hello%2C%20I%27d%20like%20to%20speak%20with%20a%20consultant",
      external: true,
      color: "text-green-500",
    },
    {
      icon: Car,
      label: "Ride-Along Day",
      description: "Full day viewing with driver",
      href: "/contact?type=ride-along",
      color: "text-secondary",
    },
    {
      icon: Plane,
      label: "Airport Pickup",
      description: "Diaspora VIP arrival service",
      href: "/contact?type=airport-pickup",
      color: "text-primary",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Service Menu */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden w-72">
          <div className="bg-primary p-4">
            <h3 className="font-display text-lg text-primary-foreground font-semibold">
              Concierge Services
            </h3>
            <p className="text-primary-foreground/70 text-sm">
              White-glove assistance for discerning clients
            </p>
          </div>
          <div className="p-2">
            {services.map((service, index) => (
              <a
                key={index}
                href={service.href}
                target={service.external ? "_blank" : undefined}
                rel={service.external ? "noopener noreferrer" : undefined}
                onClick={() => {
                  if (service.external) {
                    analytics.whatsappClick({ surface: "concierge", label: service.label });
                  }
                }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className={cn("p-2 rounded-lg bg-muted group-hover:bg-background transition-colors", service.color)}>
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                    {service.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group",
          isOpen
            ? "bg-foreground hover:bg-foreground/90 rotate-0"
            : "bg-accent hover:bg-accent/90 hover:scale-105"
        )}
        aria-label="Open concierge menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-background" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-accent-foreground" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-25" />
          </>
        )}
      </button>

      {/* Mini label */}
      {!isOpen && (
        <div className="fixed bottom-[5.5rem] right-6 z-50 pointer-events-none">
          <span className="bg-foreground text-background text-xs px-2 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            Concierge
          </span>
        </div>
      )}
    </>
  );
}
