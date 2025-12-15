import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Eye, Mail, UserCheck } from "lucide-react";
import { LeadForm } from "@/components/dashboard/LeadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

type LeadStage = "new" | "qualified" | "viewing_scheduled" | "offer_made" | "under_negotiation" | "closed_won" | "closed_lost";

interface Lead {
  id: string;
  stage: LeadStage;
  budget_min_ngn: number | null;
  budget_max_ngn: number | null;
  preferred_city: string | null;
  created_at: string;
  updated_at: string;
  clients?: { full_name: string } | null;
  properties?: { title: string } | null;
  profiles?: { full_name: string } | null;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  client_type: string | null;
  budget: string | null;
  preferred_location: string | null;
  message: string;
  page: string | null;
  status: string;
  created_at: string;
}

const stageLabels: Record<LeadStage, string> = {
  new: "New",
  qualified: "Qualified",
  viewing_scheduled: "Viewing Scheduled",
  offer_made: "Offer Made",
  under_negotiation: "Under Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const stageColors: Record<LeadStage, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  qualified: "bg-purple-100 text-purple-800 border-purple-200",
  viewing_scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
  offer_made: "bg-orange-100 text-orange-800 border-orange-200",
  under_negotiation: "bg-pink-100 text-pink-800 border-pink-200",
  closed_won: "bg-green-100 text-green-800 border-green-200",
  closed_lost: "bg-gray-100 text-gray-800 border-gray-200",
};

const stages: LeadStage[] = [
  "new",
  "qualified",
  "viewing_scheduled",
  "offer_made",
  "under_negotiation",
  "closed_won",
  "closed_lost",
];

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select(`
          id, stage, budget_min_ngn, budget_max_ngn, preferred_city, created_at, updated_at,
          clients:client_id(full_name),
          properties:property_id(title)
        `)
        .order("updated_at", { ascending: false });

      if (leadsError) throw leadsError;
      setLeads((leadsData as Lead[]) || []);

      // Fetch contact submissions (for admins)
      if (isAdmin) {
        const { data: contactsData, error: contactsError } = await supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!contactsError) {
          setContactSubmissions(contactsData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status })
        .eq("id", id);

      if (!error) {
        setContactSubmissions(prev => 
          prev.map(c => c.id === id ? { ...c, status } : c)
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getLeadsByStage = (stage: LeadStage) => {
    return leads.filter((lead) => lead.stage === stage);
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

  const getContactsByStatus = (status: string) => {
    return contactSubmissions.filter(c => c.status === status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "reviewed": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const newContacts = getContactsByStatus("new");

  return (
    <DashboardLayout>
      <SEOHead title="Leads Pipeline" description="Track and manage sales pipeline" noindex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Leads Pipeline</h1>
            <p className="text-muted-foreground mt-1">Track and manage your sales pipeline</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Lead
          </Button>
        </div>

        <Tabs defaultValue="pipeline" className="w-full">
          <TabsList>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <UserCheck size={16} />
              Pipeline
              <Badge variant="secondary" className="ml-1">{leads.length}</Badge>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="enquiries" className="flex items-center gap-2">
                <Mail size={16} />
                Website Enquiries
                {newContacts.length > 0 && (
                  <Badge className="ml-1 bg-red-500">{newContacts.length}</Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="pipeline" className="mt-4">
            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageLeads = getLeadsByStage(stage);
                return (
                  <div key={stage} className="flex-shrink-0 w-72">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {stageLabels[stage]}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {stageLeads.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {stageLeads.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No leads
                          </p>
                        ) : (
                          stageLeads.map((lead) => (
                            <Card
                              key={lead.id}
                              className={`p-3 cursor-pointer hover:shadow-md transition-shadow border ${stageColors[stage]}`}
                            >
                              <div className="space-y-2">
                                <div className="font-medium text-sm">
                                  {lead.clients?.full_name || "Unknown Client"}
                                </div>
                                {lead.properties && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {lead.properties.title}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {lead.preferred_city || "Any location"}
                                  </span>
                                  {lead.budget_max_ngn && (
                                    <span className="font-medium">
                                      {formatCurrency(lead.budget_max_ngn)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <span className="text-xs text-muted-foreground">
                                    {lead.profiles?.full_name || "Unassigned"}
                                  </span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                    <Link to={`/dashboard/leads/${lead.id}`}>
                                      <Eye size={14} />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="enquiries" className="mt-4">
              {/* Contact Enquiries */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {["new", "reviewed", "closed"].map((status) => {
                  const statusContacts = getContactsByStatus(status);
                  return (
                    <div key={status} className="flex-shrink-0 w-80">
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium capitalize">
                              {status}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {statusContacts.length}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
                          {statusContacts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No enquiries
                            </p>
                          ) : (
                            statusContacts.map((contact) => (
                              <Card
                                key={contact.id}
                                className={`p-3 border ${getStatusColor(status)}`}
                              >
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">{contact.name}</div>
                                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                                  {contact.phone && (
                                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                  )}
                                  <p className="text-xs line-clamp-2">{contact.message}</p>
                                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                                    <span className="text-muted-foreground">
                                      {contact.preferred_location || "Any location"}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {new Date(contact.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {status !== "closed" && (
                                    <div className="flex gap-2 pt-2">
                                      {status === "new" && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-xs h-7"
                                          onClick={() => updateContactStatus(contact.id, "reviewed")}
                                        >
                                          Mark Reviewed
                                        </Button>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-xs h-7"
                                        onClick={() => updateContactStatus(contact.id, "closed")}
                                      >
                                        Close
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <LeadForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={fetchData}
        />
      </div>
    </DashboardLayout>
  );
}
