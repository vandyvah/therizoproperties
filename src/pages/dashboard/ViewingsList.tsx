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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Calendar, MapPin } from "lucide-react";

type ViewingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

interface Viewing {
  id: string;
  scheduled_at: string;
  status: ViewingStatus;
  notes: string | null;
  created_at: string;
  leads?: { 
    id: string;
    clients?: { full_name: string } | null;
  } | null;
  properties?: { title: string; city: string } | null;
  profiles?: { full_name: string } | null;
}

const statusColors: Record<ViewingStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

export default function ViewingsList() {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViewings();
  }, []);

  const fetchViewings = async () => {
    try {
      const { data, error } = await supabase
        .from("viewings")
        .select(`
          *,
          leads:lead_id(id, clients:client_id(full_name)),
          properties:property_id(title, city),
          profiles:created_by_id(full_name)
        `)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setViewings((data as Viewing[]) || []);
    } catch (error) {
      console.error("Error fetching viewings:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingViewings = viewings.filter(
    (v) => v.status === "scheduled" && new Date(v.scheduled_at) >= new Date()
  );
  const pastViewings = viewings.filter(
    (v) => v.status !== "scheduled" || new Date(v.scheduled_at) < new Date()
  );

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
            <h1 className="font-display text-3xl font-semibold text-foreground">Viewings</h1>
            <p className="text-muted-foreground mt-1">Schedule and track property viewings</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/viewings/new">
              <Plus size={16} className="mr-2" />
              Schedule Viewing
            </Link>
          </Button>
        </div>

        {/* Upcoming Viewings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              Upcoming Viewings ({upcomingViewings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingViewings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming viewings</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingViewings.map((viewing) => (
                  <Card key={viewing.id} className="p-4 border-l-4 border-l-gold">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {viewing.leads?.clients?.full_name || "Unknown Client"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {viewing.properties?.title || "Unknown Property"}
                          </p>
                        </div>
                        <Badge className={statusColors[viewing.status]} variant="secondary">
                          {viewing.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>
                          {new Date(viewing.scheduled_at).toLocaleDateString()}{" "}
                          {new Date(viewing.scheduled_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        <span>{viewing.properties?.city}</span>
                      </div>
                      {viewing.notes && (
                        <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                          {viewing.notes}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Viewings */}
        <Card>
          <CardHeader>
            <CardTitle>Past Viewings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastViewings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No past viewings
                    </TableCell>
                  </TableRow>
                ) : (
                  pastViewings.slice(0, 20).map((viewing) => (
                    <TableRow key={viewing.id}>
                      <TableCell className="font-medium">
                        {viewing.leads?.clients?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {viewing.properties?.title || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {new Date(viewing.scheduled_at).toLocaleDateString()}{" "}
                        {new Date(viewing.scheduled_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[viewing.status]} variant="secondary">
                          {viewing.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{viewing.profiles?.full_name || "-"}</TableCell>
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
