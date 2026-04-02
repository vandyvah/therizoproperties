import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          blog_clusters (id, name, slug)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Get related posts from same cluster
  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", post?.cluster_id],
    enabled: !!post?.cluster_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, featured_image_url, summary_answer")
        .eq("cluster_id", post!.cluster_id)
        .eq("status", "published")
        .neq("id", post!.id)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Calculate read time
  const readTime = post ? Math.ceil(post.word_count / 200) : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 rounded-lg mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-4/6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog" className="text-gold hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  // Article schema for JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary_answer,
    image: post.featured_image_url,
    author: {
      "@type": "Person",
      name: post.author_name,
    },
    publisher: {
      "@type": "Organization",
      name: "Therizo Property and Development Corporation",
      logo: {
        "@type": "ImageObject",
        url: "https://therizoproperties.com/favicon.png",
      },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://therizoproperties.com/blog/${post.slug}`,
    },
    keywords: post.tags?.join(", "),
    articleSection: post.category,
    wordCount: post.word_count,
  };

  // FAQ schema if query targets exist
  const faqSchema = post.query_targets?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.query_targets.map((q: string) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: "See article for detailed answer.",
      },
    })),
  } : null;

  return (
    <Layout>
      <SEOHead
        title={`${post.title} | Therizo Blog`}
        description={post.summary_answer.slice(0, 160)}
        canonical={`/blog/${post.slug}`}
        ogImage={post.featured_image_url}
        ogType="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        keywords={post.tags?.join(", ")}
      />
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <article>
        {/* Hero */}
        <header className="bg-primary text-primary-foreground py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog", href: "/blog" },
                  ...(post.blog_clusters ? [{ 
                    label: post.blog_clusters.name, 
                    href: `/blog/cluster/${post.blog_clusters.slug}` 
                  }] : []),
                  { label: post.title },
                ]}
                className="mb-6 text-primary-foreground/70"
              />
              
              <Badge className="mb-4 bg-gold text-foreground">{post.category}</Badge>
              
              <h1 className="font-display text-3xl lg:text-5xl font-bold mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author_name}
                </span>
                {post.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at), "MMMM d, yyyy")}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="container mx-auto px-4 -mt-8 lg:-mt-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            <figure>
              <img
                src={post.featured_image_url}
                alt={post.featured_image_alt}
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
              />
              {post.featured_image_caption && (
                <figcaption className="text-sm text-muted-foreground text-center mt-3">
                  {post.featured_image_caption}
                </figcaption>
              )}
            </figure>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              {/* Main Content */}
              <div>
                {/* Quick Answer Box */}
                <Card className="mb-10 border-l-4 border-l-gold bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/90 leading-relaxed">
                      {post.summary_answer}
                    </p>
                  </CardContent>
                </Card>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-a:text-gold prose-a:no-underline hover:prose-a:underline">
                  <ReactMarkdown>{post.body_content}</ReactMarkdown>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-6 border-t">
                    <div className="flex flex-wrap gap-2 items-center">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Cluster Link */}
                {post.blog_clusters && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Topic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Link
                        to={`/blog/cluster/${post.blog_clusters.slug}`}
                        className="font-medium text-primary hover:text-gold transition-colors"
                      >
                        {post.blog_clusters.name} →
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Related Posts */}
                {relatedPosts && relatedPosts.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Related Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          to={`/blog/${related.slug}`}
                          className="block group"
                        >
                          <div className="flex gap-3">
                            <img
                              src={related.featured_image_url}
                              alt=""
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-gold transition-colors">
                                {related.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </aside>
            </div>

            {/* Back Link */}
            <div className="mt-12 pt-6 border-t">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all posts
              </Link>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
}