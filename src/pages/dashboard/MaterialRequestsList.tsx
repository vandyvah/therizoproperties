import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  MessageCircle,
  FileText,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";

type MaterialRequest = {
  id: string;
  created_at: string;
  full_name: string;
  role: string;
  company_name: string | null;
  phone: string;
  email: string | null;
  site_location: string;
  delivery_timeline: string;
  request_type: string;
  boq_file_url: string | null;
  access_constraints: string | null;
  payment_preference: string;
  status: string;
  internal_notes: string | null;
};

type MaterialRequestItem = {
  id: string;
  request_id: string;
  category: string;
  specification: string;
  quantity_unit: string;
  notes: string | null;
};

const statusColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "In Review": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Quoted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Scheduled: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const statuses = ["New", "In Review", "Quoted", "Scheduled", "Delivered", "Closed"];

export default function MaterialRequestsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["material-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("material_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaterialRequest[];
    },
  });

  const { data: requestItems } = useQuery({
    queryKey: ["material-request-items", selectedRequest?.id],
    queryFn: async () => {
      if (!selectedRequest?.id) return [];
      const { data, error } = await supabase
        .from("material_request_items")
        .select("*")
        .eq("request_id", selectedRequest.id);
      if (error) throw error;
      return data as MaterialRequestItem[];
    },
    enabled: !!selectedRequest?.id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaterialRequest> }) => {
      const { error } = await supabase
        .from("material_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-requests"] });
      toast.success("Request updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update request");
    },
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, updates: { status: newStatus } });
  };

  const handleSaveNotes = () => {
    if (selectedRequest) {
      updateMutation.mutate({
        id: selectedRequest.id,
        updates: { internal_notes: internalNotes },
      });
    }
  };

  const filteredRequests = requests?.filter((request) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.full_name.toLowerCase().includes(query) ||
      request.phone.includes(query) ||
      request.site_location.toLowerCase().includes(query) ||
      (request.company_name?.toLowerCase().includes(query) ?? false)
    );
  });

  const generateWhatsAppMessage = (request: MaterialRequest) => {
    return `Hello ${request.full_name},

Thank you for your material supply request.

Site: ${request.site_location}
Timeline: ${request.delivery_timeline}
Payment: ${request.payment_preference}

We are processing your request and will provide a detailed quote shortly.

- Therizo Properties`;
  };

  const copyWhatsAppMessage = (request: MaterialRequest) => {
    const message = generateWhatsAppMessage(request);
    navigator.clipboard.writeText(message);
    toast.success("WhatsApp message copied to clipboard");
  };

  const openWhatsApp = (request: MaterialRequest) => {
    const message = encodeURIComponent(generateWhatsAppMessage(request));
    const phone = request.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold">Material Requests</h1>
            <p className="text-muted-foreground">Manage building materials supply requests</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredRequests?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No material requests found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Site Location</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests?.map((request) => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedRequest(request);
                        setInternalNotes(request.internal_notes || "");
                      }}
                    >
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(request.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.role}
                            {request.company_name && ` • ${request.company_name}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.site_location}
                      </TableCell>
                      <TableCell>{request.delivery_timeline}</TableCell>
                      <TableCell>
                        {request.request_type === "boq" ? (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <FileText className="h-3 w-3" />
                            BOQ
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Items List</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status] || ""}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openWhatsApp(request)}
                            title="Open WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          {request.boq_file_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="View BOQ"
                            >
                              <a href={request.boq_file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
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
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Contact Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2 font-medium">{selectedRequest.full_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Role:</span>
                      <span className="ml-2">{selectedRequest.role}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="ml-2">{selectedRequest.phone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedRequest.email || "N/A"}</span>
                    </div>
                    {selectedRequest.company_name && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="ml-2">{selectedRequest.company_name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Site Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Site Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-2">{selectedRequest.site_location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delivery Timeline:</span>
                      <span className="ml-2">{selectedRequest.delivery_timeline}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Preference:</span>
                      <span className="ml-2">{selectedRequest.payment_preference}</span>
                    </div>
                    {selectedRequest.access_constraints && (
                      <div>
                        <span className="text-muted-foreground">Access Constraints:</span>
                        <span className="ml-2">{selectedRequest.access_constraints}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Materials */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Materials Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRequest.request_type === "boq" ? (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">BOQ file uploaded</span>
                        {selectedRequest.boq_file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={selectedRequest.boq_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View BOQ
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {requestItems?.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No items listed</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Specification</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {requestItems?.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell>{item.specification}</TableCell>
                                  <TableCell>{item.quantity_unit}</TableCell>
                                  <TableCell>{item.notes || "-"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status & Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Status & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Status
                      </label>
                      <Select
                        value={selectedRequest.status}
                        onValueChange={(value) => {
                          handleStatusChange(selectedRequest.id, value);
                          setSelectedRequest({ ...selectedRequest, status: value });
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground block mb-2">
                        Internal Notes
                      </label>
                      <Textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Add internal notes about this request..."
                        rows={3}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleSaveNotes}
                      >
                        Save Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyWhatsAppMessage(selectedRequest)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy WhatsApp Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedRequest.id, "Quoted")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Quoted
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedRequest.id, "Scheduled")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Scheduled
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedRequest.id, "Delivered")}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}