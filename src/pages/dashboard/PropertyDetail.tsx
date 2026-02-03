import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, MapPin, Building, AlertTriangle, CheckCircle, Clock, X, Loader2 } from "lucide-react";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  property_type: string;
  city: string;
  area: string | null;
  asking_price_ngn: number;
  min_price_ngn: number | null;
  rental_potential_monthly_ngn: number | null;
  airbnb_potential_nightly_ngn: number | null;
  owner_name: string | null;
  owner_contact: string | null;
  description: string | null;
  risk_rating: "low" | "medium" | "high";
  status: "draft" | "under_review" | "listed" | "on_hold" | "sold";
  created_at: string;
}

interface DueDiligenceCheck {
  id: string;
  check_type: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  notes: string | null;
  checked_at: string | null;
}

interface Lead {
  id: string;
  stage: string;
  clients: { full_name: string } | null;
  created_at: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  under_review: "bg-yellow-100 text-yellow-800",
  listed: "bg-green-100 text-green-800",
  on_hold: "bg-orange-100 text-orange-800",
  sold: "bg-blue-100 text-blue-800",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const checkStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-600" />,
  completed: <CheckCircle className="h-4 w-4 text-green-600" />,
  failed: <X className="h-4 w-4 text-red-600" />,
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [dueDiligence, setDueDiligence] = useState<DueDiligenceCheck[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-open edit form if URL ends with /edit
  const isEditMode = location.pathname.endsWith('/edit');
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  
  // Update showEditForm when route changes
  useEffect(() => {
    setShowEditForm(isEditMode);
  }, [isEditMode]);
  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchDueDiligence();
      fetchLeads();
    }
  }, [id]);

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load property");
      navigate("/dashboard/properties");
      return;
    }

    if (data) {
      setProperty(data as Property);
    }
    setLoading(false);
  };

  const fetchDueDiligence = async () => {
    const { data } = await supabase
      .from("due_diligence_checks")
      .select("*")
      .eq("property_id", id)
      .order("created_at");

    if (data) setDueDiligence(data as DueDiligenceCheck[]);
  };

  const fetchLeads = async () => {
    const { data } = await supabase
      .from("leads")
      .select(`
        id,
        stage,
        created_at,
        clients:client_id(full_name)
      `)
      .eq("property_id", id)
      .order("created_at", { ascending: false });

    if (data) setLeads(data as Lead[]);
  };

  const handleUpdateDueDiligence = async (checkId: string, status: DueDiligenceCheck["status"]) => {
    const { error } = await supabase
      .from("due_diligence_checks")
      .update({ status, checked_at: status === "completed" ? new Date().toISOString() : null })
      .eq("id", checkId);

    if (error) {
      toast.error("Failed to update check");
    } else {
      toast.success("Check updated");
      fetchDueDiligence();
    }
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

  if (!property) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEOHead title={property.title} description="Property details" noindex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/properties")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.area ? `${property.area}, ` : ""}{property.city}</span>
              </div>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowEditForm(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Badge className={statusColors[property.status]}>
            {property.status.replace("_", " ")}
          </Badge>
          <Badge className={riskColors[property.risk_rating]}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {property.risk_rating} risk
          </Badge>
          <Badge variant="outline">
            <Building className="h-3 w-3 mr-1" />
            {property.property_type}
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="due-diligence">Due Diligence</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Asking Price</p>
                    <p className="text-2xl font-bold">{formatCurrency(property.asking_price_ngn)}</p>
                  </div>
                  {property.min_price_ngn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum Price</p>
                      <p className="text-lg font-semibold">{formatCurrency(property.min_price_ngn)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Income Potential</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.rental_potential_monthly_ngn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rental</p>
                      <p className="text-lg font-semibold">{formatCurrency(property.rental_potential_monthly_ngn)}</p>
                    </div>
                  )}
                  {property.airbnb_potential_nightly_ngn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Nightly Airbnb</p>
                      <p className="text-lg font-semibold">{formatCurrency(property.airbnb_potential_nightly_ngn)}</p>
                    </div>
                  )}
                  {!property.rental_potential_monthly_ngn && !property.airbnb_potential_nightly_ngn && (
                    <p className="text-muted-foreground">No income projections added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {property.owner_name ? (
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">Name:</span> {property.owner_name}</p>
                      {property.owner_contact && (
                        <p><span className="text-muted-foreground">Contact:</span> {property.owner_contact}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No owner information added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {property.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="due-diligence" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Due Diligence Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                {dueDiligence.length > 0 ? (
                  <div className="space-y-4">
                    {dueDiligence.map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {checkStatusIcons[check.status]}
                          <div>
                            <p className="font-medium">{check.check_type.replace(/_/g, " ")}</p>
                            {check.notes && <p className="text-sm text-muted-foreground">{check.notes}</p>}
                          </div>
                        </div>
                        <select
                          value={check.status}
                          onChange={(e) => handleUpdateDueDiligence(check.id, e.target.value as DueDiligenceCheck["status"])}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No due diligence checks yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Document management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Associated Leads</CardTitle>
              </CardHeader>
              <CardContent>
                {leads.length > 0 ? (
                  <div className="space-y-3">
                    {leads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{lead.clients?.full_name || "Unknown client"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{lead.stage.replace(/_/g, " ")}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No leads for this property</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">ROI calculations coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showEditForm && (
          <PropertyForm
            open={showEditForm}
            onClose={() => {
              setShowEditForm(false);
              // Navigate back to detail page (without /edit) if we were on /edit route
              if (isEditMode) {
                navigate(`/dashboard/properties/${id}`, { replace: true });
              }
            }}
            onSuccess={fetchProperty}
            initialData={property}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
