import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, MapPin, Building2, AlertCircle, RefreshCw } from "lucide-react";
import { useResources, Resource, ResourceFilters } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import FilterBar from "@/components/FilterBar";
import GroupedSection from "@/components/GroupedSection";
import { trackTabView, trackResourceClick } from "@/lib/analytics";

// Organization function groups
const ORGANIZATION_FUNCTIONS = [
  'Associations & Policy',
  'Standards & Tools', 
  'Research & Education',
  'Technology & Innovation',
  'Market & Distribution'
];

interface OrganizationsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

export default function OrganizationsTab({ onAnalyticsEvent }: OrganizationsTabProps) {
  // URL state management
  const [location, setLocation] = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  const [filters, setFilters] = useState<ResourceFilters>(() => {
    const filtersParam = urlParams.get('filters');
    return filtersParam ? JSON.parse(filtersParam) : {};
  });
  const [sort, setSort] = useState(urlParams.get('sort') || 'relevance');
  const [selectedOrganization, setSelectedOrganization] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Section expanded state - persist in localStorage
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ugga-org-sections-expanded');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // If parsing fails, default to first section expanded
        return { [ORGANIZATION_FUNCTIONS[0]]: true };
      }
    }
    // Default: expand first section
    return { [ORGANIZATION_FUNCTIONS[0]]: true };
  });

  // Track tab view on mount
  useEffect(() => {
    trackTabView('organizations');
    onAnalyticsEvent?.('tab_view', { tab: 'organizations' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error, refetch } = useResources({
    type: 'organizations',
    query: searchQuery,
    filters,
    sort: sort as any,
    enabled: true
  });

  const organizations = data?.items || [];
  const totalCount = data?.total || 0;

  // Group organizations by function
  const groupedOrganizations = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    
    // Initialize all groups
    ORGANIZATION_FUNCTIONS.forEach(func => {
      groups[func] = [];
    });
    
    // Group organizations by their primary function
    organizations.forEach(org => {
      const functions = org.data?.functions || [];
      const primaryFunction = functions[0];
      
      if (primaryFunction && groups[primaryFunction]) {
        groups[primaryFunction].push(org);
      } else {
        // If no valid primary function, add to first group as fallback
        groups[ORGANIZATION_FUNCTIONS[0]].push(org);
      }
    });
    
    return groups;
  }, [organizations]);

  // Update URL when filters/search change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    if (Object.keys(filters).length > 0) {
      params.set('filters', JSON.stringify(filters));
    }
    
    if (sort !== 'relevance') {
      params.set('sort', sort);
    }
    
    const newSearch = params.toString();
    const basePath = location.split('?')[0];
    const newLocation = newSearch ? `${basePath}?${newSearch}` : basePath;
    
    if (newLocation !== location) {
      setLocation(newLocation);
    }
  }, [searchQuery, filters, sort, location, setLocation]);

  // Save expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem('ugga-org-sections-expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  // Handle organization click
  const handleOrganizationClick = useCallback((organization: Resource) => {
    setSelectedOrganization(organization);
    setIsModalOpen(true);
    
    // Track analytics
    trackResourceClick(organization.id, 'organization', organization.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: organization.id,
      resource_type: 'organization',
      resource_title: organization.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
  }, []);

  // Toggle section expanded state
  const toggleSection = useCallback((functionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [functionName]: !prev[functionName]
    }));
  }, []);

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
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search organizations by name, function, or location..."
          resources={organizations}
          resourceType="organizations"
          className="max-w-md"
        />
        
        <FilterBar
          resourceType="organizations"
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? 'organization' : 'organizations'} found
            {Object.keys(filters).length > 0 || searchQuery.trim() ? ' (filtered)' : ''}
          </div>
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
          {ORGANIZATION_FUNCTIONS.map(func => (
            <div key={func} className="border rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grouped Organizations */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {ORGANIZATION_FUNCTIONS.map(functionName => {
            const sectionOrgs = groupedOrganizations[functionName] || [];
            
            // Only show sections that have organizations (unless all are empty)
            if (sectionOrgs.length === 0 && organizations.length > 0) {
              return null;
            }
            
            return (
              <GroupedSection
                key={functionName}
                functionName={functionName}
                description=""
                organizations={sectionOrgs}
                isExpanded={expandedSections[functionName] || false}
                onToggleExpanded={() => toggleSection(functionName)}
                onOrganizationClick={handleOrganizationClick}
              />
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
            {searchQuery.trim() || Object.keys(filters).length > 0 
              ? "Try adjusting your search or filters to find more results."
              : "No organizations are currently available."}
          </p>
          {(searchQuery.trim() || Object.keys(filters).length > 0) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                setSort('relevance');
              }}
            >
              Clear Search and Filters
            </Button>
          )}
        </div>
      )}

      {/* Organization Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrganization && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  {selectedOrganization.title}
                </DialogTitle>
                {selectedOrganization.data?.hq && (
                  <DialogDescription className="flex items-center gap-1 text-base">
                    <MapPin className="h-4 w-4" />
                    {selectedOrganization.data.hq.city}, {selectedOrganization.data.hq.state || selectedOrganization.data.hq.country}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Functions */}
                {selectedOrganization.data?.functions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Functions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrganization.data.functions.map((func: string) => (
                        <span key={func} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Description */}
                {(selectedOrganization.data?.description || selectedOrganization.summary) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">
                      {selectedOrganization.data?.description || selectedOrganization.summary}
                    </p>
                  </div>
                )}
                
                {/* Website Link */}
                {(selectedOrganization.data?.urls?.site || selectedOrganization.url) && (
                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <a 
                        href={selectedOrganization.data?.urls?.site || selectedOrganization.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit Website
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}