import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Star, Plus } from "lucide-react";

type Testimonial = {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  reviewer_location: string | null;
  quote: string;
  rating: number;
  strategy: string | null;
  verified: boolean;
  published: boolean;
  sort_order: number;
};

const emptyForm: Partial<Testimonial> = {
  reviewer_name: "",
  reviewer_role: "",
  reviewer_location: "",
  quote: "",
  rating: 5,
  strategy: "",
  verified: true,
  published: true,
  sort_order: 0,
};

export default function TestimonialsList() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Testimonial>>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["dash-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Testimonial[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: Partial<Testimonial>) => {
      if (payload.id) {
        const { error } = await supabase.from("testimonials").update(payload as any).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["dash-testimonials"] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["dash-testimonials"] });
    },
  });

  const openEdit = (t?: Testimonial) => {
    setForm(t ?? emptyForm);
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-navy">Testimonials</h1>
          <p className="text-slate text-sm">Verified client quotes shown on the site.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openEdit()} className="bg-navy text-white">
              <Plus className="h-4 w-4 mr-2" /> New testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit" : "New"} testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Reviewer name</Label>
                <Input value={form.reviewer_name ?? ""} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Role</Label>
                  <Input value={form.reviewer_role ?? ""} onChange={(e) => setForm({ ...form, reviewer_role: e.target.value })} placeholder="Diaspora investor" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={form.reviewer_location ?? ""} onChange={(e) => setForm({ ...form, reviewer_location: e.target.value })} placeholder="UK" />
                </div>
              </div>
              <div>
                <Label>Quote</Label>
                <Textarea rows={4} value={form.quote ?? ""} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Rating (1-5)</Label>
                  <Input type="number" min={1} max={5} value={form.rating ?? 5} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Strategy</Label>
                  <Input value={form.strategy ?? ""} onChange={(e) => setForm({ ...form, strategy: e.target.value })} placeholder="short-let" />
                </div>
                <div>
                  <Label>Sort</Label>
                  <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={!!form.verified} onCheckedChange={(v) => setForm({ ...form, verified: v })} />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={!!form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                  Published
                </label>
              </div>
              <Button
                className="w-full bg-navy text-white"
                disabled={upsert.isPending || !form.reviewer_name || !form.quote}
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
        <div className="grid gap-4">
          {(data ?? []).map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>
                    {t.reviewer_name}
                    <span className="ml-2 text-xs text-slate">{t.reviewer_role} · {t.reviewer_location}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gold">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ink italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className={t.published ? "text-green-700" : "text-slate/60"}>
                    {t.published ? "Published" : "Draft"}
                  </span>
                  {t.verified && <span className="text-gold">Verified</span>}
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirm("Delete testimonial?") && del.mutate(t.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(data ?? []).length === 0 && (
            <p className="text-sm text-slate">No testimonials yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
