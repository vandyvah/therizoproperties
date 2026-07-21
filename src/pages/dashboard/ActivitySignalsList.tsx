import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Signal = {
  id: string;
  headline: string;
  city: string | null;
  category: string;
  occurred_at: string;
  published: boolean;
};

const CATEGORIES = ["deal", "verification", "call", "listing", "milestone"];

const empty: Partial<Signal> = {
  headline: "",
  city: "",
  category: "deal",
  occurred_at: new Date().toISOString().slice(0, 16),
  published: true,
};

export default function ActivitySignalsList() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Signal>>(empty);

  const { data, isLoading } = useQuery({
    queryKey: ["dash-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_signals")
        .select("*")
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Signal[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Partial<Signal>) => {
      const clean = {
        ...payload,
        occurred_at: payload.occurred_at
          ? new Date(payload.occurred_at).toISOString()
          : new Date().toISOString(),
      };
      if (payload.id) {
        const { error } = await supabase.from("activity_signals").update(clean as any).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("activity_signals").insert(clean as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["dash-signals"] });
      qc.invalidateQueries({ queryKey: ["activity-signals"] });
      setOpen(false);
      setForm(empty);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_signals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["dash-signals"] });
    },
  });

  const openEdit = (s?: Signal) => {
    if (s) {
      setForm({ ...s, occurred_at: new Date(s.occurred_at).toISOString().slice(0, 16) });
    } else {
      setForm(empty);
    }
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-navy">Activity signals</h1>
          <p className="text-slate text-sm">Anonymised milestones shown in the live ticker.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEdit()} className="bg-navy text-white">
              <Plus className="h-4 w-4 mr-2" /> New signal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit" : "New"} signal</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Headline</Label>
                <Input
                  value={form.headline ?? ""}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="Diaspora client (UK) closed a Lekki apartment"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lagos" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category ?? "deal"} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Occurred at</Label>
                <Input
                  type="datetime-local"
                  value={form.occurred_at ?? ""}
                  onChange={(e) => setForm({ ...form, occurred_at: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={!!form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                Published
              </label>
              <Button
                className="w-full bg-navy text-white"
                disabled={upsert.isPending || !form.headline}
                onClick={() => upsert.mutate(form)}
              >
                {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="grid gap-3">
          {(data ?? []).map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-gold" />
                    {s.headline}
                  </span>
                  <span className="text-xs text-slate uppercase">{s.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3 text-xs text-slate">
                <span>{s.city || "—"}</span>
                <span>· {formatDistanceToNow(new Date(s.occurred_at), { addSuffix: true })}</span>
                <span className={s.published ? "text-green-700" : "text-slate/60"}>
                  {s.published ? "Published" : "Draft"}
                </span>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => confirm("Delete signal?") && del.mutate(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(data ?? []).length === 0 && <p className="text-sm text-slate">No signals yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
}
