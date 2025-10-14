import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useDemo } from "@/contexts/DemoContext";
import { 
  Search, 
  FolderOpen, 
  Newspaper, 
  MessageCircle, 
  ShoppingBag,
  Loader2,
  ArrowRight
} from "lucide-react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResults {
  query: string;
  results: {
    resources: any[];
    blog: any[];
    forum: any[];
    products: any[];
  };
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { isDemo, showDemoAction } = useDemo();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const hasResults = searchResults && (
    searchResults.results.resources.length > 0 ||
    searchResults.results.blog.length > 0 ||
    searchResults.results.forum.length > 0 ||
    searchResults.results.products.length > 0
  );

  const handleLinkClick = (href: string) => {
    if (isDemo && !href.startsWith("/demo")) {
      showDemoAction();
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Smart Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for resources, articles, discussions, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
              data-testid="input-search-query"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {isLoading && debouncedQuery && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}

            {!isLoading && debouncedQuery && !hasResults && (
              <div className="text-center py-8 text-gray-500">
                No results found for "{debouncedQuery}". Try different keywords.
              </div>
            )}

            {!debouncedQuery && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Try searching for:</p>
                <ul className="text-sm space-y-1">
                  <li>"tomato pest management"</li>
                  <li>"universities offering greenhouse courses"</li>
                  <li>"grants for hydroponic systems"</li>
                  <li>"irrigation discussion"</li>
                </ul>
              </div>
            )}

            {/* Resources Results */}
            {searchResults && searchResults.results.resources.length > 0 && (
              <div className="space-y-3" data-testid="section-resources-results">
                <div className="flex items-center gap-2 text-orange-600">
                  <FolderOpen className="h-4 w-4" />
                  <h3 className="font-semibold">Resources</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.results.resources.map((resource: any) => (
                    <Link
                      key={resource.id}
                      href={isDemo ? `/demo/resources` : `/dashboard/resources`}
                      onClick={() => handleLinkClick(isDemo ? `/demo/resources` : `/dashboard/resources`)}
                    >
                      <div 
                        className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors"
                        data-testid={`result-resource-${resource.id}`}
                      >
                        <h4 className="font-medium text-gray-900">{resource.title}</h4>
                        {resource.type && (
                          <span className="text-xs text-orange-600 mt-1 inline-block capitalize">
                            {resource.type.replace('_', ' ')}
                          </span>
                        )}
                        {resource.summary && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.summary}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Blog Results */}
            {searchResults && searchResults.results.blog.length > 0 && (
              <div className="space-y-3" data-testid="section-blog-results">
                <div className="flex items-center gap-2 text-purple-600">
                  <Newspaper className="h-4 w-4" />
                  <h3 className="font-semibold">Blog Posts</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.results.blog.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      onClick={() => handleLinkClick(`/blog/${post.slug}`)}
                    >
                      <div 
                        className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
                        data-testid={`result-blog-${post.id}`}
                      >
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-xs text-purple-600 mt-1">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Results */}
            {searchResults && searchResults.results.forum.length > 0 && (
              <div className="space-y-3" data-testid="section-forum-results">
                <div className="flex items-center gap-2 text-blue-600">
                  <MessageCircle className="h-4 w-4" />
                  <h3 className="font-semibold">Forum Discussions</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.results.forum.map((post: any) => (
                    <Link
                      key={post.id}
                      href={isDemo ? `/demo/forum` : `/dashboard/forum`}
                      onClick={() => handleLinkClick(isDemo ? `/demo/forum` : `/dashboard/forum`)}
                    >
                      <div 
                        className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                        data-testid={`result-forum-${post.id}`}
                      >
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-blue-600">
                          <span>{post.category}</span>
                          {post.user?.profile?.name && (
                            <span>• by {post.user.profile.name}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {searchResults && searchResults.results.products.length > 0 && (
              <div className="space-y-3" data-testid="section-products-results">
                <div className="flex items-center gap-2 text-pink-600">
                  <ShoppingBag className="h-4 w-4" />
                  <h3 className="font-semibold">Products</h3>
                </div>
                <div className="space-y-2">
                  {searchResults.results.products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={isDemo ? `/demo/producthub` : `/dashboard/producthub`}
                      onClick={() => handleLinkClick(isDemo ? `/demo/producthub` : `/dashboard/producthub`)}
                    >
                      <div 
                        className="p-3 bg-pink-50 hover:bg-pink-100 rounded-lg cursor-pointer transition-colors"
                        data-testid={`result-product-${product.id}`}
                      >
                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-pink-600">
                          <span>{product.category}</span>
                          <span>• {product.vendorName}</span>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
