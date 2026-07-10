import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const roiSchema = z.object({
  strategy: z.enum(["long_term_rental", "airbnb", "compare"]),
  property_id: z.string().optional(),
  client_id: z.string().optional(),
  property_location: z.string().min(1, "Location is required"),
  purchase_price_ngn: z.coerce.number().min(1, "Purchase price is required"),
  renovation_cost_ngn: z.coerce.number().min(0).default(0),
  other_acquisition_costs_ngn: z.coerce.number().min(0).default(0),
  annual_rent_ngn: z.coerce.number().min(0).optional(),
  airbnb_nightly_rate_ngn: z.coerce.number().min(0).optional(),
  airbnb_occupancy_rate_pct: z.coerce.number().min(0).max(100).optional(),
  annual_property_tax_ngn: z.coerce.number().min(0).default(0),
  annual_insurance_ngn: z.coerce.number().min(0).default(0),
  annual_maintenance_ngn: z.coerce.number().min(0).default(0),
  management_fee_pct: z.coerce.number().min(0).max(100).default(10),
});

type ROIFormData = z.infer<typeof roiSchema>;

interface ROIFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Property {
  id: string;
  title: string;
  city: string;
}

interface Client {
  id: string;
  full_name: string;
}

export function ROIForm({ open, onClose, onSuccess }: ROIFormProps) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<ROIFormData>({
    resolver: zodResolver(roiSchema),
    defaultValues: {
      strategy: "long_term_rental",
      property_id: "",
      client_id: "",
      property_location: "",
      purchase_price_ngn: 0,
      renovation_cost_ngn: 0,
      other_acquisition_costs_ngn: 0,
      annual_rent_ngn: 0,
      airbnb_nightly_rate_ngn: 0,
      airbnb_occupancy_rate_pct: 70,
      annual_property_tax_ngn: 0,
      annual_insurance_ngn: 0,
      annual_maintenance_ngn: 0,
      management_fee_pct: 10,
    },
  });

  const strategy = form.watch("strategy");

  useEffect(() => {
    if (open) {
      fetchData();
      form.reset();
    }
  }, [open]);

  const fetchData = async () => {
    const [propertiesRes, clientsRes] = await Promise.all([
      supabase.from("properties").select("id, title, city"),
      supabase.from("clients").select("id, full_name"),
    ]);

    if (propertiesRes.data) setProperties(propertiesRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
  };

  const onSubmit = async (data: ROIFormData) => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const totalInvestment =
        data.purchase_price_ngn +
        data.renovation_cost_ngn +
        data.other_acquisition_costs_ngn;

      let grossAnnualIncome = 0;
      if (data.strategy === "long_term_rental" || data.strategy === "compare") {
        grossAnnualIncome = data.annual_rent_ngn || 0;
      }
      if (data.strategy === "airbnb") {
        grossAnnualIncome =
          (data.airbnb_nightly_rate_ngn || 0) *
          365 *
          ((data.airbnb_occupancy_rate_pct || 70) / 100);
      }

      const annualExpenses =
        data.annual_property_tax_ngn +
        data.annual_insurance_ngn +
        data.annual_maintenance_ngn +
        (grossAnnualIncome * data.management_fee_pct) / 100;

      const netAnnualIncome = grossAnnualIncome - annualExpenses;
      const capRate = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
      const cashOnCashReturn = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;
      const paybackPeriod = netAnnualIncome > 0 ? totalInvestment / netAnnualIncome : 0;

      const { error } = await supabase.from("roi_calculations").insert({
        strategy: data.strategy,
        property_id: data.property_id || null,
        client_id: data.client_id || null,
        property_location: data.property_location,
        purchase_price_ngn: data.purchase_price_ngn,
        renovation_cost_ngn: data.renovation_cost_ngn,
        other_acquisition_costs_ngn: data.other_acquisition_costs_ngn,
        monthly_rent_ngn: data.annual_rent_ngn ? Math.round(data.annual_rent_ngn / 12) : null,
        airbnb_nightly_rate_ngn: data.airbnb_nightly_rate_ngn || null,
        airbnb_occupancy_rate_pct: data.airbnb_occupancy_rate_pct || null,
        annual_property_tax_ngn: data.annual_property_tax_ngn,
        annual_insurance_ngn: data.annual_insurance_ngn,
        annual_maintenance_ngn: data.annual_maintenance_ngn,
        management_fee_pct: data.management_fee_pct,
        gross_annual_income_ngn: grossAnnualIncome,
        net_annual_income_ngn: netAnnualIncome,
        cap_rate_pct: capRate,
        cash_on_cash_return_pct: cashOnCashReturn,
        payback_period_years: paybackPeriod,
        created_by_id: profile.id,
      });

      if (error) throw error;

      toast.success("ROI calculation saved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving ROI calculation:", error);
      toast.error("Failed to save ROI calculation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New ROI Calculation</DialogTitle>
          <DialogDescription>
            Calculate and save investment returns analysis
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Strategy *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="long_term_rental">Long-Term Rental</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="compare">Compare Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Property</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title}
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
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="property_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lekki Phase 1, Lagos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Acquisition Costs</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_price_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price (₦) *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="renovation_cost_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renovation (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="other_acquisition_costs_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Costs (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {(strategy === "long_term_rental" || strategy === "compare") && (
              <FormField
                control={form.control}
                name="annual_rent_ngn"
                render={({ field }) => {
                  const rent = Number(field.value || 0);
                  const price = Number(form.watch("purchase_price_ngn") || 0);
                  const yieldPct = price > 0 ? (rent / price) * 100 : 0;
                  const suspicious = rent > 0 && price > 0 && yieldPct > 25;
                  return (
                    <FormItem>
                      <FormLabel>Annual Rent (₦/year)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="e.g. 7,200,000" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        You entered:{" "}
                        <span className="text-gold font-semibold">
                          ₦{rent.toLocaleString("en-NG")} / year
                        </span>
                        {rent > 0 && (
                          <span>
                            {" "}(≈ ₦{Math.round(rent / 12).toLocaleString("en-NG")} / month
                            {price > 0 && ` • ${yieldPct.toFixed(1)}% gross yield`})
                          </span>
                        )}
                      </p>
                      {suspicious && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          ⚠ {yieldPct.toFixed(1)}% yield looks unusually high — did you enter a
                          monthly amount? Multiply by 12 for the yearly figure.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {(strategy === "airbnb" || strategy === "compare") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="airbnb_nightly_rate_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nightly Rate (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="airbnb_occupancy_rate_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Annual Operating Expenses</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="annual_property_tax_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Tax (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annual_insurance_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annual_maintenance_ngn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance (₦)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="management_fee_pct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Fee (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Calculation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
