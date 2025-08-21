import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Clock,
  User,
  TrendingUp,
  Flame,
  MoreVertical,
  Edit,
  Trash2
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

type PostWithDetails = ForumPost & { 
  user: UserType & { profile: Profile };
  comments: (ForumComment & { user: UserType & { profile: Profile } })[];
  commentCount: number;
};

type SortType = 'hot' | 'new' | 'top-day' | 'top-week' | 'top-month' | 'top-all';

const categoryColors: Record<string, string> = {
  "Bulk Ordering": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Plant Health Management": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Greenhouse Systems Management": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Operations": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [editingPost, setEditingPost] = useState<PostWithDetails | null>(null);
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch forum posts with filters
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/forum/posts", searchQuery, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      const queryString = params.toString();
      return apiRequest("GET", `/api/forum/posts${queryString ? `?${queryString}` : ''}`);
    },
  });

  // Sort posts based on selected sort type
  const sortedPosts = posts.sort((a: PostWithDetails, b: PostWithDetails) => {
    switch (sortBy) {
      case 'hot':
        // Score with time decay (Reddit-like hot algorithm simplified)
        const aScore = a.score / (1 + Math.pow((Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60), 2));
        const bScore = b.score / (1 + Math.pow((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60), 2));
        return bScore - aScore;
      case 'new':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'top-day':
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const aInDay = new Date(a.createdAt).getTime() > dayAgo;
        const bInDay = new Date(b.createdAt).getTime() > dayAgo;
        if (aInDay && bInDay) return b.score - a.score;
        if (aInDay) return -1;
        if (bInDay) return 1;
        return 0;
      case 'top-week':
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const aInWeek = new Date(a.createdAt).getTime() > weekAgo;
        const bInWeek = new Date(b.createdAt).getTime() > weekAgo;
        if (aInWeek && bInWeek) return b.score - a.score;
        if (aInWeek) return -1;
        if (bInWeek) return 1;
        return 0;
      case 'top-month':
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const aInMonth = new Date(a.createdAt).getTime() > monthAgo;
        const bInMonth = new Date(b.createdAt).getTime() > monthAgo;
        if (aInMonth && bInMonth) return b.score - a.score;
        if (aInMonth) return -1;
        if (bInMonth) return 1;
        return 0;
      case 'top-all':
        return b.score - a.score;
      default:
        return 0;
    }
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
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Member Forum</h1>
                <p className="text-gray-600 dark:text-gray-400">Connect with fellow growers and share knowledge</p>
              </div>
            </div>
            <Button onClick={() => setShowCreatePost(true)} className="bg-orange-500 hover:bg-orange-600">
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
            
            <div className="flex gap-4 items-center">
              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortType)} className="flex-1">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="hot" className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    Hot
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    New
                  </TabsTrigger>
                  <TabsTrigger value="top-day">Top Day</TabsTrigger>
                  <TabsTrigger value="top-week">Top Week</TabsTrigger>
                  <TabsTrigger value="top-all">Top All</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(ForumCategory).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <Card className="mb-6 border-orange-200 dark:border-orange-800">
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
                        <span>Share</span>
                        <span>Save</span>
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