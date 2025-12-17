import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Eye,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCluster {
  id: string;
  name: string;
  slug: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface BlogPostEditorProps {
  postId?: string;
  onSave?: () => void;
}

const CATEGORIES = [
  "Nigerian Real Estate",
  "Investment Strategy",
  "Due Diligence",
  "Market Analysis",
  "Buyer Guides",
  "Legal & Title",
  "Diaspora Investment",
  "Property Management",
];

export function BlogPostEditor({ postId, onSave }: BlogPostEditorProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clusters, setClusters] = useState<BlogCluster[]>([]);
  const [clusterPosts, setClusterPosts] = useState<{ id: string; title: string }[]>([]);
  const [showPublishChecklist, setShowPublishChecklist] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [summaryAnswer, setSummaryAnswer] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [featuredImageCaption, setFeaturedImageCaption] = useState("");
  const [authorName, setAuthorName] = useState(profile?.full_name || "");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [queryTargets, setQueryTargets] = useState<string[]>([""]);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [selectedInternalLinks, setSelectedInternalLinks] = useState<string[]>([]);
  
  // Quality checklist
  const [originalityConfirmed, setOriginalityConfirmed] = useState(false);
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);
  const [noFillerConfirmed, setNoFillerConfirmed] = useState(false);

  // Generate slug from title and keyword
  const generateSlug = (title: string, keyword: string) => {
    const combined = `${title} ${keyword}`.toLowerCase();
    return combined
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  };

  // Count words in content
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Validate post for publishing
  const validatePost = (): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!title.trim()) errors.push("Title is required");
    if (!primaryKeyword.trim()) errors.push("Primary keyword is required");
    if (!summaryAnswer.trim()) errors.push("Summary answer is required");
    if (!bodyContent.trim()) errors.push("Body content is required");
    if (!featuredImageUrl.trim()) errors.push("Featured image is required");
    if (!featuredImageAlt.trim()) errors.push("Featured image alt text is required");
    if (!authorName.trim()) errors.push("Author name is required");
    if (!category) errors.push("Category is required");
    
    const wordCount = countWords(bodyContent);
    if (wordCount < 700) {
      errors.push(`Content too short: ${wordCount} words (minimum 700)`);
    }
    
    const validQueryTargets = queryTargets.filter(q => q.trim());
    if (validQueryTargets.length < 3) {
      errors.push("At least 3 query targets required");
    }
    
    // Check for headings
    if (!bodyContent.includes("##")) {
      errors.push("Content must include H2 headings (##)");
    }
    
    // Quality checklist
    if (!originalityConfirmed) errors.push("Originality checklist not confirmed");
    if (!accuracyConfirmed) errors.push("Accuracy checklist not confirmed");
    if (!noFillerConfirmed) errors.push("No-filler checklist not confirmed");
    
    // Warnings
    if (!clusterId) warnings.push("No cluster assigned");
    if (selectedInternalLinks.length < 2) warnings.push("Less than 2 internal links");
    if (tags.length === 0) warnings.push("No tags added");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  };

  // Load clusters
  useEffect(() => {
    const fetchClusters = async () => {
      const { data } = await supabase
        .from("blog_clusters")
        .select("id, name, slug")
        .order("name");
      if (data) setClusters(data);
    };
    fetchClusters();
  }, []);

  // Load posts in same cluster for internal linking
  useEffect(() => {
    if (!clusterId) {
      setClusterPosts([]);
      return;
    }
    const fetchClusterPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title")
        .eq("cluster_id", clusterId)
        .neq("id", postId || "")
        .eq("status", "published");
      if (data) setClusterPosts(data);
    };
    fetchClusterPosts();
  }, [clusterId, postId]);

  // Load existing post data
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();
      
      if (error) {
        toast.error("Failed to load post");
        return;
      }
      
      if (data) {
        setTitle(data.title);
        setPrimaryKeyword(data.primary_keyword);
        setSummaryAnswer(data.summary_answer);
        setBodyContent(data.body_content);
        setFeaturedImageUrl(data.featured_image_url);
        setFeaturedImageAlt(data.featured_image_alt);
        setFeaturedImageCaption(data.featured_image_caption || "");
        setAuthorName(data.author_name);
        setCategory(data.category);
        setTags(data.tags || []);
        setClusterId(data.cluster_id);
        setQueryTargets(data.query_targets?.length ? data.query_targets : [""]);
        setStatus(data.status as "draft" | "published" | "archived");
        setOriginalityConfirmed(data.originality_confirmed);
        setAccuracyConfirmed(data.accuracy_confirmed);
        setNoFillerConfirmed(data.no_filler_confirmed);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `featured/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    setFeaturedImageUrl(publicUrl);
    toast.success("Image uploaded");
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Add query target
  const addQueryTarget = () => {
    setQueryTargets([...queryTargets, ""]);
  };

  // Update query target
  const updateQueryTarget = (index: number, value: string) => {
    const updated = [...queryTargets];
    updated[index] = value;
    setQueryTargets(updated);
  };

  // Remove query target
  const removeQueryTarget = (index: number) => {
    if (queryTargets.length > 1) {
      setQueryTargets(queryTargets.filter((_, i) => i !== index));
    }
  };

  // Save post
  const savePost = async (publishAfterSave = false) => {
    setSaving(true);

    const slug = generateSlug(title, primaryKeyword);
    const wordCount = countWords(bodyContent);

    const postData = {
      title,
      slug,
      primary_keyword: primaryKeyword,
      summary_answer: summaryAnswer,
      body_content: bodyContent,
      featured_image_url: featuredImageUrl,
      featured_image_alt: featuredImageAlt,
      featured_image_caption: featuredImageCaption || null,
      author_name: authorName,
      category,
      tags,
      cluster_id: clusterId,
      query_targets: queryTargets.filter(q => q.trim()),
      word_count: wordCount,
      status: publishAfterSave ? "published" : status,
      published_at: publishAfterSave ? new Date().toISOString() : null,
      originality_confirmed: originalityConfirmed,
      accuracy_confirmed: accuracyConfirmed,
      no_filler_confirmed: noFillerConfirmed,
      created_by_id: profile?.id,
    };

    try {
      if (postId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert(postData);
        if (error) throw error;
      }

      toast.success(publishAfterSave ? "Post published!" : "Post saved");
      onSave?.();
      navigate("/dashboard/blog");
    } catch (error: any) {
      toast.error(error.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  // Handle publish
  const handlePublish = () => {
    const validation = validatePost();
    if (!validation.valid) {
      setShowPublishChecklist(true);
      return;
    }
    savePost(true);
  };

  const validation = validatePost();
  const wordCount = countWords(bodyContent);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Publish Checklist Modal */}
      {showPublishChecklist && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cannot Publish - Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-destructive mb-2">Errors (must fix):</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i} className="text-sm text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {validation.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="outline" onClick={() => setShowPublishChecklist(false)}>
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Keyword */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your compelling blog post title"
                />
                {title && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Slug: /blog/{generateSlug(title, primaryKeyword)}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="keyword">Primary Keyword / Query *</Label>
                <Input
                  id="keyword"
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="e.g., Nigerian property investment"
                />
              </div>
              
              <div>
                <Label htmlFor="summary">Summary Answer (Quick Answer) *</Label>
                <Textarea
                  id="summary"
                  value={summaryAnswer}
                  onChange={(e) => setSummaryAnswer(e.target.value)}
                  placeholder="1-3 sentence direct answer to the main query"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This appears at the top of your post as the "Quick Answer" section
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Query Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Query Targets (GEO/Perplexity Optimization) *</CardTitle>
              <CardDescription>
                Add 3-7 natural language questions people would search. Use at least 2 as H2 headings in your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {queryTargets.map((query, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => updateQueryTarget(index, e.target.value)}
                    placeholder="e.g., How do I verify property ownership in Nigeria?"
                  />
                  {queryTargets.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQueryTarget(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addQueryTarget}>
                <Plus className="h-4 w-4 mr-2" />
                Add Query
              </Button>
            </CardContent>
          </Card>

          {/* Body Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
              <CardDescription>
                Use Markdown. Include ## for H2 headings, ### for H3. Minimum 700 words.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                placeholder="Write your article content here using Markdown..."
                rows={20}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <p className={cn(
                  "text-sm",
                  wordCount >= 700 ? "text-green-600" : "text-destructive"
                )}>
                  {wordCount} words {wordCount >= 700 ? "✓" : `(${700 - wordCount} more needed)`}
                </p>
                <div className="flex gap-2">
                  {bodyContent.includes("## ") ? (
                    <Badge variant="outline" className="text-green-600">
                      <Check className="h-3 w-3 mr-1" /> H2 headings
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive">
                      <X className="h-3 w-3 mr-1" /> No H2 headings
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredImageUrl ? (
                <div className="relative">
                  <img
                    src={featuredImageUrl}
                    alt={featuredImageAlt || "Featured image"}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImageUrl("")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="block border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Click to upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              
              <div>
                <Label htmlFor="imageAlt">Alt Text *</Label>
                <Input
                  id="imageAlt"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              
              <div>
                <Label htmlFor="imageCaption">Caption (optional)</Label>
                <Input
                  id="imageCaption"
                  value={featuredImageCaption}
                  onChange={(e) => setFeaturedImageCaption(e.target.value)}
                  placeholder="Photo caption"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Cluster (Theme)</Label>
                <Select value={clusterId || ""} onValueChange={(v) => setClusterId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No cluster</SelectItem>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" size="icon" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="author">Author Name *</Label>
                <Input
                  id="author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Checklist *</CardTitle>
              <CardDescription>Confirm before publishing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="originality"
                  checked={originalityConfirmed}
                  onCheckedChange={(c) => setOriginalityConfirmed(!!c)}
                />
                <label htmlFor="originality" className="text-sm cursor-pointer">
                  Based on real experience, examples, or verified sources
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="accuracy"
                  checked={accuracyConfirmed}
                  onCheckedChange={(c) => setAccuracyConfirmed(!!c)}
                />
                <label htmlFor="accuracy" className="text-sm cursor-pointer">
                  Dates, tools, and claims are updated and accurate
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="noFiller"
                  checked={noFillerConfirmed}
                  onCheckedChange={(c) => setNoFillerConfirmed(!!c)}
                />
                <label htmlFor="noFiller" className="text-sm cursor-pointer">
                  No filler content or AI fluff
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Publish Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {validation.valid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Ready to publish</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">{validation.errors.length} issue(s) to fix</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => savePost(false)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
                </Button>
              </div>
              
              {postId && status === "published" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`/blog/${generateSlug(title, primaryKeyword)}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Post
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}