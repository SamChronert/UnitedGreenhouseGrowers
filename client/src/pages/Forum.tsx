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
  Send
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import type { ForumPost, ForumComment, User as UserType, Profile } from "@shared/schema";

type PostWithDetails = ForumPost & { 
  user: UserType & { profile: Profile };
  comments: (ForumComment & { user: UserType & { profile: Profile } })[];
  commentCount: number;
};

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch forum posts with search
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/forum/posts", searchQuery],
    queryFn: async () => {
      const searchParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      return apiRequest("GET", `/api/forum/posts${searchParam}`);
    },
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: (postData: { title: string; content: string }) =>
      apiRequest("POST", "/api/forum/posts", postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setNewPost({ title: "", content: "" });
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

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      apiRequest("POST", `/api/forum/posts/${postId}/comments`, { content }),
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

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const handleCreateComment = (postId: string) => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ postId, content: newComment });
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search posts by topic, keywords, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="Share your question, experience, or knowledge..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending ? "Creating..." : "Create Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                      <AvatarFallback>
                        {post.user.profile?.name?.[0] || post.user.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span>{post.user.profile?.name || post.user.username}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
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
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <User className="h-4 w-4" />
                      <span>{selectedPost.user.profile?.name || selectedPost.user.username}</span>
                      <span>•</span>
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(selectedPost.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
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
                      <AvatarFallback>
                        {user?.profile?.name?.[0] || user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateComment(selectedPost.id)}
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleCreateComment(selectedPost.id)}
                        disabled={createCommentMutation.isPending || !newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {selectedPost.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.user.profile?.name?.[0] || comment.user.username?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.user.profile?.name || comment.user.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
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