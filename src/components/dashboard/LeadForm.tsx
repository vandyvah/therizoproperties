import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const leadSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  property_id: z.string().optional(),
  stage: z.enum(["new", "qualified", "viewing_scheduled", "offer_made", "under_negotiation", "closed_won", "closed_lost"]),
  preferred_city: z.string().optional(),
  preferred_neighbourhoods: z.string().optional(),
  budget_min_ngn: z.coerce.number().optional(),
  budget_max_ngn: z.coerce.number().optional(),
  lost_reason: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<LeadFormData> & { id?: string };
}

const STAGES = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "viewing_scheduled", label: "Viewing Scheduled" },
  { value: "offer_made", label: "Offer Made" },
  { value: "under_negotiation", label: "Under Negotiation" },
  { value: "closed_won", label: "Closed Won" },
  { value: "closed_lost", label: "Closed Lost" },
];

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ogun State", "Kano", "Ibadan", "Enugu", "Other"];

export function LeadForm({ open, onClose, onSuccess, initialData }: LeadFormProps) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([]);
  const [properties, setProperties] = useState<Array<{ id: string; title: string }>>([]);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      client_id: initialData?.client_id || "",
      property_id: initialData?.property_id || "",
      stage: initialData?.stage || "new",
      preferred_city: initialData?.preferred_city || "",
      preferred_neighbourhoods: initialData?.preferred_neighbourhoods || "",
      budget_min_ngn: initialData?.budget_min_ngn || undefined,
      budget_max_ngn: initialData?.budget_max_ngn || undefined,
      lost_reason: initialData?.lost_reason || "",
    },
  });

  // Reset form when initialData changes (e.g., when converting enquiry to lead)
  useEffect(() => {
    if (open) {
      form.reset({
        client_id: initialData?.client_id || "",
        property_id: initialData?.property_id || "",
        stage: initialData?.stage || "new",
        preferred_city: initialData?.preferred_city || "",
        preferred_neighbourhoods: initialData?.preferred_neighbourhoods || "",
        budget_min_ngn: initialData?.budget_min_ngn || undefined,
        budget_max_ngn: initialData?.budget_max_ngn || undefined,
        lost_reason: initialData?.lost_reason || "",
      });
      fetchClients();
      fetchProperties();
    }
  }, [open, initialData?.client_id]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, full_name").order("full_name");
    if (data) setClients(data);
  };

  const fetchProperties = async () => {
    const { data } = await supabase.from("properties").select("id, title").order("title");
    if (data) setProperties(data);
  };

  const onSubmit = async (data: LeadFormData) => {
    if (!profile) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from("leads")
          .update({
            client_id: data.client_id,
            property_id: data.property_id || null,
            stage: data.stage,
            preferred_city: data.preferred_city || null,
            preferred_neighbourhoods: data.preferred_neighbourhoods || null,
            budget_min_ngn: data.budget_min_ngn || null,
            budget_max_ngn: data.budget_max_ngn || null,
            lost_reason: data.lost_reason || null,
          })
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Lead updated successfully");
      } else {
        const { error } = await supabase.from("leads").insert({
          client_id: data.client_id,
          property_id: data.property_id || null,
          stage: data.stage,
          preferred_city: data.preferred_city || null,
          preferred_neighbourhoods: data.preferred_neighbourhoods || null,
          budget_min_ngn: data.budget_min_ngn || null,
          budget_max_ngn: data.budget_max_ngn || null,
          lost_reason: data.lost_reason || null,
          created_by_id: profile.id,
          assigned_consultant_id: profile.id,
        });
        if (error) throw error;
        toast.success("Lead created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="client_id">Client *</Label>
            <Select
              value={form.watch("client_id")}
              onValueChange={(value) => form.setValue("client_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.client_id && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.client_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="property_id">Property of Interest</Label>
            <Select
              value={form.watch("property_id") || ""}
              onValueChange={(value) => form.setValue("property_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property (optional)" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>{property.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stage">Stage *</Label>
            <Select
              value={form.watch("stage")}
              onValueChange={(value: LeadFormData["stage"]) => form.setValue("stage", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferred_city">Preferred City</Label>
            <Select
              value={form.watch("preferred_city") || ""}
              onValueChange={(value) => form.setValue("preferred_city", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferred_neighbourhoods">Preferred Neighbourhoods</Label>
            <Input id="preferred_neighbourhoods" {...form.register("preferred_neighbourhoods")} placeholder="e.g., Lekki, Ikoyi, VI" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_min_ngn">Min Budget (₦)</Label>
              <Input id="budget_min_ngn" type="number" {...form.register("budget_min_ngn")} />
            </div>
            <div>
              <Label htmlFor="budget_max_ngn">Max Budget (₦)</Label>
              <Input id="budget_max_ngn" type="number" {...form.register("budget_max_ngn")} />
            </div>
          </div>

          {form.watch("stage") === "closed_lost" && (
            <div>
              <Label htmlFor="lost_reason">Lost Reason</Label>
              <Input id="lost_reason" {...form.register("lost_reason")} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialData?.id ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
