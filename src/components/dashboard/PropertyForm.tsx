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

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  property_type: z.string().min(1, "Property type is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().optional(),
  asking_price_ngn: z.coerce.number().min(0, "Price must be positive"),
  min_price_ngn: z.coerce.number().optional(),
  rental_potential_monthly_ngn: z.coerce.number().optional(),
  airbnb_potential_nightly_ngn: z.coerce.number().optional(),
  owner_name: z.string().optional(),
  owner_contact: z.string().optional(),
  description: z.string().optional(),
  risk_rating: z.enum(["low", "medium", "high"]),
  status: z.enum(["draft", "under_review", "listed", "on_hold", "sold"]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<PropertyFormData> & { id?: string };
}

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ogun State", "Kano", "Ibadan", "Enugu", "Other"];
const PROPERTY_TYPES = ["Apartment", "Detached House", "Semi-Detached", "Terrace", "Penthouse", "Land", "Commercial", "Mixed-Use"];

export function PropertyForm({ open, onClose, onSuccess, initialData }: PropertyFormProps) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || "",
      property_type: initialData?.property_type || "",
      city: initialData?.city || "",
      area: initialData?.area || "",
      asking_price_ngn: initialData?.asking_price_ngn || 0,
      min_price_ngn: initialData?.min_price_ngn || undefined,
      rental_potential_monthly_ngn: initialData?.rental_potential_monthly_ngn || undefined,
      airbnb_potential_nightly_ngn: initialData?.airbnb_potential_nightly_ngn || undefined,
      owner_name: initialData?.owner_name || "",
      owner_contact: initialData?.owner_contact || "",
      description: initialData?.description || "",
      risk_rating: initialData?.risk_rating || "medium",
      status: initialData?.status || "draft",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (!profile) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from("properties")
          .update({
            title: data.title,
            property_type: data.property_type,
            city: data.city,
            area: data.area || null,
            asking_price_ngn: data.asking_price_ngn,
            min_price_ngn: data.min_price_ngn || null,
            rental_potential_monthly_ngn: data.rental_potential_monthly_ngn || null,
            airbnb_potential_nightly_ngn: data.airbnb_potential_nightly_ngn || null,
            owner_name: data.owner_name || null,
            owner_contact: data.owner_contact || null,
            description: data.description || null,
            risk_rating: data.risk_rating,
            status: data.status,
          })
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Property updated successfully");
      } else {
        const { error } = await supabase.from("properties").insert({
          title: data.title,
          property_type: data.property_type,
          city: data.city,
          area: data.area || null,
          asking_price_ngn: data.asking_price_ngn,
          min_price_ngn: data.min_price_ngn || null,
          rental_potential_monthly_ngn: data.rental_potential_monthly_ngn || null,
          airbnb_potential_nightly_ngn: data.airbnb_potential_nightly_ngn || null,
          owner_name: data.owner_name || null,
          owner_contact: data.owner_contact || null,
          description: data.description || null,
          risk_rating: data.risk_rating,
          status: data.status,
          created_by_id: profile.id,
          assigned_consultant_id: profile.id,
        });
        if (error) throw error;
        toast.success("Property created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Property" : "Add New Property"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={form.watch("property_type")}
                onValueChange={(value) => form.setValue("property_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Select
                value={form.watch("city")}
                onValueChange={(value) => form.setValue("city", value)}
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
              <Label htmlFor="area">Area/Neighbourhood</Label>
              <Input id="area" {...form.register("area")} />
            </div>

            <div>
              <Label htmlFor="asking_price_ngn">Asking Price (₦) *</Label>
              <Input
                id="asking_price_ngn"
                type="number"
                {...form.register("asking_price_ngn")}
              />
            </div>

            <div>
              <Label htmlFor="min_price_ngn">Minimum Price (₦)</Label>
              <Input
                id="min_price_ngn"
                type="number"
                {...form.register("min_price_ngn")}
              />
            </div>

            <div>
              <Label htmlFor="rental_potential_monthly_ngn">Rental Potential (₦/month)</Label>
              <Input
                id="rental_potential_monthly_ngn"
                type="number"
                {...form.register("rental_potential_monthly_ngn")}
              />
            </div>

            <div>
              <Label htmlFor="airbnb_potential_nightly_ngn">Airbnb Potential (₦/night)</Label>
              <Input
                id="airbnb_potential_nightly_ngn"
                type="number"
                {...form.register("airbnb_potential_nightly_ngn")}
              />
            </div>

            <div>
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input id="owner_name" {...form.register("owner_name")} />
            </div>

            <div>
              <Label htmlFor="owner_contact">Owner Contact</Label>
              <Input id="owner_contact" {...form.register("owner_contact")} />
            </div>

            <div>
              <Label htmlFor="risk_rating">Risk Rating</Label>
              <Select
                value={form.watch("risk_rating")}
                onValueChange={(value: "low" | "medium" | "high") => form.setValue("risk_rating", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value: "draft" | "under_review" | "listed" | "on_hold" | "sold") => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} rows={3} />
            </div>
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
