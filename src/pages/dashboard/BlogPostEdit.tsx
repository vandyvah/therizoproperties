import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BlogPostEditor } from "@/components/blog/BlogPostEditor";

export default function BlogPostEdit() {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-semibold">{id ? "Edit Post" : "New Post"}</h1>
        <BlogPostEditor postId={id} />
      </div>
    </DashboardLayout>
  );
}