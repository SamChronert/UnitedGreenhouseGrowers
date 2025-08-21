import { useState } from "react";
import { Heart, BookOpen, MessageCircle, ShoppingBag, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import type { ForumPost, User as UserType, Profile } from "@shared/schema";

type PostWithUser = ForumPost & { 
  user: UserType & { profile: Profile };
  commentCount: number;
};

export default function Favorites() {
  const [activeTab, setActiveTab] = useState("resources");
  const { user } = useAuth();

  // Fetch user's saved forum posts
  const { data: favoritesData } = useQuery<{ favorites: string[] }>({
    queryKey: ["/api/forum/favorites"],
    enabled: !!user,
  });

  // Fetch all forum posts to filter favorites
  const { data: allPosts = [] } = useQuery<PostWithUser[]>({
    queryKey: ["/api/forum/posts"],
    enabled: !!user && !!favoritesData?.favorites?.length,
  });

  // Filter posts to show only favorited ones
  const favoritePosts = allPosts.filter(post => 
    favoritesData?.favorites?.includes(post.id)
  );

  const hasAnyFavorites = favoritePosts.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          Your Favorites
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Keep track of your saved resources, forum posts, products, and grower connections.
        </p>
      </div>

      {!hasAnyFavorites ? (
        <>
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring the platform and save your favorite resources, forum discussions, products, and grower profiles for quick access later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card 
                className={`cursor-pointer transition-colors ${
                  activeTab === "resources" 
                    ? "border-ugga-primary bg-ugga-primary/5" 
                    : "border-dashed border-2 border-gray-200 hover:border-ugga-primary/50"
                }`}
                onClick={() => setActiveTab("resources")}
              >
                <CardHeader className="text-center">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <CardTitle className="text-sm">Resources</CardTitle>
                  <CardDescription className="text-xs">
                    Save helpful guides, articles, and educational content
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  activeTab === "forum" 
                    ? "border-ugga-primary bg-ugga-primary/5" 
                    : "border-dashed border-2 border-gray-200 hover:border-ugga-primary/50"
                }`}
                onClick={() => setActiveTab("forum")}
              >
                <CardHeader className="text-center">
                  <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <CardTitle className="text-sm">Forum Posts</CardTitle>
                  <CardDescription className="text-xs">
                    Bookmark important discussions and conversations
                  </CardDescription>
                  {favoritePosts.length > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      {favoritePosts.length} saved
                    </Badge>
                  )}
                </CardHeader>
              </Card>

              <Card className="border-dashed border-2 border-gray-200 hover:border-ugga-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <ShoppingBag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <CardTitle className="text-sm">Products</CardTitle>
                  <CardDescription className="text-xs">
                    Keep track of products and services you're interested in
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-dashed border-2 border-gray-200 hover:border-ugga-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <CardTitle className="text-sm">Growers</CardTitle>
                  <CardDescription className="text-xs">
                    Connect with and follow other growers in your area
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-8 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Pro tip:</strong> Look for the heart icon (<Heart className="inline h-4 w-4 text-red-500" />) throughout the platform to save items to your favorites.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("resources")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "resources"
                    ? "border-ugga-primary text-ugga-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Resources
              </button>
              <button
                onClick={() => setActiveTab("forum")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "forum"
                    ? "border-ugga-primary text-ugga-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Forum Posts
                {favoritePosts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {favoritePosts.length}
                  </Badge>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No saved resources yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start exploring our resource library to save helpful content!
                </p>
                <Button onClick={() => window.location.href = '/resources'}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Resources
                </Button>
              </div>
            </div>
          )}

          {activeTab === "forum" && (
            <div className="space-y-4">
              {favoritePosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No saved forum posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Save interesting discussions from the member forum!
                  </p>
                  <Button onClick={() => window.location.href = '/forum'}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Visit Forum
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoritePosts.map(post => (
                    <Card key={post.id} className="hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/forum?post=${post.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>by {post.user.profile?.name || post.user.username}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{post.commentCount || 0} comments</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 fill-current text-red-500" />
                                <span>Saved</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}