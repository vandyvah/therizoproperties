import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd, createOrganizationSchema } from "@/components/seo/JsonLd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowRight, Calendar, User, Tag } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["public-blog-posts"],
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
          tags,
          published_at,
          blog_clusters (name, slug)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: clusters } = useQuery({
    queryKey: ["public-blog-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_clusters")
        .select("id, name, slug")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Get unique categories
  const categories = [...new Set(posts?.map((p) => p.category) || [])];

  return (
    <Layout>
      <SEOHead
        title="Blog - Nigerian Real Estate Insights | Therizo Properties"
        description="Expert insights on Nigerian real estate investment, property due diligence, title verification, and market analysis for serious buyers and diaspora investors."
        canonical="/blog"
        ogImage="https://therizoproperties.com/og/og-standard.jpg"
      />
      <JsonLd data={createOrganizationSchema()} />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Real Estate Insights
            </h1>
            <p className="text-xl text-primary-foreground/80">
              Expert guidance on Nigerian property investment, due diligence, and market analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Clusters */}
      {clusters && clusters.length > 0 && (
        <section className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-muted-foreground">Topics:</span>
              {clusters.map((cluster) => (
                <Link
                  key={cluster.id}
                  to={`/blog/cluster/${cluster.slug}`}
                  className="text-sm font-medium text-primary hover:text-gold transition-colors"
                >
                  {cluster.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 rounded-t-lg" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No posts published yet. Check back soon!</p>
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
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-semibold mb-8 text-center">
              Browse by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Tag className="h-3 w-3 mr-2" />
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}