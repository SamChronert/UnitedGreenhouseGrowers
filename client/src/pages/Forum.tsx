import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical,
  Edit,
  Trash2,
  Share,
  Bookmark
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { ForumPost, ForumComment, User as UserType, Profile } from "@shared/schema";
import PostEditor from "@/components/PostEditor";
import Comment from "@/components/Comment";
import VoteButtons from "@/components/VoteButtons";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ForumCategory } from "@shared/schema";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ForumFilters from "@/components/ForumFilters";

type PostWithDetails = ForumPost & { 
  user: UserType & { profile: Profile };
  comments: (ForumComment & { user: UserType & { profile: Profile } })[];
  commentCount: number;
};


const categoryColors: Record<string, string> = {
  "Bulk Ordering": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Plant Health Management": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Greenhouse Systems Management": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Operations": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [editingPost, setEditingPost] = useState<PostWithDetails | null>(null);
  const [filters, setFilters] = useState({ region: "", category: "" });
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's saved posts
  const { data: favoritesData } = useQuery<{ favorites: string[] }>({
    queryKey: ["/api/forum/favorites"],
    enabled: !!user,
  });

  // Update saved posts when favorites data changes
  useEffect(() => {
    if (favoritesData && 'favorites' in favoritesData && Array.isArray(favoritesData.favorites)) {
      setSavedPosts(new Set(favoritesData.favorites));
    }
  }, [favoritesData]);

  // Fetch forum posts with filters
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/forum/posts", searchQuery, filters.category, filters.region],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.region) params.append('region', filters.region);
      const queryString = params.toString();
      return apiRequest("GET", `/api/forum/posts${queryString ? `?${queryString}` : ''}`);
    },
  });

  // Sort posts by newest first (default sorting)
  const sortedPosts = posts.sort((a: PostWithDetails, b: PostWithDetails) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: { title: string; content: string; category: string; attachments: string[] }) =>
      apiRequest("POST", "/api/forum/posts", postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setShowCreatePost(false);
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit post mutation
  const editPostMutation = useMutation({
    mutationFn: ({ id, ...postData }: { id: string; title: string; content: string; category: string; attachments: string[] }) =>
      apiRequest("PUT", `/api/forum/posts/${id}`, postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Your post has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest("DELETE", `/api/forum/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({
        title: "Success",
        description: "Your post has been deleted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = (postData: { title: string; content: string; category: string; attachments: string[] }) => {
    createPostMutation.mutate(postData);
  };

  const handleEditPost = (postData: { title: string; content: string; category: string; attachments: string[] }) => {
    if (editingPost) {
      editPostMutation.mutate({ id: editingPost.id, ...postData });
    }
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: (postId: string) =>
      apiRequest("POST", `/api/forum/posts/${postId}/favorite`),
    onSuccess: (data, postId) => {
      const newSavedPosts = new Set(savedPosts);
      if (data.isFavorited) {
        newSavedPosts.add(postId);
        toast({
          title: "Saved!",
          description: "Post saved to your collection",
        });
      } else {
        newSavedPosts.delete(postId);
        toast({
          title: "Unsaved",
          description: "Post removed from your collection",
        });
      }
      setSavedPosts(newSavedPosts);
      queryClient.invalidateQueries({ queryKey: ["/api/forum/favorites"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSavePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    savePostMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 flex flex-col items-center space-y-1">
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Member Forum</h1>
                <p className="text-gray-600 dark:text-gray-400">Connect with fellow growers and share knowledge</p>
              </div>
            </div>
            <Button onClick={() => setShowCreatePost(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <ForumFilters filters={filters} setFilters={setFilters} />
          </div>
        </div>

        {/* Create/Edit Post Modal */}
        {showCreatePost && (
          <PostEditor
            onSave={handleCreatePost}
            onCancel={() => setShowCreatePost(false)}
            isLoading={createPostMutation.isPending}
          />
        )}
        
        {editingPost && (
          <PostEditor
            post={editingPost}
            onSave={handleEditPost}
            onCancel={() => setEditingPost(null)}
            isLoading={editPostMutation.isPending}
          />
        )}

        {/* Selected Post Detail View */}
        {selectedPost && (
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <VoteButtons 
                  entityType="post" 
                  entityId={selectedPost.id} 
                  score={selectedPost.score}
                  className="pt-2"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge className={categoryColors[selectedPost.category] || categoryColors["Other"]} variant="secondary">
                        {selectedPost.category}
                      </Badge>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">{selectedPost.title}</h1>
                    </div>
                    <div className="flex gap-2">
                      {user?.id === selectedPost.userId && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPost(selectedPost)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePost(selectedPost.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedPost(null)}>
                        ✕
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.user.profile?.name || selectedPost.user.username}`} />
                      <AvatarFallback>{selectedPost.user.profile?.name?.[0] || selectedPost.user.username?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span>u/{selectedPost.user.profile?.name || selectedPost.user.username}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  <MarkdownRenderer content={selectedPost.content} />
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-4">{selectedPost.commentCount} Comments</h3>
                    <div className="space-y-4">
                      {selectedPost.comments.map(comment => (
                        <Comment key={comment.id} comment={comment} postId={selectedPost.id} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forum Posts List */}
        <div className="space-y-3">
          {!Array.isArray(sortedPosts) || sortedPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Be the first to start a conversation in the forum!
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedPosts.map((post: PostWithDetails) => (
              <Card key={post.id} className="hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedPost(post)}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <VoteButtons 
                      entityType="post" 
                      entityId={post.id} 
                      score={post.score}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className={categoryColors[post.category] || categoryColors["Other"]} variant="secondary">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>u/{post.user.profile?.name || post.user.username}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        </div>
                        {user?.id === post.userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingPost(post); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-2">
                        <MarkdownRenderer content={post.content} />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{post.commentCount} comments</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-auto text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(window.location.origin + '/forum?post=' + post.id);
                            toast({ title: "Link copied!", description: "Post link copied to clipboard" });
                          }}
                        >
                          <Share className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`p-0 h-auto text-xs transition-colors ${
                            savedPosts.has(post.id) 
                              ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' 
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                          }`}
                          onClick={(e) => handleSavePost(post.id, e)}
                          disabled={savePostMutation.isPending}
                        >
                          <Bookmark className={`h-3 w-3 mr-1 ${
                            savedPosts.has(post.id) ? 'fill-current' : ''
                          }`} />
                          {savedPosts.has(post.id) ? 'Saved' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}