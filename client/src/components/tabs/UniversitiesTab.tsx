import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, MapPin, GraduationCap, AlertCircle, RefreshCw, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInfiniteResources, useResourcesList, Resource, ResourceFilters } from "@/hooks/useResources";
import { useParamState } from "@/hooks/useQueryParams";
import { UniversityMapWithLoading } from "@/components/LazyComponents";
import SearchBox from "@/components/SearchBox";
import { trackTabView, trackResourceClick } from "@/lib/analytics";

interface UniversitiesTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

export default function UniversitiesTab({ onAnalyticsEvent }: UniversitiesTabProps) {
  // Map is now always visible (no collapsible state needed)
  
  // Use empty filters and search since user said overall filter doesn't need to be there
  const filters = useMemo(() => ({} as ResourceFilters), []);
  const searchQuery = '';
  const sort = 'relevance';
  
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
    query: '',
    filters,
    sort: sort as any,
    enabled: true
  });

  const universities = useResourcesList(infiniteQuery);
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = infiniteQuery;


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
      role="tabpanel" 
      id="universities-panel" 
      aria-labelledby="universities-tab"
      className="space-y-6"
    >
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

      {/* Universities Map Section */}
      <div className="space-y-4">
        
        {/* Map Content */}
        <div className="space-y-4">
          {/* Map Loading State */}
          {isLoading && (
            <div className="min-h-[600px] flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Universities Map */}
          {!isLoading && !error && universities.length > 0 && (
            <div className="min-h-[600px]">
              <UniversityMapWithLoading 
                universities={universities}
                onUniversityClick={handleUniversityClick}
              />
            </div>
          )}
          
          {/* Map Empty State */}
          {!isLoading && !error && universities.length === 0 && (
            <div className="text-center py-12 min-h-[400px] flex flex-col items-center justify-center">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No universities to display on map</h3>
              <p className="text-gray-600">
                No universities with location data are currently available.
              </p>
            </div>
          )}
        </div>

        {/* Universities List */}
        {!isLoading && !error && universities.length > 0 && (() => {
          const universitiesWithCoords = universities.filter(u => u.lat && u.long);
          
          // Group universities by region
          const regions = {
            'Western US': universitiesWithCoords.filter(u => ['AZ', 'CO', 'WY'].includes(u.data?.state)),
            'Southern US': universitiesWithCoords.filter(u => ['TX', 'FL', 'TN'].includes(u.data?.state)),
            'Midwest US': universitiesWithCoords.filter(u => ['MI', 'OH'].includes(u.data?.state)),
            'Eastern US': universitiesWithCoords.filter(u => ['NY', 'DE', 'KY'].includes(u.data?.state)),
            'International': universitiesWithCoords.filter(u => u.data?.country !== 'USA')
          };

          return (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Universities on Map ({universitiesWithCoords.length})
              </h3>
              
              <div className="space-y-8">
                {Object.entries(regions).map(([regionName, regionUniversities]) => 
                  regionUniversities.length > 0 && (
                    <div key={regionName}>
                      <h4 className="text-md font-medium text-gray-800 mb-4 border-l-4 border-ugga-primary pl-3">
                        {regionName} ({regionUniversities.length})
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {regionUniversities.map((university) => (
                          <Card 
                            key={university.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleUniversityClick(university)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-gray-300">
                                    <GraduationCap className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 line-clamp-2 text-sm">
                                      {university.title}
                                    </h5>
                                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {university.data?.city}, {university.data?.state}
                                      {university.data?.country !== 'USA' && `, ${university.data?.country}`}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {university.summary}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })()}
      </div>


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