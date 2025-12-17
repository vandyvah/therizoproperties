import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const dealSchema = z.object({
  property_id: z.string().min(1, "Property is required"),
  buyer_client_id: z.string().optional(),
  seller_client_id: z.string().optional(),
  sale_price_ngn: z.coerce.number().min(0, "Sale price must be positive"),
  gross_commission_rate: z.coerce.number().min(0).max(100, "Rate must be between 0-100"),
  direct_deal_costs_ngn: z.coerce.number().min(0).default(0),
  status: z.enum(["in_progress", "under_contract", "closed", "cancelled"]),
  notes: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Property {
  id: string;
  title: string;
  city: string;
  asking_price_ngn: number;
}

interface Client {
  id: string;
  full_name: string;
  client_type: string;
}

export function DealForm({ open, onClose, onSuccess }: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      property_id: "",
      buyer_client_id: "",
      seller_client_id: "",
      sale_price_ngn: 0,
      gross_commission_rate: 3,
      direct_deal_costs_ngn: 0,
      status: "in_progress",
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
    const [propertiesRes, clientsRes] = await Promise.all([
      supabase
        .from("properties")
        .select("id, title, city, asking_price_ngn")
        .in("status", ["listed", "under_review"]),
      supabase.from("clients").select("id, full_name, client_type"),
    ]);

    if (propertiesRes.data) setProperties(propertiesRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
  };

  const onSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      const grossCommissionAmount = (data.sale_price_ngn * data.gross_commission_rate) / 100;
      const netCompanyCommission = grossCommissionAmount - data.direct_deal_costs_ngn;

      const { error } = await supabase.from("deals").insert({
        property_id: data.property_id,
        buyer_client_id: data.buyer_client_id || null,
        seller_client_id: data.seller_client_id || null,
        sale_price_ngn: data.sale_price_ngn,
        gross_commission_rate: data.gross_commission_rate,
        gross_commission_amount_ngn: grossCommissionAmount,
        direct_deal_costs_ngn: data.direct_deal_costs_ngn,
        net_company_commission_ngn: netCompanyCommission,
        status: data.status,
        notes: data.notes || null,
      });

      if (error) throw error;

      toast.success("Deal created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Failed to create deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchSalePrice = form.watch("sale_price_ngn");
  const watchCommissionRate = form.watch("gross_commission_rate");
  const watchDealCosts = form.watch("direct_deal_costs_ngn");

  const grossCommission = (watchSalePrice * watchCommissionRate) / 100;
  const netCommission = grossCommission - watchDealCosts;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const buyers = clients.filter((c) => c.client_type === "buyer");
  const sellers = clients.filter((c) => ["seller", "landowner"].includes(c.client_type));

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Deal</DialogTitle>
          <DialogDescription>
            Record a new property transaction
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="buyer_client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select buyer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buyers.map((client) => (
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

              <FormField
                control={form.control}
                name="seller_client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sellers.map((client) => (
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
              name="sale_price_ngn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (₦) *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gross_commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direct_deal_costs_ngn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Deal Costs (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Commission Preview */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Commission:</span>
                <span>{formatCurrency(grossCommission)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Net Company Commission:</span>
                <span className="text-gold">{formatCurrency(netCommission)}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="under_contract">Under Contract</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
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
                Create Deal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
