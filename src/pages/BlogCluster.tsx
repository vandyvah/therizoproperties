import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar, User, ArrowRight, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogCluster() {
  const { slug } = useParams();

  const { data: cluster, isLoading: clusterLoading } = useQuery({
    queryKey: ["blog-cluster", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_clusters")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["cluster-posts", cluster?.id],
    enabled: !!cluster?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          slug,
          summary_answer,
          featured_image_url,
          featured_image_alt,
          author_name,
          category,
          published_at
        `)
        .eq("cluster_id", cluster!.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const isLoading = clusterLoading || postsLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 rounded-t-lg" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!cluster) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4">Topic Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The topic you're looking for doesn't exist.
          </p>
          <Link to="/blog" className="text-gold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  // Collection page schema
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cluster.name,
    description: cluster.description || `Articles about ${cluster.name}`,
    url: `https://therizoproperties.com/blog/cluster/${cluster.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts?.length || 0,
      itemListElement: posts?.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://therizoproperties.com/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <Layout>
      <SEOHead
        title={`${cluster.name} - Therizo Blog`}
        description={cluster.description || `Expert articles and guides about ${cluster.name} from Therizo Properties.`}
        canonical={`/blog/cluster/${cluster.slug}`}
        ogImage="/og/og-standard.jpg"
      />
      <JsonLd data={collectionSchema} />
      <JsonLd data={createOrganizationSchema()} />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: cluster.name },
              ]}
              className="mb-6 text-primary-foreground/70"
            />
            
            <h1 className="font-display text-3xl lg:text-5xl font-bold mb-4">
              {cluster.name}
            </h1>
            
            {cluster.description && (
              <p className="text-xl text-primary-foreground/80">
                {cluster.description}
              </p>
            )}
            
            <p className="text-primary-foreground/60 mt-4">
              {posts?.length || 0} article{posts?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Custom Content */}
      {cluster.custom_content && (
        <section className="border-b py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl prose dark:prose-invert">
              <ReactMarkdown>{cluster.custom_content}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {posts?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No posts in this topic yet.</p>
              <Link to="/blog" className="text-gold hover:underline mt-4 inline-block">
                ← Browse all posts
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.featured_image_alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h2 className="font-display text-xl font-semibold mb-3 line-clamp-2 group-hover:text-gold transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {post.summary_answer}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author_name}
                          </span>
                          {post.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all posts
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}