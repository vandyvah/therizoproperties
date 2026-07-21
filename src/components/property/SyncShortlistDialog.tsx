import { useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { track } from "@/lib/analytics";

type Props = { propertyIds: string[] };

export function SyncShortlistDialog({ propertyIds }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("shortlist-sync", {
        body: { action: "request", email, property_ids: propertyIds },
      });
      if (error) throw error;
      track("shortlist_sync_request", { count: propertyIds.length });
      toast.success("Check your inbox", {
        description: "We sent a magic link to sync your shortlist on any device.",
      });
      setOpen(false);
      setEmail("");
    } catch (err: any) {
      toast.error("Couldn't send link", { description: err?.message ?? "Try again in a moment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Cloud className="mr-2 h-4 w-4" />
          Sync across devices
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sync your shortlist</DialogTitle>
          <DialogDescription>
            Enter your email — we'll send a private link that opens this shortlist on any device and
            keeps future edits in sync. No password, no account required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
          <DialogFooter>
            <Button type="submit" variant="gold" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send sync link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
