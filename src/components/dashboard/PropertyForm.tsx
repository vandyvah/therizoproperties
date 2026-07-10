import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { PropertyMediaUpload } from "./PropertyMediaUpload";
import { Globe, Star } from "lucide-react";

const propertySchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    const rent = Number(data.rental_potential_monthly_ngn || 0);
    if (rent <= 0) return;
    if (rent > 0 && rent < 200_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rental_potential_monthly_ngn"],
        message:
          "This is the ANNUAL rent. ₦" +
          rent.toLocaleString("en-NG") +
          " looks too low for a year — did you enter a monthly amount?",
      });
      return;
    }
    const price = Number(data.asking_price_ngn || 0);
    if (price > 0) {
      const yieldPct = (rent / price) * 100;
      if (yieldPct > 25) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rental_potential_monthly_ngn"],
          message:
            `Rent is ${yieldPct.toFixed(1)}% of the asking price — that's monthly-looking. ` +
            "Enter the ANNUAL rent (multiply monthly × 12).",
        });
      }
    }
  });

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Partial<PropertyFormData> & { id?: string; is_featured?: boolean };
}

const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ogun State", "Kano", "Ibadan", "Enugu", "Other"];
const PROPERTY_TYPES = ["Apartment", "Detached House", "Semi-Detached", "Terrace", "Penthouse", "Land", "Commercial", "Mixed-Use"];

interface MediaFile {
  id?: string;
  file_url: string;
  file_type: "image" | "video";
  file_name: string;
  file_size?: number;
}

export function PropertyForm({ open, onClose, onSuccess, initialData }: PropertyFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<MediaFile[]>([]);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);

  useEffect(() => {
    setIsFeatured(initialData?.is_featured ?? false);
  }, [initialData?.is_featured]);

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
            is_featured: isFeatured,
          })
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Property updated successfully");
      } else {
        const { data: newProperty, error } = await supabase.from("properties").insert({
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
          is_featured: isFeatured,
          created_by_id: profile.id,
          assigned_consultant_id: profile.id,
        }).select().single();
        
        if (error) throw error;

        // Save pending media to the new property
        if (newProperty && pendingMedia.length > 0) {
          for (const media of pendingMedia) {
            await supabase.from("property_media").insert({
              property_id: newProperty.id,
              file_url: media.file_url,
              file_type: media.file_type,
              file_name: media.file_name,
              file_size: media.file_size,
              uploaded_by_id: profile.id,
            });
          }
        }
        
        toast.success("Property created successfully");
      }

      // Ensure public pages (home, listings, detail) refetch updated data
      queryClient.invalidateQueries({ queryKey: ["public-properties"] });
      queryClient.invalidateQueries({ queryKey: ["public-property"] });

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
              <Label htmlFor="rental_potential_monthly_ngn" className="text-gold font-semibold">
                Rental Potential (₦/year) — Annual
              </Label>
              <Input
                id="rental_potential_monthly_ngn"
                type="number"
                min={0}
                step={1000}
                placeholder="e.g. 7,200,000"
                className="border-gold/60 focus-visible:ring-gold"
                {...form.register("rental_potential_monthly_ngn")}
              />
              {(() => {
                const rent = Number(form.watch("rental_potential_monthly_ngn") || 0);
                const asking = Number(form.watch("asking_price_ngn") || 0);
                const yieldPct = asking > 0 ? (rent / asking) * 100 : 0;
                const suspiciousMonthly = rent > 0 && asking > 0 && yieldPct > 25;
                const tooLow = rent > 0 && rent < 200_000;
                return (
                  <>
                    <p className="text-xs text-muted-foreground mt-1">
                      You entered:{" "}
                      <span className="text-gold font-semibold">
                        ₦{rent.toLocaleString("en-NG")} / year
                      </span>
                      {rent > 0 && (
                        <span className="text-muted-foreground/80">
                          {" "}(≈ ₦{Math.round(rent / 12).toLocaleString("en-NG")} / month
                          {asking > 0 && ` • ${yieldPct.toFixed(1)}% gross yield`})
                        </span>
                      )}
                    </p>
                    {suspiciousMonthly && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        ⚠ {yieldPct.toFixed(1)}% yield looks unusually high — did you enter a
                        monthly amount by mistake? Multiply by 12 for the yearly figure.
                      </p>
                    )}
                    {tooLow && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        ⚠ Below ₦200,000/year seems low for annual rent — please double-check.
                      </p>
                    )}
                  </>
                );
              })()}
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

            {/* Publish & Featured Toggles */}
            <div className="col-span-2 space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="publish-toggle" className="text-sm font-medium">Publish to Website</Label>
                    <p className="text-xs text-muted-foreground">
                      Only "Listed" properties appear on the public site. Drafts are internal only.
                    </p>
                  </div>
                </div>
                <Switch
                  id="publish-toggle"
                  checked={form.watch("status") === "listed"}
                  onCheckedChange={(checked) => {
                    form.setValue("status", checked ? "listed" : "draft");
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="featured-toggle" className="text-sm font-medium">Featured on Home Page</Label>
                    <p className="text-xs text-muted-foreground">
                      Featured properties are highlighted on the home page (max 3 shown).
                    </p>
                  </div>
                </div>
                <Switch
                  id="featured-toggle"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </div>

            <div className="col-span-2">
              <PropertyMediaUpload
                propertyId={initialData?.id}
                onMediaChange={setPendingMedia}
              />
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
