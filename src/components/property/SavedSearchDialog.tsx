import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUtm } from "@/lib/utm";
import { analytics } from "@/lib/analytics";

interface Props {
  defaultFilters?: {
    city?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    risk_rating?: string;
  };
  trigger?: React.ReactNode;
}

export function SavedSearchDialog({ defaultFilters = {}, trigger }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState(defaultFilters.city ?? "");
  const [type, setType] = useState(defaultFilters.property_type ?? "");
  const [maxPrice, setMaxPrice] = useState<string>(defaultFilters.max_price?.toString() ?? "");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("weekly");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    setSaving(true);
    const filters: Record<string, unknown> = {};
    if (city) filters.city = city;
    if (type) filters.property_type = type;
    if (maxPrice && !Number.isNaN(Number(maxPrice))) filters.max_price = Number(maxPrice);
    try {
      const { error } = await (supabase as any).from("saved_searches").insert({
        email,
        name: name || null,
        filters,
        frequency,
        utm: getUtm() ?? null,
      });
      if (error) throw error;
      analytics.track("saved_search_created", { filters, frequency });
      toast({ title: "You're subscribed", description: "We'll email you when matching listings come in." });
      setOpen(false);
      setEmail(""); setName("");
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e?.message ?? "Try again in a moment.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Alert me on new listings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Get alerts on new listings</DialogTitle>
          <DialogDescription>
            Tell us what you're looking for. We'll email verified matches — no spam.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input placeholder="Your email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="City (e.g. Lagos, Abuja)" value={city} onChange={(e) => setCity(e.target.value)} />
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Property type (any)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
              <SelectItem value="terrace">Terrace</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Max budget in NGN (optional)" type="number" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <Select value={frequency} onValueChange={(v) => setFrequency(v as "daily" | "weekly")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly summary</SelectItem>
              <SelectItem value="daily">Daily summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
