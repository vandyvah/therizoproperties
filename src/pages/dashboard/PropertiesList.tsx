import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Loader2 } from "lucide-react";
import { PropertyForm } from "@/components/dashboard/PropertyForm";

type PropertyStatus = "draft" | "under_review" | "listed" | "on_hold" | "sold";
type RiskRating = "low" | "medium" | "high";

interface Property {
  id: string;
  title: string;
  city: string;
  area: string | null;
  status: PropertyStatus;
  asking_price_ngn: number;
  risk_rating: RiskRating;
  assigned_consultant_id: string | null;
  updated_at: string;
  profiles?: { full_name: string } | null;
}

const statusColors: Record<PropertyStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  under_review: "bg-yellow-100 text-yellow-800",
  listed: "bg-green-100 text-green-800",
  on_hold: "bg-orange-100 text-orange-800",
  sold: "bg-blue-100 text-blue-800",
};

const riskColors: Record<RiskRating, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export default function PropertiesList() {
  const { profile, isAdmin } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, area, status, asking_price_ngn, risk_rating, assigned_consultant_id, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProperties((data as Property[]) || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
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

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(search.toLowerCase()) ||
      property.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesCity = cityFilter === "all" || property.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const uniqueCities = [...new Set(properties.map((p) => p.city))];

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
            <h1 className="font-display text-3xl font-semibold text-foreground">Properties</h1>
            <p className="text-muted-foreground mt-1">Manage property listings</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {property.title}
                      </TableCell>
                      <TableCell>
                        {property.city}
                        {property.area && (
                          <span className="text-muted-foreground text-xs block">
                            {property.area}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[property.status]} variant="secondary">
                          {property.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(property.asking_price_ngn)}</TableCell>
                      <TableCell>
                        <Badge className={riskColors[property.risk_rating]} variant="secondary">
                          {property.risk_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>{property.profiles?.full_name || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(property.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/properties/${property.id}`}>
                              <Eye size={16} />
                            </Link>
                          </Button>
                          {(isAdmin ||
                            property.assigned_consultant_id === profile?.id) && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/dashboard/properties/${property.id}/edit`}>
                                <Edit size={16} />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <PropertyForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchProperties}
      />
    </DashboardLayout>
  );
}
