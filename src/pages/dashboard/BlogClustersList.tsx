import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ClusterForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  custom_content: string;
}

export default function BlogClustersList() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<ClusterForm | null>(null);
  const [form, setForm] = useState<ClusterForm>({
    name: "",
    slug: "",
    description: "",
    custom_content: "",
  });

  const { data: clusters, isLoading } = useQuery({
    queryKey: ["blog-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_clusters")
        .select(`
          *,
          blog_posts (count)
        `)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ClusterForm) => {
      if (data.id) {
        const { error } = await supabase
          .from("blog_clusters")
          .update({
            name: data.name,
            slug: data.slug,
            description: data.description,
            custom_content: data.custom_content,
            is_auto_generated: false,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_clusters").insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          custom_content: data.custom_content,
          is_auto_generated: false,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-clusters"] });
      toast.success(editingCluster ? "Cluster updated" : "Cluster created");
      closeDialog();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save cluster");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_clusters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-clusters"] });
      toast.success("Cluster deleted");
    },
    onError: () => {
      toast.error("Failed to delete cluster");
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const openEditDialog = (cluster: any) => {
    setEditingCluster(cluster);
    setForm({
      id: cluster.id,
      name: cluster.name,
      slug: cluster.slug,
      description: cluster.description || "",
      custom_content: cluster.custom_content || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCluster(null);
    setForm({ name: "", slug: "", description: "", custom_content: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <DashboardLayout title="Blog Clusters">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Organize posts into thematic clusters for better navigation and SEO.
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => closeDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                New Cluster
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCluster ? "Edit Cluster" : "Create Cluster"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: !editingCluster ? generateSlug(e.target.value) : form.slug,
                      });
                    }}
                    placeholder="e.g., Nigerian Real Estate Due Diligence"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="nigerian-real-estate-due-diligence"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /blog/cluster/{form.slug || "..."}
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description for SEO and display"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="custom_content">Custom Content (Optional)</Label>
                  <Textarea
                    id="custom_content"
                    value={form.custom_content}
                    onChange={(e) => setForm({ ...form, custom_content: e.target.value })}
                    placeholder="Custom intro content for the cluster landing page (Markdown)"
                    rows={5}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingCluster ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clusters Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : clusters?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No clusters yet. Create your first cluster!
                  </TableCell>
                </TableRow>
              ) : (
                clusters?.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell className="font-medium">{cluster.name}</TableCell>
                    <TableCell className="text-muted-foreground">/blog/cluster/{cluster.slug}</TableCell>
                    <TableCell>{cluster.blog_posts?.[0]?.count || 0}</TableCell>
                    <TableCell>
                      {cluster.is_auto_generated ? "Auto" : "Custom"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(cluster.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/blog/cluster/${cluster.slug}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cluster)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Delete this cluster? Posts will be unassigned.")) {
                              deleteMutation.mutate(cluster.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}