import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Building2, AlertCircle, RefreshCw, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResources, Resource } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import { trackTabView, trackResourceClick } from "@/lib/analytics";


interface OrganizationsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

export default function OrganizationsTab({ onAnalyticsEvent }: OrganizationsTabProps) {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');

  // Track tab view on mount
  useEffect(() => {
    trackTabView('organizations');
    onAnalyticsEvent?.('tab_view', { tab: 'organizations' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error, refetch } = useResources({
    type: 'organizations',
    query: searchQuery,
    enabled: true
  });

  const organizations = data?.items || [];
  const totalCount = data?.total || 0;


  // Handle organization website click
  const handleWebsiteClick = useCallback((organization: Resource) => {
    // Track analytics
    trackResourceClick(organization.id, 'organization', organization.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: organization.id,
      resource_type: 'organization',
      resource_title: organization.title
    });
    
    const website = organization.data?.urls?.site || organization.url;
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  }, [onAnalyticsEvent]);

  // Retry function for errors
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div 
      role="tabpanel" 
      id="organizations-panel" 
      aria-labelledby="organizations-tab"
      className="space-y-6"
    >
      {/* Search */}
      <div className="max-w-md">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search organizations by name..."
          resources={organizations}
          resourceType="organizations"
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? 'organization' : 'organizations'} found
          {searchQuery.trim() ? ' (filtered)' : ''}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load organizations. Please try again.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Organizations List */}
      {!isLoading && !error && organizations.length > 0 && (
        <div className="space-y-4">
          {organizations.map((organization) => {
            const description = organization.data?.description || organization.summary;
            const website = organization.data?.urls?.site || organization.url;
            const logoUrl = organization.data?.logoUrl;
            
            return (
              <Card key={organization.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {logoUrl ? (
                        <img 
                          src={logoUrl}
                          alt={`${organization.title} logo`}
                          className="h-12 w-12 object-contain rounded border"
                          onError={(e) => {
                            // Fallback to default icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "h-12 w-12 bg-gray-100 rounded border flex items-center justify-center",
                        logoUrl ? "hidden" : "flex"
                      )}>
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                        {organization.title}
                      </h3>
                      
                      {description && (
                        <p className="text-gray-700 mb-4 leading-relaxed break-words">
                          {description}
                        </p>
                      )}
                      
                      {website && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWebsiteClick(organization)}
                          className="inline-flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery.trim()
              ? "Try adjusting your search to find more results."
              : "No organizations are currently available."}
          </p>
          {searchQuery.trim() && (
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

    </div>
  );
}