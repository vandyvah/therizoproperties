import { Heart } from "lucide-react";
import { useShortlist } from "@/hooks/useShortlist";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

type Props = {
  propertyId: string;
  propertyTitle?: string;
  className?: string;
};

/**
 * Phase 11 — heart button for saving a property to the buyer shortlist.
 * Stops link/card navigation; keyboard accessible.
 */
export function SaveButton({ propertyId, propertyTitle, className }: Props) {
  const { has, toggle } = useShortlist();
  const saved = has(propertyId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggle(propertyId);
    track("shortlist_toggle", { property_id: propertyId, saved: nowSaved });
    toast.success(
      nowSaved ? "Saved to your shortlist" : "Removed from shortlist",
      { description: propertyTitle }
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      className={
        "inline-flex items-center justify-center h-9 w-9 rounded-full bg-warm-white/95 backdrop-blur border border-sand shadow-sm hover:bg-warm-white transition " +
        (className ?? "")
      }
    >
      <Heart
        className={"h-4 w-4 " + (saved ? "fill-gold text-gold" : "text-navy")}
        aria-hidden="true"
      />
    </button>
  );
}
