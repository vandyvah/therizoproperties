import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Mail, Phone, Eye, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ContactSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  client_type: string | null;
  budget: string | null;
  preferred_location: string | null;
  message: string;
  page: string | null;
  status: string;
}

export default function ContactSubmissions() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions((data as ContactSubmission[]) || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );

      toast({
        title: "Status Updated",
        description: `Submission marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default">New</Badge>;
      case "reviewed":
        return <Badge variant="secondary">Reviewed</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </DashboardLayout>
    );
  }

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
      <SEOHead title="Contact Submissions" description="Review contact form submissions" noindex={true} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Contact Submissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage enquiries from the contact form
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No contact submissions yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="text-sm">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${submission.email}`}
                          className="flex items-center gap-1 text-sm hover:text-primary"
                        >
                          <Mail size={14} />
                          {submission.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.client_type || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          {submission.status === "new" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(submission.id, "reviewed")}
                            >
                              Mark Reviewed
                            </Button>
                          )}
                          {submission.status === "reviewed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(submission.id, "closed")}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog
          open={!!selectedSubmission}
          onOpenChange={() => setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Contact Submission</DialogTitle>
              <DialogDescription>
                Submitted on{" "}
                {selectedSubmission &&
                  new Date(selectedSubmission.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedSubmission.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    {selectedSubmission.phone ? (
                      <a
                        href={`tel:${selectedSubmission.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedSubmission.phone}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Type</p>
                    <p>{selectedSubmission.client_type || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p>{selectedSubmission.budget || "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Location
                  </p>
                  <p>{selectedSubmission.preferred_location || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Message</p>
                  <p className="whitespace-pre-wrap bg-muted p-3 rounded-md text-sm">
                    {selectedSubmission.message}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </Button>
                  {selectedSubmission.status === "new" && (
                    <Button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, "reviewed");
                        setSelectedSubmission({
                          ...selectedSubmission,
                          status: "reviewed",
                        });
                      }}
                    >
                      Mark as Reviewed
                    </Button>
                  )}
                  {selectedSubmission.status === "reviewed" && (
                    <Button
                      onClick={() => {
                        updateStatus(selectedSubmission.id, "closed");
                        setSelectedSubmission(null);
                      }}
                    >
                      Close Submission
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}