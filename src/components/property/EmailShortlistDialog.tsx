import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getUtm } from "@/lib/utm";
import { analytics } from "@/lib/analytics";

interface Props {
  propertyIds: string[];
  trigger?: React.ReactNode;
}

export function EmailShortlistDialog({ propertyIds, trigger }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    if (propertyIds.length === 0) {
      toast({ title: "Your shortlist is empty", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("shortlist-email", {
        body: { email, name: name || undefined, property_ids: propertyIds, note: note || undefined, utm: getUtm() },
      });
      if (error) throw error;
      analytics.track("shortlist_email_sent", { count: propertyIds.length });
      toast({ title: "Sent!", description: "Check your inbox — a consultant will follow up shortly." });
      setOpen(false);
      setEmail(""); setName(""); setNote("");
    } catch (e: any) {
      toast({ title: "Couldn't send", description: e?.message ?? "Try again in a moment.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email me my shortlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email your shortlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input placeholder="Your email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Anything specific you'd like the consultant to know? (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <p className="text-xs text-muted-foreground">
            We'll send the shortlist to your inbox and a Therizo consultant will follow up.
          </p>
        </div>
        <DialogFooter>
          <Button variant="gold" onClick={submit} disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send shortlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
