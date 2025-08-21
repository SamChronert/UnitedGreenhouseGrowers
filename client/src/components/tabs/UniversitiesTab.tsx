import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, MapPin, GraduationCap, AlertCircle, RefreshCw, Grid3X3, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInfiniteResources, useResourcesList, Resource, ResourceFilters } from "@/hooks/useResources";
import { useParamState } from "@/hooks/useQueryParams";
import { UniversityMapWithLoading } from "@/components/LazyComponents";
import SearchBox from "@/components/SearchBox";
import FilterBar from "@/components/FilterBar";
import { trackTabView, trackResourceClick } from "@/lib/analytics";
import { useToggleView } from "@/hooks/useToggleView";
import { ToggleGroup } from "@/features/resources/components/ToggleGroup";

interface UniversitiesTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

export default function UniversitiesTab({ onAnalyticsEvent }: UniversitiesTabProps) {
  // URL state management with useParamState
  const [viewMode, setViewMode] = useParamState('view', 'map');
  const [searchQuery, setSearchQuery] = useParamState('q', '');
  const [filtersParam, setFiltersParam] = useParamState('filters', '{}');
  const [sort, setSort] = useParamState('sort', 'relevance');
  
  // Parse filters from URL param
  const filters = useMemo(() => {
    try {
      return JSON.parse(filtersParam) as ResourceFilters;
    } catch {
      return {} as ResourceFilters;
    }
  }, [filtersParam]);
  
  // Local state
  const [selectedUniversity, setSelectedUniversity] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('universities');
    onAnalyticsEvent?.('tab_view', { tab: 'universities' });
  }, [onAnalyticsEvent]);

  // Data fetching with infinite query
  const infiniteQuery = useInfiniteResources({
    type: 'universities',
    query: searchQuery,
    filters,
    sort: sort as any,
    enabled: true
  });

  const universities = useResourcesList(infiniteQuery);
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = infiniteQuery;

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters: ResourceFilters) => {
    setFiltersParam(JSON.stringify(newFilters));
  }, [setFiltersParam]);

  // View mode is now controlled by routing, no need for handler

  // Handle university card click
  const handleUniversityClick = useCallback((university: Resource) => {
    setSelectedUniversity(university);
    setIsModalOpen(true);
    
    // Track analytics
    trackResourceClick(university.id, 'university', university.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: university.id,
      resource_type: 'university',
      resource_title: university.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUniversity(null);
  }, []);

  // Handle infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Retry function for errors
  const handleRetry = useCallback(() => {
    infiniteQuery.refetch();
  }, [infiniteQuery]);

  // Get total count from first page
  const totalCount = data?.pages[0]?.total || 0;

  return (
    <div 
      key={`universities-${viewMode}`}
      role="tabpanel" 
      id="universities-panel" 
      aria-labelledby="universities-tab"
      className="space-y-6"
    >
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search universities by name, program, or location..."
            resources={universities}
            resourceType="universities"
            className="max-w-md"
          />
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('Switching to grid view');
                setViewMode('grid');
              }}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                console.log('Switching to map view');
                setViewMode('map');
              }}
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Map
            </Button>
          </div>
        </div>
        
        <FilterBar
          resourceType="universities"
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sort={sort}
          onSortChange={setSort}
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalCount} {totalCount === 1 ? 'university' : 'universities'} found
            {Object.keys(filters).length > 0 || searchQuery.trim() ? ' (filtered)' : ''}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load universities. Please try again.</span>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content - Grid or Map View */}
      {!isLoading && !error && universities.length > 0 && (
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {universities.map(university => (
                  <Card 
                    key={university.id} 
                    className="cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                    onClick={() => handleUniversityClick(university)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleUniversityClick(university);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${university.title}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {university.title}
                        </CardTitle>
                        <GraduationCap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
                        {university.data?.city || 'Location'}, {university.data?.state || 'State'}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700 mb-3">
                        {university.data?.programName || 'Academic Program'}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {university.summary}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="w-auto"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Universities'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="min-h-[600px]">
              <UniversityMapWithLoading 
                universities={universities}
                onUniversityClick={handleUniversityClick}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && universities.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No universities found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery.trim() || Object.keys(filters).length > 0 
              ? "Try adjusting your search or filters to find more results."
              : "No universities are currently available."}
          </p>
          {(searchQuery.trim() || Object.keys(filters).length > 0) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                handleFiltersChange({});
                setSort('relevance');
              }}
            >
              Clear Search and Filters
            </Button>
          )}
        </div>
      )}

      {/* University Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUniversity && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  {selectedUniversity.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1 text-base">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {selectedUniversity.data?.city || 'Location'}, {selectedUniversity.data?.state || 'State'}, {selectedUniversity.data?.country || 'Country'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Program</h4>
                  <p className="text-gray-700">{selectedUniversity.data?.programName || 'Academic Program'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{selectedUniversity.summary}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1">
                    <a 
                      href={selectedUniversity.data?.urls?.site || selectedUniversity.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Visit Website
                    </a>
                  </Button>
                  {selectedUniversity.data?.urls?.extension && (
                    <Button variant="outline" asChild className="flex-1">
                      <a 
                        href={selectedUniversity.data.urls.extension}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Extension Services
                      </a>
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