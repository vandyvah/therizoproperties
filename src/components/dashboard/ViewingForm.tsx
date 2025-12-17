import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const viewingSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  property_id: z.string().min(1, "Property is required"),
  scheduled_date: z.date({ required_error: "Date is required" }),
  scheduled_time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

type ViewingFormData = z.infer<typeof viewingSchema>;

interface ViewingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Lead {
  id: string;
  clients: { full_name: string } | null;
}

interface Property {
  id: string;
  title: string;
  city: string;
}

export function ViewingForm({ open, onClose, onSuccess }: ViewingFormProps) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const form = useForm<ViewingFormData>({
    resolver: zodResolver(viewingSchema),
    defaultValues: {
      lead_id: "",
      property_id: "",
      scheduled_time: "10:00",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
      form.reset();
    }
  }, [open]);

  const fetchData = async () => {
    const [leadsRes, propertiesRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, clients:client_id(full_name)")
        .not("stage", "in", '("closed_won","closed_lost")'),
      supabase
        .from("properties")
        .select("id, title, city")
        .in("status", ["listed", "under_review"]),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
    if (propertiesRes.data) setProperties(propertiesRes.data);
  };

  const onSubmit = async (data: ViewingFormData) => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(data.scheduled_date);
      const [hours, minutes] = data.scheduled_time.split(":").map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from("viewings").insert({
        lead_id: data.lead_id,
        property_id: data.property_id,
        scheduled_at: scheduledAt.toISOString(),
        notes: data.notes || null,
        created_by_id: profile.id,
      });

      if (error) throw error;

      toast.success("Viewing scheduled successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating viewing:", error);
      toast.error("Failed to schedule viewing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Viewing</DialogTitle>
          <DialogDescription>
            Schedule a property viewing for a lead
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lead_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a lead" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.clients?.full_name || "Unknown Client"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title} ({property.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Viewing
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
