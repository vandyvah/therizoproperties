import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Archive,
  Send,
} from "lucide-react";
import { format } from "date-fns";

export default function BlogPostsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          blog_clusters (name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      if (status === "published") {
        updateData.published_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const filteredPosts = posts?.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Blog Posts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard/blog/clusters">
                <FileText className="h-4 w-4 mr-2" />
                Clusters
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {posts?.filter((p) => p.status === "published").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {posts?.filter((p) => p.status === "draft").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {posts?.filter((p) => p.status === "archived").length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPosts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No posts found. Create your first post!
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts?.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>
                      {post.blog_clusters?.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>{post.word_count}</TableCell>
                    <TableCell>
                      {format(new Date(post.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.status === "published" && (
                            <DropdownMenuItem
                              onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => navigate(`/dashboard/blog/${post.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {post.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({ id: post.id, status: "published" })
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {post.status === "published" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateStatusMutation.mutate({ id: post.id, status: "archived" })
                              }
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Delete this post?")) {
                                deleteMutation.mutate(post.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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