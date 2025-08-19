import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Book, ArrowLeft } from "lucide-react";
import ResourceCard from "@/components/resources/ResourceCard";
import EmptyState from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";

interface SavedResource {
  id: number;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource: {
    id: string;
    title: string;
    url: string;
    tags: string[];
    type?: string;
    summary?: string;
    topics?: string[];
    crop?: string[];
    system_type?: string[];
    region?: string;
    cost?: string;
    ugga_verified?: boolean;
    quality_score?: number;
    has_location: boolean;
  };
}

interface SavedResourcesResponse {
  items: SavedResource[];
  total: number;
}

export default function SavedResources() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<SavedResourcesResponse>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const handleToggleFavorite = async (resourceId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${resourceId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } else {
        await fetch(`/api/favorites/${resourceId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
      // Refetch favorites after toggle
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleOpenResource = (resourceId: string) => {
    window.open(`/dashboard/resources/${resourceId}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Please log in to view your saved resources.</p>
            <Link href="/login">
              <Button className="mt-4">Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-sm bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-800">Failed to load saved resources. Please try again.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const savedResources = data?.items || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/resources">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Library
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-ugga-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Saved Resources</h1>
            </div>
            <p className="text-gray-700">
              Resources you've saved for future reference. You have {savedResources.length} saved resource{savedResources.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Content */}
          {savedResources.length === 0 ? (
            <EmptyState
              title="No saved resources yet"
              body="Browse the resource library and save items you'd like to reference later."
              icon={<Book className="h-10 w-10 text-gray-400" />}
              ctaText="Browse Resource Library"
              onCtaClick={() => window.location.href = '/dashboard/resources'}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResources.map((savedResource) => (
                <ResourceCard
                  key={savedResource.resource.id}
                  resource={savedResource.resource}
                  onToggleFavorite={handleToggleFavorite}
                  onOpen={handleOpenResource}
                  isFavorited={true} // All items on this page are favorited
                  showBadges={true}
                />
              ))}
            </div>
          )}

          {/* Footer info */}
          {savedResources.length > 0 && (
            <div className="mt-12 text-center text-gray-600 text-sm">
              <p>
                Saved resources are stored in your account and will persist across sessions.
                Use the heart icon on any resource to add or remove it from this list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}