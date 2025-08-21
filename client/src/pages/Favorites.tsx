import { Heart, BookOpen, MessageCircle, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          Your Favorites
        </h1>
        <p className="text-gray-600 mt-2">
          Keep track of your saved resources, forum posts, products, and grower connections.
        </p>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start exploring the platform and save your favorite resources, forum discussions, products, and grower profiles for quick access later.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card className="border-dashed border-2 border-gray-200 hover:border-ugga-primary/50 transition-colors">
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <CardTitle className="text-sm">Resources</CardTitle>
              <CardDescription className="text-xs">
                Save helpful guides, articles, and educational content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-dashed border-2 border-gray-200 hover:border-ugga-primary/50 transition-colors">
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <CardTitle className="text-sm">Forum Posts</CardTitle>
              <CardDescription className="text-xs">
                Bookmark important discussions and conversations
              </CardDescription>
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
          <p className="text-sm text-gray-500">
            <strong>Pro tip:</strong> Look for the heart icon (<Heart className="inline h-4 w-4 text-red-500" />) throughout the platform to save items to your favorites.
          </p>
        </div>
      </div>

      {/* Future: When there are favorites, show them here */}
      {/* 
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Saved Resources
            <Badge variant="secondary">3</Badge>
          </h2>
          // List of saved resources
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Bookmarked Discussions
            <Badge variant="secondary">5</Badge>
          </h2>
          // List of saved forum posts
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Saved Products
            <Badge variant="secondary">2</Badge>
          </h2>
          // List of saved products
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Following
            <Badge variant="secondary">8</Badge>
          </h2>
          // List of followed growers
        </section>
      </div>
      */}
    </div>
  );
}