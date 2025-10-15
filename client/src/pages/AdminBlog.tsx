import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type BlogPost } from "@shared/schema";
import { Plus, Edit, Trash2, Search, Loader2, Calendar, Upload as UploadIcon } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

export default function AdminBlog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    contentHtml: "",
    headerImageUrl: ""
  });
  const [isHeaderImageUploading, setIsHeaderImageUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; slug: string; contentHtml?: string; headerImageUrl?: string }) =>
      apiRequest("POST", "/api/admin/blog", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Blog post created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blog post.",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; slug: string; contentHtml?: string; headerImageUrl?: string } }) =>
      apiRequest("PUT", `/api/admin/blog/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setEditingPost(null);
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Blog post updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update blog post.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.contentMd?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (post.contentHtml?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  ) || [];

  const resetForm = () => {
    setFormData({ title: "", slug: "", contentHtml: "", headerImageUrl: "" });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.contentHtml) {
      toast({
        title: "Error",
        description: "Title, slug, and content are required.",
        variant: "destructive",
      });
      return;
    }

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      contentHtml: post.contentHtml || "",
      headerImageUrl: post.headerImageUrl || ""
    });
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsHeaderImageUploading(true);
      
      // Get upload URL
      const { uploadURL } = await apiRequest('POST', '/api/blog-images/upload');
      
      // Upload image
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Extract the image ID from the signed GCS URL and normalize it
      // GCS signed URLs have format: /storage/v1/b/{bucket}/o/{path}
      const url = new URL(uploadURL);
      const pathname = url.pathname;
      
      // Extract the object path from /storage/v1/b/{bucket}/o/{encodedPath}
      const objectPathMatch = pathname.match(/\/o\/(.+)/);
      if (!objectPathMatch) {
        throw new Error('Invalid upload URL format');
      }
      
      // Decode the percent-encoded path
      const decodedPath = decodeURIComponent(objectPathMatch[1]);
      
      // Extract just the image ID (everything after /blog-images/)
      const imageIdMatch = decodedPath.match(/blog-images\/(.+)/);
      const imageId = imageIdMatch ? imageIdMatch[1] : decodedPath.split('/').pop();
      const normalizedPath = `/blog-images/${imageId}`;
      
      // Update form data with normalized image path
      setFormData(prev => ({ ...prev, headerImageUrl: normalizedPath }));
      
      toast({
        title: "Success",
        description: "Header image uploaded successfully.",
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload header image.",
        variant: "destructive",
      });
    } finally {
      setIsHeaderImageUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
            <p className="text-gray-600">Create, edit, and publish blog content</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingPost(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                      data-testid="input-slug"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="header-image">Header Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="header-image"
                      type="file"
                      accept="image/*"
                      onChange={handleHeaderImageUpload}
                      disabled={isHeaderImageUploading}
                      data-testid="input-header-image"
                    />
                    {isHeaderImageUploading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {formData.headerImageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.headerImageUrl} 
                        alt="Header preview" 
                        className="max-w-xs h-32 object-cover rounded border"
                        data-testid="img-header-preview"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <RichTextEditor
                    content={formData.contentHtml}
                    onChange={(html) => setFormData(prev => ({ ...prev, contentHtml: html }))}
                    placeholder="Write your blog post content..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingPost(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {createPostMutation.isPending || updatePostMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {editingPost ? "Update Post" : "Publish Post"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No blog posts found matching your search." : "No blog posts available."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">{post.title}</div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-gray-500 truncate">{post.slug}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            Published
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEdit(post);
                                setIsCreateOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletePostMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
