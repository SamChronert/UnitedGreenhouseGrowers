import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Building2, AlertCircle, RefreshCw, Globe, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useResources, Resource, ResourceFilters } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import { trackTabView, trackResourceClick } from "@/lib/analytics";
import { useParamState } from "@/hooks/useQueryParams";


interface OrganizationsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const ORG_TYPES = [
  'University/Research',
  'Industry Association',
  'Government Agency',
  'Non-Profit',
  'Commercial'
];

const REGIONS = [
  'North America',
  'Europe',
  'Asia',
  'Global',
  'Other'
];

const FOCUS_AREAS = [
  'Research',
  'Education',
  'Industry Support',
  'Policy/Regulation',
  'Trade'
];

export default function OrganizationsTab({ onAnalyticsEvent }: OrganizationsTabProps) {
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    orgType: 'all',
    region: 'all',
    focusArea: 'all'
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('organizations');
    onAnalyticsEvent?.('tab_view', { tab: 'organizations' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error, refetch } = useResources({
    type: 'organizations',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
    enabled: true
  });

  const organizations = data?.items || [];
  const totalCount = data?.total || 0;


  // Handle organization click for modal
  const handleOrganizationClick = useCallback((organization: Resource) => {
    setSelectedResource(organization);
    setResourceModalOpen(true);
    trackResourceClick(organization.id, 'organization', organization.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: organization.id,
      resource_type: 'organization',
      resource_title: organization.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setResourceModalOpen(false);
    setSelectedResource(null);
  }, []);

  // Handle external link click from modal
  const handleExternalLinkClick = useCallback((organization: Resource) => {
    const website = organization.data?.urls?.site || organization.url;
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
      onAnalyticsEvent?.('organization_external_click', {
        resource_id: organization.id,
        resource_type: 'organization',
        resource_title: organization.title
      });
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

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search organizations by name..."
            resources={organizations}
            resourceType="organizations"
            className="max-w-md"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.orgType}
            onValueChange={(value) => setFilters(prev => ({ ...prev, orgType: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Organization Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ORG_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.region}
            onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {REGIONS.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.focusArea}
            onValueChange={(value) => setFilters(prev => ({ ...prev, focusArea: value }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Focus Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Focus Areas</SelectItem>
              {FOCUS_AREAS.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Organizations Content */}
      {!isLoading && !error && organizations.length > 0 && (
        <div className="space-y-4">
          {organizations.map((organization) => {
            const description = organization.data?.description || organization.summary;
            const website = organization.data?.urls?.site || organization.url;
            const logoUrl = organization.data?.logoUrl;
            const orgType = organization.data?.orgType;
            const region = organization.data?.region;
            const focusArea = organization.data?.focusArea;
            
            return (
              <Card key={organization.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOrganizationClick(organization)}>
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
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "h-12 w-12 bg-purple-100 rounded border flex items-center justify-center",
                        logoUrl ? "hidden" : "flex"
                      )}>
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 break-words">
                          {organization.title}
                        </h3>
                        {website && <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {orgType && (
                          <Badge variant="outline" className="text-xs">
                            {orgType}
                          </Badge>
                        )}
                        {region && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{region}</span>
                          </div>
                        )}
                        {focusArea && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{focusArea}</span>
                          </div>
                        )}
                      </div>
                      
                      {description && (
                        <p className="text-gray-700 mb-4 leading-relaxed break-words">
                          {description}
                        </p>
                      )}
                      
                      {website && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExternalLinkClick(organization);
                          }}
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

      {/* Organization Details Modal */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-2xl z-[1000]">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-purple-600" />
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {selectedResource.data?.orgType && (
                    <Badge variant="outline">
                      {selectedResource.data.orgType}
                    </Badge>
                  )}
                  {selectedResource.data?.region && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedResource.data.region}
                    </Badge>
                  )}
                  {selectedResource.data?.focusArea && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedResource.data.focusArea}
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">
                    {selectedResource.data?.description || selectedResource.summary || 'No description available.'}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {(selectedResource.data?.urls?.site || selectedResource.url) && (
                    <Button 
                      onClick={() => handleExternalLinkClick(selectedResource)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}