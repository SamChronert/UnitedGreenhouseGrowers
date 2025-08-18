import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Grid, List, Heart, Plus, Book, Loader2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";
import { useAuth } from "@/hooks/useAuth";

// Import Resource Library components
import ResourceCard from "@/components/resources/ResourceCard";
import ResourceRow from "@/components/resources/ResourceRow";
import FacetPanel, { type FacetFilters } from "@/components/resources/FacetPanel";
import ProfileToggle, { type UserProfile } from "@/components/resources/ProfileToggle";
import MapToggle from "@/components/resources/MapToggle";
import EmptyState from "@/components/common/EmptyState";
import { SuggestDialog } from "@/components/resources/SuggestDialog";

// Import API
import { listResources, type ResourceFilters } from "@/lib/api/resources";

export default function Resources() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // URL state management
  const urlParams = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  
  // Parse URL state
  const [filters, setFilters] = useState<FacetFilters>(() => ({
    q: urlParams.get('q') || '',
    type: urlParams.getAll('type').filter(Boolean),
    topics: urlParams.getAll('topics').filter(Boolean),
    crop: urlParams.getAll('crop').filter(Boolean),
    system_type: urlParams.getAll('system_type').filter(Boolean),
    region: urlParams.getAll('region').filter(Boolean),
    audience: urlParams.getAll('audience').filter(Boolean),
    cost: urlParams.getAll('cost').filter(Boolean),
    status: urlParams.getAll('status').filter(Boolean),
    eligibility_geo: urlParams.getAll('eligibility_geo').filter(Boolean),
    format: urlParams.getAll('format').filter(Boolean),
    has_location: urlParams.get('has_location') === 'true'
  }));
  
  const [sort, setSort] = useState(urlParams.get('sort') || 'relevance');
  const [page, setPage] = useState(parseInt(urlParams.get('page') || '1'));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(urlParams.get('view') as 'grid' | 'list' || 'grid');
  
  // Profile state
  const [profileEnabled, setProfileEnabled] = useState(false);
  const [profileFilters, setProfileFilters] = useState<Partial<FacetFilters>>({});
  const [appliedProfileFilters, setAppliedProfileFilters] = useState<string[]>([]);
  
  // Map state  
  const [isMapView, setIsMapView] = useState(false);
  
  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.q || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Results announcement for accessibility
  const [announcement, setAnnouncement] = useState('');

  // Update URL when state changes
  const updateURL = useCallback((newFilters: FacetFilters, newSort: string, newPage: number, newView: string) => {
    const params = new URLSearchParams();
    
    // Add search query
    if (newFilters.q?.trim()) params.set('q', newFilters.q);
    
    // Add array filters
    newFilters.type?.forEach(v => params.append('type', v));
    newFilters.topics?.forEach(v => params.append('topics', v));
    newFilters.crop?.forEach(v => params.append('crop', v));
    newFilters.system_type?.forEach(v => params.append('system_type', v));
    newFilters.region?.forEach(v => params.append('region', v));
    newFilters.audience?.forEach(v => params.append('audience', v));
    newFilters.cost?.forEach(v => params.append('cost', v));
    newFilters.status?.forEach(v => params.append('status', v));
    newFilters.eligibility_geo?.forEach(v => params.append('eligibility_geo', v));
    newFilters.format?.forEach(v => params.append('format', v));
    
    // Add boolean filter
    if (newFilters.has_location) params.set('has_location', 'true');
    
    // Add other params
    if (newSort !== 'relevance') params.set('sort', newSort);
    if (newPage !== 1) params.set('page', newPage.toString());
    if (newView !== 'grid') params.set('view', newView);
    
    const newURL = `/dashboard/resources${params.toString() ? '?' + params.toString() : ''}`;
    setLocation(newURL, { replace: true });
  }, [setLocation]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (filters.q !== searchInput) {
        const newFilters = { ...filters, q: searchInput };
        setFilters(newFilters);
        setPage(1); // Reset to first page on search
        updateURL(newFilters, sort, 1, viewMode);
      }
    }, 300);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchInput, filters, sort, viewMode, updateURL]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FacetFilters) => {
    setFilters(newFilters);
    setPage(1);
    updateURL(newFilters, sort, 1, viewMode);
  }, [sort, viewMode, updateURL]);

  // Handle sort changes
  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    updateURL(filters, newSort, page, viewMode);
  }, [filters, page, viewMode, updateURL]);

  // Handle view mode changes
  const handleViewChange = useCallback((newView: string) => {
    setViewMode(newView as 'grid' | 'list');
    updateURL(filters, sort, page, newView);
  }, [filters, sort, page, updateURL]);

  // API query
  const queryParams: ResourceFilters = {
    ...filters,
    sort,
    page,
    pageSize: 24
  };
  
  const { 
    data: resourceData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/resources', queryParams],
    queryFn: () => listResources(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update announcement when results change
  useEffect(() => {
    if (resourceData) {
      const count = resourceData.total;
      const message = count === 0 
        ? 'No resources found'
        : `${count} resource${count !== 1 ? 's' : ''} found`;
      setAnnouncement(message);
    }
  }, [resourceData]);

  // Check if any resources have location data
  const hasLocationAvailable = useMemo(() => {
    return resourceData?.items.some(item => item.has_location) || false;
  }, [resourceData]);

  // Get user profile from auth
  const userProfile: UserProfile | undefined = useMemo(() => {
    if (!user) return undefined;
    
    // Map user profile data to expected format
    // This would come from the user's profile in the database
    return {
      crops: [], // Would be populated from user.profile.crops
      system_types: [], // Would be populated from user.profile.system_types
      regions: [], // Would be populated from user.profile.regions
      experience_level: 'intermediate', // Would be populated from user.profile.experience_level
      operation_type: 'commercial' // Would be populated from user.profile.operation_type
    };
  }, [user]);

  // Handle profile toggle
  const handleProfileToggle = useCallback((enabled: boolean) => {
    setProfileEnabled(enabled);
    if (enabled && userProfile) {
      // Apply profile filters
      const profileFilters: Partial<FacetFilters> = {
        crop: userProfile.crops || [],
        system_type: userProfile.system_types || [],
        region: userProfile.regions || []
      };
      setProfileFilters(profileFilters);
      
      // Track which filters were applied by profile
      const appliedKeys: string[] = [];
      if (profileFilters.crop?.length) appliedKeys.push('crop');
      if (profileFilters.system_type?.length) appliedKeys.push('system_type');
      if (profileFilters.region?.length) appliedKeys.push('region');
      setAppliedProfileFilters(appliedKeys);
      
      // Merge with existing filters
      const newFilters = { ...filters };
      if (profileFilters.crop?.length) {
        newFilters.crop = [...(newFilters.crop || []), ...profileFilters.crop];
      }
      if (profileFilters.system_type?.length) {
        newFilters.system_type = [...(newFilters.system_type || []), ...profileFilters.system_type];
      }
      if (profileFilters.region?.length) {
        newFilters.region = [...(newFilters.region || []), ...profileFilters.region];
      }
      
      handleFilterChange(newFilters);
    }
  }, [userProfile, filters, handleFilterChange]);

  // Clear profile filters
  const handleClearProfile = useCallback(() => {
    setProfileEnabled(false);
    setProfileFilters({});
    
    // Remove only profile-applied filters
    const newFilters = { ...filters };
    appliedProfileFilters.forEach(key => {
      if (key === 'crop' && profileFilters.crop?.length) {
        newFilters.crop = (newFilters.crop || []).filter(
          item => !profileFilters.crop!.includes(item)
        );
      }
      if (key === 'system_type' && profileFilters.system_type?.length) {
        newFilters.system_type = (newFilters.system_type || []).filter(
          item => !profileFilters.system_type!.includes(item)
        );
      }
      if (key === 'region' && profileFilters.region?.length) {
        newFilters.region = (newFilters.region || []).filter(
          item => !profileFilters.region!.includes(item)
        );
      }
    });
    
    setAppliedProfileFilters([]);
    handleFilterChange(newFilters);
  }, [filters, profileFilters, appliedProfileFilters, handleFilterChange]);

  // Navigate to resource detail
  const handleOpenResource = useCallback((id: string) => {
    setLocation(`/dashboard/resources/${id}`);
  }, [setLocation]);

  // Handle favorite toggle (placeholder)
  const handleToggleFavorite = useCallback(async (id: string, isFavorited: boolean) => {
    console.log('Toggle favorite:', id, isFavorited);
    // TODO: Implement favorites API calls
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
        <InDevelopmentBanner 
          title="Resource Library" 
          description="This feature is currently in development and needs some more work before it is fully functional."
        />
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
              <p className="text-gray-700">We're building a grower-reviewed resource library of guides, case studies, and extension bulletins — everything from irrigation best practices to supplier insights. Founding members will help decide what gets included, reviewed, and prioritized.</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:border-transparent"
                />
              </div>
              
              <Link href="/dashboard/resources/saved">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Saved
                </Button>
              </Link>
              
              <SuggestDialog />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Facets & Controls */}
          <div className="lg:col-span-1 space-y-4">
            <FacetPanel
              value={filters}
              onChange={handleFilterChange}
              showStatus={true}
              showFormat={true}
              hasLocationAvailable={hasLocationAvailable}
            />
            
            <ProfileToggle
              isEnabled={profileEnabled}
              onToggle={handleProfileToggle}
              onApply={() => {}} // Handled by toggle
              onClear={handleClearProfile}
              userProfile={userProfile}
            />
            
            <MapToggle
              hasLocationAvailable={hasLocationAvailable}
              isMapView={isMapView}
              onToggleView={setIsMapView}
              locationCount={resourceData?.items.filter(item => item.has_location).length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results Count & Status */}
              <div className="flex items-center gap-4">
                <div aria-live="polite" aria-atomic="true" className="text-sm text-gray-600">
                  {isLoading ? 'Searching...' : announcement}
                </div>
                {profileEnabled && appliedProfileFilters.length > 0 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Profile filters applied
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-green-100"
                      onClick={handleClearProfile}
                      aria-label="Clear profile filters"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>

              {/* View Toggle & Sort */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort:</label>
                  <select 
                    value={sort} 
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="title_asc">Title A-Z</option>
                    <option value="verified_desc">UGGA Verified</option>
                    <option value="due_soon">Recently Updated</option>
                  </select>
                </div>

                <Tabs value={viewMode} onValueChange={handleViewChange}>
                  <TabsList>
                    <TabsTrigger value="grid"><Grid className="h-4 w-4" /></TabsTrigger>
                    <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Results */}
            {error && (
              <Card className="shadow-sm bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <p className="text-red-800">Failed to load resources. Please try again.</p>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
              </div>
            )}

            {resourceData && resourceData.items.length === 0 && (
              <EmptyState
                title="No resources found"
                body="We couldn't find any resources matching your current filters. Try adjusting your search criteria or suggest a new resource."
                icon={<Book className="h-10 w-10 text-gray-400" />}
                ctaText="Suggest a Resource"
                onCtaClick={() => {}} // Will be handled by SuggestDialog
              />
            )}

            {resourceData && resourceData.items.length > 0 && (
              <Tabs value={viewMode} onValueChange={handleViewChange}>
                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resourceData.items.map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onToggleFavorite={handleToggleFavorite}
                        onOpen={handleOpenResource}
                        isFavorited={false} // TODO: Get from favorites API
                        showBadges={true}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Topics</TableHead>
                        <TableHead>Region/Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceData.items.map((resource) => (
                        <ResourceRow
                          key={resource.id}
                          resource={resource}
                          onToggleFavorite={handleToggleFavorite}
                          onOpen={handleOpenResource}
                          isFavorited={false} // TODO: Get from favorites API
                          showBadges={true}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>

        {/* Pagination */}
        {resourceData && resourceData.total > 24 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  updateURL(filters, sort, newPage, viewMode);
                }}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600 px-4">
                Page {page} of {Math.ceil(resourceData.total / 24)}
              </span>
              
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(resourceData.total / 24)} 
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  updateURL(filters, sort, newPage, viewMode);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}