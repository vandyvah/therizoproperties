import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
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
import { Plus, Search, Eye, Edit, Loader2, Trash2, User, Users, Star } from "lucide-react";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  is_featured: boolean;
  assigned_consultant_id: string | null;
  created_by_id: string | null;
  updated_at: string;
  assigned_consultant?: { full_name: string } | null;
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
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "my">(isAdmin ? "all" : "my");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pick<Property, "id" | "title"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForceDeleteConfirm, setShowForceDeleteConfirm] = useState(false);
  const [relatedCounts, setRelatedCounts] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, title, city, area, status, asking_price_ngn, risk_rating, is_featured,
          assigned_consultant_id, created_by_id, updated_at,
          assigned_consultant:profiles!properties_assigned_consultant_id_fkey(full_name)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the joined profile
      const transformed = (data || []).map(p => ({
        ...p,
        assigned_consultant: Array.isArray(p.assigned_consultant) 
          ? p.assigned_consultant[0] || null 
          : p.assigned_consultant,
      })) as Property[];
      
      setProperties(transformed);
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
      property.city.toLowerCase().includes(search.toLowerCase()) ||
      (property.area?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesCity = cityFilter === "all" || property.city === cityFilter;
    
    // Ownership filter
    const matchesOwnership = ownershipFilter === "all" || 
      property.created_by_id === profile?.id || 
      property.assigned_consultant_id === profile?.id;
    
    return matchesSearch && matchesStatus && matchesCity && matchesOwnership;
  });

  const uniqueCities = [...new Set(properties.map((p) => p.city))];

  const extractStoragePathFromPublicUrl = (publicUrl: string) => {
    const parts = publicUrl.split("/property-media/");
    return parts.length > 1 ? parts[1] : null;
  };

  const checkRelatedRecords = async (propertyId: string) => {
    const [leadsRes, dealsRes, viewingsRes, checksRes, roiRes] = await Promise.all([
      supabase.from("leads").select("id", { head: true, count: "exact" }).eq("property_id", propertyId),
      supabase.from("deals").select("id", { head: true, count: "exact" }).eq("property_id", propertyId),
      supabase.from("viewings").select("id", { head: true, count: "exact" }).eq("property_id", propertyId),
      supabase
        .from("due_diligence_checks")
        .select("id", { head: true, count: "exact" })
        .eq("property_id", propertyId),
      supabase
        .from("roi_calculations")
        .select("id", { head: true, count: "exact" })
        .eq("property_id", propertyId),
    ]);

    const firstError = [
      leadsRes.error,
      dealsRes.error,
      viewingsRes.error,
      checksRes.error,
      roiRes.error,
    ].find(Boolean);
    if (firstError) throw firstError;

    return [
      { label: "leads", count: leadsRes.count ?? 0 },
      { label: "deals", count: dealsRes.count ?? 0 },
      { label: "viewings", count: viewingsRes.count ?? 0 },
      { label: "due diligence checks", count: checksRes.count ?? 0 },
      { label: "ROI calculations", count: roiRes.count ?? 0 },
    ].filter((x) => x.count > 0);
  };

  const deleteProperty = async (propertyId: string, force = false) => {
    setIsDeleting(true);
    try {
      // Check for relational dependencies
      const blockingCounts = await checkRelatedRecords(propertyId);

      if (blockingCounts.length > 0 && !force) {
        // Show force delete confirmation
        setRelatedCounts(blockingCounts);
        setShowForceDeleteConfirm(true);
        setIsDeleting(false);
        return;
      }

      // If force delete, remove all related records first (and fail fast on any error)
      if (force) {
        // 1) Viewings (references leads)
        const { error: viewingsDeleteError } = await supabase
          .from("viewings")
          .delete()
          .eq("property_id", propertyId);
        if (viewingsDeleteError) throw viewingsDeleteError;

        // 2) Deals + deal consultant shares
        const { data: dealsForProperty, error: dealsFetchError } = await supabase
          .from("deals")
          .select("id")
          .eq("property_id", propertyId);
        if (dealsFetchError) throw dealsFetchError;

        const dealIds = (dealsForProperty || []).map((d) => d.id);
        if (dealIds.length > 0) {
          const { error: sharesDeleteError } = await supabase
            .from("deal_consultant_shares")
            .delete()
            .in("deal_id", dealIds);
          if (sharesDeleteError) throw sharesDeleteError;
        }

        const { error: dealsDeleteError } = await supabase
          .from("deals")
          .delete()
          .eq("property_id", propertyId);
        if (dealsDeleteError) throw dealsDeleteError;

        // 3) Leads (references properties)
        const { error: leadsDeleteError } = await supabase
          .from("leads")
          .delete()
          .eq("property_id", propertyId);
        if (leadsDeleteError) throw leadsDeleteError;

        // 4) Due diligence checks
        const { error: checksDeleteError } = await supabase
          .from("due_diligence_checks")
          .delete()
          .eq("property_id", propertyId);
        if (checksDeleteError) throw checksDeleteError;

        // 5) ROI calculations
        const { error: roiDeleteError } = await supabase
          .from("roi_calculations")
          .delete()
          .eq("property_id", propertyId);
        if (roiDeleteError) throw roiDeleteError;

        // Final sanity check: if anything remains, stop before deleting property
        const remaining = await checkRelatedRecords(propertyId);
        if (remaining.length > 0) {
          throw new Error(
            `Force delete couldn't remove all linked records (${remaining
              .map((r) => `${r.count} ${r.label}`)
              .join(", ")}).`,
          );
        }
      }

      // Remove media files + rows
      const { data: mediaRows } = await supabase
        .from("property_media")
        .select("id, file_url")
        .eq("property_id", propertyId);

      const mediaPaths = (mediaRows || [])
        .map((m) => extractStoragePathFromPublicUrl(m.file_url))
        .filter(Boolean) as string[];

      if (mediaPaths.length > 0) {
        const { error: storageRemoveError } = await supabase.storage
          .from("property-media")
          .remove(mediaPaths);
        if (storageRemoveError) {
          // Don't block deletion if storage cleanup fails, but log it for follow-up.
          console.warn("Storage cleanup failed:", storageRemoveError);
        }
      }

      const { error: mediaDeleteError } = await supabase
        .from("property_media")
        .delete()
        .eq("property_id", propertyId);
      if (mediaDeleteError) throw mediaDeleteError;

      const { error: docsDeleteError } = await supabase
        .from("property_documents")
        .delete()
        .eq("property_id", propertyId);
      if (docsDeleteError) throw docsDeleteError;

      const { error: deleteError } = await supabase.from("properties").delete().eq("id", propertyId);
      if (deleteError) throw deleteError;

      toast.success("Property deleted successfully");
      setDeleteTarget(null);
      setShowForceDeleteConfirm(false);
      setRelatedCounts([]);
      await fetchProperties();
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e?.message || "Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  // Count properties for tabs
  const myPropertiesCount = properties.filter(
    p => p.created_by_id === profile?.id || p.assigned_consultant_id === profile?.id
  ).length;
  const allPropertiesCount = properties.length;

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
      <SEOHead title="Properties" description="Manage property listings" noindex={true} />
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

        {/* Ownership Filter Tabs */}
        <Tabs value={ownershipFilter} onValueChange={(v) => setOwnershipFilter(v as "all" | "my")}>
          <TabsList>
            <TabsTrigger value="my" className="flex items-center gap-2">
              <User size={14} />
              My Listings ({myPropertiesCount})
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users size={14} />
                All Listings ({allPropertiesCount})
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, city, or area..."
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
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
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
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {ownershipFilter === "my" 
                        ? "You don't have any properties yet. Click 'Add Property' to create one."
                        : "No properties found"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {property.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span>{property.city}</span>
                          {property.area && (
                            <span className="text-muted-foreground text-xs block">
                              {property.area}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[property.status]} variant="secondary">
                          {property.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {property.is_featured ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(property.asking_price_ngn)}</TableCell>
                      <TableCell>
                        <Badge className={riskColors[property.risk_rating]} variant="secondary">
                          {property.risk_rating}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {property.assigned_consultant?.full_name || (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
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
                          {(isAdmin || property.assigned_consultant_id === profile?.id) && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/dashboard/properties/${property.id}/edit`}>
                                <Edit size={16} />
                              </Link>
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget({ id: property.id, title: property.title })}
                              aria-label={`Delete ${property.title}`}
                            >
                              <Trash2 size={16} />
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

      <AlertDialog
        open={!!deleteTarget && !showForceDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setRelatedCounts([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}" and all associated media.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) void deleteProperty(deleteTarget.id);
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Checking…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog
        open={showForceDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForceDeleteConfirm(false);
            setDeleteTarget(null);
            setRelatedCounts([]);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️ Force Delete Property?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This property has linked records that will also be <strong className="text-destructive">permanently deleted</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {relatedCounts.map((item) => (
                  <li key={item.label} className="text-foreground">
                    <strong>{item.count}</strong> {item.label}
                  </li>
                ))}
              </ul>
              <p className="text-destructive font-medium">
                This action cannot be undone. All data will be permanently lost.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) void deleteProperty(deleteTarget.id, true);
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Force Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}