import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Eye, TrendingUp } from "lucide-react";

type DealStatus = "in_progress" | "under_contract" | "closed" | "cancelled";

interface Deal {
  id: string;
  status: DealStatus;
  sale_price_ngn: number;
  gross_commission_amount_ngn: number;
  net_company_commission_ngn: number;
  closing_date: string | null;
  created_at: string;
  properties?: { title: string; city: string } | null;
  buyer_client?: { full_name: string } | null;
}

const statusColors: Record<DealStatus, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  under_contract: "bg-yellow-100 text-yellow-800",
  closed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          id, status, sale_price_ngn, gross_commission_amount_ngn, net_company_commission_ngn, closing_date, created_at,
          properties:property_id(title, city)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals((data as Deal[]) || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
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

  const filteredDeals = deals.filter(
    (deal) => statusFilter === "all" || deal.status === statusFilter
  );

  const totalCommission = filteredDeals
    .filter((d) => d.status === "closed")
    .reduce((sum, deal) => sum + (deal.net_company_commission_ngn || 0), 0);

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Deals</h1>
            <p className="text-muted-foreground mt-1">Track transactions and commissions</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/deals/new">
              <Plus size={16} className="mr-2" />
              Create Deal
            </Link>
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm">Total Net Commission (Closed)</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalCommission)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Deals</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_contract">Under Contract</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Gross Commission</TableHead>
                  <TableHead>Net Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closing Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No deals found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {deal.properties?.title || "Unknown"}
                        <span className="text-xs text-muted-foreground block">
                          {deal.properties?.city}
                        </span>
                      </TableCell>
                      <TableCell>{deal.buyer_client?.full_name || "-"}</TableCell>
                      <TableCell>{formatCurrency(deal.sale_price_ngn)}</TableCell>
                      <TableCell>{formatCurrency(deal.gross_commission_amount_ngn)}</TableCell>
                      <TableCell className="font-semibold text-gold">
                        {formatCurrency(deal.net_company_commission_ngn)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[deal.status]} variant="secondary">
                          {deal.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.closing_date
                          ? new Date(deal.closing_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/dashboard/deals/${deal.id}`}>
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
    </DashboardLayout>
  );
}
