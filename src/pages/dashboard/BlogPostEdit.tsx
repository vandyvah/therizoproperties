import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BlogPostEditor } from "@/components/blog/BlogPostEditor";

export default function BlogPostEdit() {
  const { id } = useParams();

  return (
    <DashboardLayout title={id ? "Edit Post" : "New Post"}>
      <BlogPostEditor postId={id} />
    </DashboardLayout>
  );
}