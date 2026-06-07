import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Eye, Calculator } from "lucide-react";
import { ROIForm } from "@/components/dashboard/ROIForm";

type ROIStrategy = "long_term_rental" | "airbnb" | "compare";

interface ROICalculation {
  id: string;
  strategy: ROIStrategy;
  property_location: string | null;
  purchase_price_ngn: number;
  net_annual_income_ngn: number;
  cash_on_cash_return_pct: number;
  payback_period_years: number;
  created_at: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  source: string | null;
  whatsapp_consent?: boolean | null;
  utm_source: string | null;
  properties?: { title: string } | null;
  clients?: { full_name: string } | null;
  profiles?: { full_name: string } | null;
}

const strategyLabels: Record<ROIStrategy, string> = {
  long_term_rental: "Long-Term Rental",
  airbnb: "Airbnb",
  compare: "Comparison",
};

export default function ROIList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [calculations, setCalculations] = useState<ROICalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCalculations();
  }, []);

  // Check for ?new=true query param to open form
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setShowForm(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  const fetchCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from("roi_calculations")
        .select(`
          *,
          properties:property_id(title),
          clients:client_id(full_name),
          profiles:created_by_id(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalculations((data as ROICalculation[]) || []);
    } catch (error) {
      console.error("Error fetching ROI calculations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead title="ROI Calculations" description="Saved investment return analyses" noindex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              ROI Calculations
            </h1>
            <p className="text-muted-foreground mt-1">
              Saved investment return analyses
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            New Calculation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gold" />
              All Calculations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property / Location</TableHead>
                  <TableHead>Lead / Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Net Annual Income</TableHead>
                  <TableHead>Cash-on-Cash</TableHead>
                  <TableHead>Payback</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      No ROI calculations found
                    </TableCell>
                  </TableRow>
                ) : (
                  calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {calc.properties?.title || calc.property_location || "-"}
                      </TableCell>
                      <TableCell>
                        {calc.lead_name || calc.clients?.full_name || "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {calc.lead_email && (
                          <div>
                            <a href={`mailto:${calc.lead_email}`} className="text-primary hover:underline">
                              {calc.lead_email}
                            </a>
                          </div>
                        )}
                        {calc.lead_phone && (
                          <div className="text-muted-foreground">
                            <a href={`tel:${calc.lead_phone}`} className="hover:underline">
                              {calc.lead_phone}
                            </a>
                          </div>
                        )}
                        {!calc.lead_email && !calc.lead_phone && "-"}
                      </TableCell>
                      <TableCell>
                        {calc.source === "website-calculator" ? (
                          <Badge className="bg-gold/15 text-gold border-gold/30" variant="outline">
                            Website Lead
                          </Badge>
                        ) : (
                          <Badge variant="outline">{calc.profiles?.full_name || "Internal"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{strategyLabels[calc.strategy]}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(calc.purchase_price_ngn)}</TableCell>
                      <TableCell className="text-gold font-semibold">
                        {formatCurrency(calc.net_annual_income_ngn)}
                      </TableCell>
                      <TableCell>{calc.cash_on_cash_return_pct.toFixed(2)}%</TableCell>
                      <TableCell>{calc.payback_period_years.toFixed(1)} yrs</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(calc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/dashboard/roi/${calc.id}`}>
                            <Eye size={16} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ROIForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchCalculations}
      />
    </DashboardLayout>
  );
}
