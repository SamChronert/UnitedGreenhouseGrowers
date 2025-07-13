import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Upload,
  Calendar,
  User,
  Tag,
  Send,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { ForumPost, ForumComment, User as UserType, Profile } from "@shared/schema";
import ForumFilters from "@/components/ForumFilters";
import PostEditor from "@/components/PostEditor";
import Comment from "@/components/Comment";
import { ForumCategory } from "@shared/schema";

type PostWithDetails = ForumPost & { 
  user: UserType & { profile: Profile };
  comments: (ForumComment & { user: UserType & { profile: Profile } })[];
  commentCount: number;
};

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [editingPost, setEditingPost] = useState<PostWithDetails | null>(null);
  const [newComment, setNewComment] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    county: "",
    category: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch forum posts with filters
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/forum/posts", searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.state) params.append('state', filters.state);
      if (filters.county) params.append('county', filters.county);
      if (filters.category) params.append('category', filters.category);
      const queryString = params.toString();
      return apiRequest("GET", `/api/forum/posts${queryString ? `?${queryString}` : ''}`);
    },
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

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ postId, content, attachments }: { postId: string; content: string; attachments?: string[] }) =>
      apiRequest("POST", `/api/forum/posts/${postId}/comments`, { content, attachments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Your comment has been added!",
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
    if (!editingPost) return;
    editPostMutation.mutate({ id: editingPost.id, ...postData });
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }
    createCommentMutation.mutate({ postId, content: newComment, attachments: [] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ugga-secondary rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Member Forum</h1>
                <p className="text-gray-600">Connect with fellow growers and share knowledge</p>
              </div>
            </div>
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search posts by topic, keywords, or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ForumFilters 
              filters={filters}
              setFilters={setFilters}
            />
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

        {/* Forum Posts */}
        <div className="space-y-4">
          {!Array.isArray(posts) || posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a conversation in the forum!
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            Array.isArray(posts) && posts.map((post: PostWithDetails) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.user.profile?.name || post.user.username}`} />
                      <AvatarFallback>
                        {post.user.profile?.name?.[0] || post.user.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          {post.category && (
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                        {user?.id === post.userId && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>{post.user.profile?.name || post.user.username}</span>
                        <span>•</span>
                        <span>{post.user.profile?.state}</span>
                        {post.user.profile?.county && (
                          <>
                            <span>•</span>
                            <span>{post.user.profile.county}</span>
                          </>
                        )}
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                        {post.editedAt && (
                          <>
                            <span>•</span>
                            <Edit className="h-3 w-3" />
                            <span>Edited</span>
                          </>
                        )}
                        <span>•</span>
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.commentCount || 0} comments</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedPost(post)}
                      >
                        View Discussion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.user.profile?.name || selectedPost.user.username}`} />
                        <AvatarFallback>
                          {selectedPost.user.profile?.name?.[0] || selectedPost.user.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {selectedPost.user.profile?.name || selectedPost.user.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {selectedPost.user.profile?.state}
                        {selectedPost.user.profile?.county && `, ${selectedPost.user.profile.county}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {format(new Date(selectedPost.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      {selectedPost.editedAt && (
                        <span className="text-sm text-gray-500 italic flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Edited · {format(new Date(selectedPost.editedAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPost(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">
                    Comments ({selectedPost.comments?.length || 0})
                  </h4>
                  
                  {/* Add Comment */}
                  <div className="flex gap-3 mb-6">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.profile?.name || user?.username}`} />
                      <AvatarFallback>
                        {user?.profile?.name?.[0] || user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <Button 
                        onClick={() => handleAddComment(selectedPost.id)}
                        disabled={createCommentMutation.isPending || !newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-0">
                    {selectedPost.comments?.map((comment) => (
                      <Comment 
                        key={comment.id} 
                        comment={comment} 
                        postId={selectedPost.id}
                      />
                    ))}
                    
                    {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                      <p className="text-gray-500 text-center py-4">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
