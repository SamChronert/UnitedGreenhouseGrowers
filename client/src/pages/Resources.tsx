import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ExternalLink, Grid, List, Heart, Plus, Book, Loader2, X, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

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

// Resource Type Definitions
const RESOURCE_TYPES = [
  { id: 'all', label: 'All', slug: '' },
  { id: 'university', label: 'University', slug: 'university' },
  { id: 'organization', label: 'Organization', slug: 'organization' },
  { id: 'grant', label: 'Grant', slug: 'grant' },
  { id: 'tool', label: 'Tool/Software', slug: 'tool-software' },
  { id: 'education', label: 'Education', slug: 'education' },
  { id: 'template', label: 'Template', slug: 'template' },
  { id: 'consultant', label: 'Consultant', slug: 'consultant' },
  { id: 'article', label: 'Article/Research', slug: 'article-research' }
] as const;

type ResourceTypeId = typeof RESOURCE_TYPES[number]['id'];

export default function Resources() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // URL state management
  const urlParams = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  
  // Current resource type from URL
  const currentTypeSlug = urlParams.get('type') || '';
  const currentType = RESOURCE_TYPES.find(t => t.slug === currentTypeSlug) || RESOURCE_TYPES[0];
  
  // Per-type state cache
  const [typeStates, setTypeStates] = useState<Record<string, {
    filters: FacetFilters;
    sort: string;
    page: number;
    viewMode: 'grid' | 'list';
  }>>({});
  
  // Get current state for active type
  const getCurrentState = useCallback(() => {
    const cached = typeStates[currentType.id];
    if (cached) return cached;
    
    // Initialize from URL or defaults
    return {
      filters: {
        q: urlParams.get('q') || '',
        type: currentType.slug ? [currentType.slug] : [], // Type is set based on active tab
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
      },
      sort: urlParams.get('sort') || 'relevance',
      page: parseInt(urlParams.get('page') || '1'),
      viewMode: urlParams.get('view') as 'grid' | 'list' || 'grid'
    };
  }, [currentType, urlParams, typeStates]);
  
  const [filters, setFilters] = useState<FacetFilters>(() => getCurrentState().filters);
  const [sort, setSort] = useState(() => getCurrentState().sort);
  const [page, setPage] = useState(() => getCurrentState().page);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => getCurrentState().viewMode);

  // Update local state when type changes
  useEffect(() => {
    const newState = getCurrentState();
    setFilters(newState.filters);
    setSort(newState.sort);
    setPage(newState.page);
    setViewMode(newState.viewMode);
  }, [currentType.id, getCurrentState]);
  
  // Filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Profile state
  const [profileEnabled, setProfileEnabled] = useState(false);
  const [profileFilters, setProfileFilters] = useState<Partial<FacetFilters>>({});
  const [appliedProfileFilters, setAppliedProfileFilters] = useState<string[]>([]);
  
  // Map state  
  const [isMapView, setIsMapView] = useState(false);
  
  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.q || '');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Results announcement for accessibility
  const [announcement, setAnnouncement] = useState('');
  
  // Focus management
  useEffect(() => {
    // Focus search input on initial load
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Update type states cache
  const updateTypeState = useCallback((typeId: string, newState: Partial<ReturnType<typeof getCurrentState>>) => {
    setTypeStates(prev => ({
      ...prev,
      [typeId]: { ...getCurrentState(), ...newState }
    }));
  }, [getCurrentState]);

  // Update URL when state changes
  const updateURL = useCallback((typeSlug: string, newFilters: FacetFilters, newSort: string, newPage: number, newView: string) => {
    const params = new URLSearchParams();
    
    // Add resource type
    if (typeSlug) params.set('type', typeSlug);
    
    // Add search query
    if (newFilters.q?.trim()) params.set('q', newFilters.q);
    
    // Add array filters (excluding type since it's handled above)
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

  // Handle resource type change
  const handleTypeChange = useCallback((newTypeId: ResourceTypeId) => {
    const newType = RESOURCE_TYPES.find(t => t.id === newTypeId) || RESOURCE_TYPES[0];
    
    // Save current state
    updateTypeState(currentType.id, { filters, sort, page, viewMode });
    
    // Get cached state for new type or create default
    const cachedState = typeStates[newTypeId];
    const newState = cachedState || {
      filters: {
        q: filters.q, // Preserve search
        type: newType.slug ? [newType.slug] : [],
        topics: [],
        crop: [],
        system_type: [],
        region: [],
        audience: [],
        cost: [],
        status: [],
        eligibility_geo: [],
        format: [],
        has_location: false
      },
      sort: 'relevance',
      page: 1,
      viewMode: 'grid' as const
    };
    
    // Update local state
    setFilters(newState.filters);
    setSort(newState.sort);
    setPage(newState.page);
    setViewMode(newState.viewMode);
    
    // Update URL
    updateURL(newType.slug, newState.filters, newState.sort, newState.page, newState.viewMode);
  }, [currentType, filters, sort, page, viewMode, typeStates, updateTypeState, updateURL]);

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
        updateURL(currentType.slug, newFilters, sort, 1, viewMode);
      }
    }, 300);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchInput, filters, sort, viewMode, currentType, updateURL]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FacetFilters) => {
    setFilters(newFilters);
    setPage(1);
    updateTypeState(currentType.id, { filters: newFilters, page: 1 });
    updateURL(currentType.slug, newFilters, sort, 1, viewMode);
  }, [currentType, sort, viewMode, updateTypeState, updateURL]);

  // Handle sort changes
  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
    updateTypeState(currentType.id, { sort: newSort });
    updateURL(currentType.slug, filters, newSort, page, viewMode);
  }, [currentType, filters, page, viewMode, updateTypeState, updateURL]);

  // Handle view mode changes
  const handleViewChange = useCallback((newView: string) => {
    const newViewMode = newView as 'grid' | 'list';
    setViewMode(newViewMode);
    updateTypeState(currentType.id, { viewMode: newViewMode });
    updateURL(currentType.slug, filters, sort, page, newView);
  }, [currentType, filters, sort, page, updateTypeState, updateURL]);

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

  // Keyboard event handlers
  const handleCardKeyDown = useCallback((event: React.KeyboardEvent, resourceId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOpenResource(resourceId);
    }
  }, [handleOpenResource]);

  const handleHeartKeyDown = useCallback((event: React.KeyboardEvent, resourceId: string, isFavorited: boolean) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      handleToggleFavorite(resourceId, isFavorited);
    }
  }, [handleToggleFavorite]);

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
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 id="results-heading" className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
              <p className="text-gray-700">We're building a grower-reviewed resource library of guides, case studies, and extension bulletins — everything from irrigation best practices to supplier insights. Founding members will help decide what gets included, reviewed, and prioritized.</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-md">
                <label htmlFor="resource-search" className="sr-only">
                  Search resources
                </label>
                <input
                  ref={searchInputRef}
                  id="resource-search"
                  type="text"
                  placeholder="Search resources..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-describedby="search-description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:border-transparent"
                />
                <div id="search-description" className="sr-only">
                  Search through resource titles, descriptions, and tags
                </div>
              </div>
              
              <Link href="/dashboard/resources/saved">
                <Button variant="outline" size="sm" className="flex items-center gap-2" aria-describedby="saved-resources-desc">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Saved
                </Button>
              </Link>
              <div id="saved-resources-desc" className="sr-only">
                View your saved resources
              </div>
              
              <SuggestDialog />
            </div>
          </div>

          {/* Resource Type Toggle */}
          <div className="mb-6">
            <nav className="border-b border-gray-200" aria-label="Resource type navigation">
              <div className="flex overflow-x-auto scrollbar-hide">
                <div className="flex space-x-8 min-w-max">
                  {RESOURCE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={cn(
                        "whitespace-nowrap pb-4 px-3 py-2 border-b-2 font-medium text-sm transition-colors rounded-t-lg",
                        "focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                        currentType.id === type.id
                          ? "border-ugga-primary text-ugga-primary bg-ugga-primary/10"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      aria-current={currentType.id === type.id ? "page" : undefined}
                      role="tab"
                      tabIndex={0}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main 
          className="space-y-6"
          aria-labelledby="results-heading"
          aria-describedby="results-description"
        >
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Results Count & Filters */}
            <div className="flex items-center gap-4">
              {/* Filter Drawer */}
              <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filters
                    {/* Show active filter count */}
                    {(() => {
                      const activeFilters = { ...filters };
                      delete activeFilters.type; // Type is handled by tabs, not filters
                      delete activeFilters.q; // Search is separate from filters
                      const count = Object.values(activeFilters).flat().filter(Boolean).length;
                      return count > 0 ? (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {count}
                        </Badge>
                      ) : null;
                    })()}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Filters for {currentType.label}</SheetTitle>
                    <SheetDescription>
                      Refine your search results with type-specific filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <FacetPanel
                      value={filters}
                      onChange={handleFilterChange}
                      showStatus={currentType.slug === 'grant'}
                      showFormat={currentType.slug !== 'consultant'}
                      hasLocationAvailable={hasLocationAvailable}
                      resourceType={currentType.slug}
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
                </SheetContent>
              </Sheet>

              <div 
                aria-live="polite" 
                aria-atomic="true" 
                className="text-sm text-gray-600"
                id="results-description"
              >
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
                    <X className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </Badge>
              )}
            </div>

            {/* View Toggle & Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-600">Sort:</label>
                <select 
                  id="sort-select"
                  value={sort} 
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-ugga-primary focus:border-transparent"
                  aria-describedby="sort-description"
                >
                  <option value="relevance">Relevance</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="verified_desc">UGGA Verified</option>
                  <option value="due_soon">Recently Updated</option>
                </select>
                <div id="sort-description" className="sr-only">
                  Sort resources by different criteria
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={handleViewChange}>
                <TabsList role="tablist" aria-label="View mode selection">
                  <TabsTrigger 
                    value="grid" 
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Grid view</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="list"
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">List view</span>
                  </TabsTrigger>
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
              <TabsContent value="grid" className="mt-0" role="tabpanel" aria-labelledby="grid-tab">
                <div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  role="grid"
                  aria-label="Resources grid"
                >
                  {resourceData.items.map((resource, index) => (
                    <div
                      key={resource.id}
                      role="gridcell"
                      tabIndex={0}
                      className="focus:outline-none focus:ring-2 focus:ring-ugga-primary rounded-lg"
                      onKeyDown={(e) => handleCardKeyDown(e, resource.id)}
                      aria-label={`Resource: ${resource.title}`}
                      aria-describedby={`resource-${resource.id}-description`}
                    >
                      <ResourceCard
                        resource={resource}
                        onToggleFavorite={handleToggleFavorite}
                        onOpen={handleOpenResource}
                        isFavorited={false} // TODO: Get from favorites API
                        showBadges={true}
                      />
                      <div id={`resource-${resource.id}-description`} className="sr-only">
                        {resource.summary || `${resource.type} resource about ${resource.topics?.join(', ') || 'greenhouse growing'}`}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0" role="tabpanel" aria-labelledby="list-tab">
                <Table role="table" aria-label="Resources table">
                  <TableHeader>
                    <TableRow role="row">
                      <TableHead role="columnheader">Resource</TableHead>
                      <TableHead role="columnheader">Type</TableHead>
                      <TableHead role="columnheader">Topics</TableHead>
                      <TableHead role="columnheader">Region/Cost</TableHead>
                      <TableHead role="columnheader">Status</TableHead>
                      <TableHead role="columnheader">Actions</TableHead>
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
          </main>

        {/* Pagination */}
        {resourceData && resourceData.total > 24 && (
          <nav 
            className="mt-12 flex justify-center"
            aria-label="Resource pagination"
            role="navigation"
          >
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  updateURL(currentType.slug, filters, sort, newPage, viewMode);
                }}
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              
              <span 
                className="text-sm text-gray-600 px-4"
                aria-live="polite"
                aria-label={`Current page ${page} of ${Math.ceil(resourceData.total / 24)}`}
              >
                Page {page} of {Math.ceil(resourceData.total / 24)}
              </span>
              
              <Button 
                variant="outline" 
                disabled={page >= Math.ceil(resourceData.total / 24)} 
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  updateURL(currentType.slug, filters, sort, newPage, viewMode);
                }}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          </nav>
        )}
        </div>
      </div>
    </div>
  );
}