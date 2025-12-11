import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const clientSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  client_type: z.enum(["buyer", "seller", "investor_developer", "landowner", "other"]),
  source: z.enum(["referral", "social_media", "website_form", "walk_in", "other"]),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<ClientFormData> & { id?: string };
}

const CLIENT_TYPES = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "investor_developer", label: "Investor/Developer" },
  { value: "landowner", label: "Landowner" },
  { value: "other", label: "Other" },
];

const SOURCES = [
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "website_form", label: "Website Form" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
];

export function ClientForm({ open, onClose, onSuccess, initialData }: ClientFormProps) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      client_type: initialData?.client_type || "buyer",
      source: initialData?.source || "other",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    if (!profile) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from("clients")
          .update({
            full_name: data.full_name,
            email: data.email || null,
            phone: data.phone || null,
            client_type: data.client_type,
            source: data.source,
            notes: data.notes || null,
          })
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Client updated successfully");
      } else {
        const { error } = await supabase.from("clients").insert({
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          client_type: data.client_type,
          source: data.source,
          notes: data.notes || null,
          assigned_consultant_id: profile.id,
        });
        if (error) throw error;
        toast.success("Client created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" {...form.register("full_name")} />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>

          <div>
            <Label htmlFor="client_type">Client Type *</Label>
            <Select
              value={form.watch("client_type")}
              onValueChange={(value: ClientFormData["client_type"]) => form.setValue("client_type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Source *</Label>
            <Select
              value={form.watch("source")}
              onValueChange={(value: ClientFormData["source"]) => form.setValue("source", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} rows={3} />
          </div>

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
