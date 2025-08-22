import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar, ExternalLink, Download, AlertCircle, RefreshCw, DollarSign, Clock, Building, Filter } from "lucide-react";
import { useResources, Resource, ResourceFilters } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import { trackTabView, trackResourceClick } from "@/lib/analytics";

interface GrantsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const FOCUS_AREAS = [
  'Energy Efficiency',
  'Water Conservation', 
  'Technology Innovation',
  'Research & Development',
  'Marketing & Promotion',
  'Food Safety',
  'Workforce Development',
  'Infrastructure',
  'Sustainability',
  'Climate Resilience'
];

const ORG_TYPES = [
  'Non-profit',
  'University',
  'Government',
  'For-profit',
  'Cooperative',
  'Small Business',
  'Startup'
];

const US_STATES = [
  'All US States', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const STATUS_OPTIONS = ['Open', 'Closed', 'Rolling'];

export default function GrantsTab({ onAnalyticsEvent }: GrantsTabProps) {
  // URL state management
  const [location, setLocation] = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(location.split('?')[1] || ''), [location]);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(urlParams.get('q') || '');
  const [filters, setFilters] = useState<ResourceFilters>(() => {
    const filtersParam = urlParams.get('filters');
    return filtersParam ? JSON.parse(filtersParam) : {};
  });
  const [sort, setSort] = useState(urlParams.get('sort') || 'dueDate');
  const [hideExpired, setHideExpired] = useState(true);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [selectedOrgTypes, setSelectedOrgTypes] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('grants', { tabLabel: 'Grants' });
    onAnalyticsEvent?.('tab_view', { tab: 'grants' });
  }, [onAnalyticsEvent]);

  // Build comprehensive filters
  const grantsFilters = useMemo(() => {
    const combinedFilters: ResourceFilters = { ...filters };
    
    if (hideExpired) {
      const today = new Date().toISOString().split('T')[0];
      combinedFilters.hideExpired = 'true';
    }
    
    if (minAmount) {
      combinedFilters.amountMin = minAmount;
    }
    if (maxAmount) {
      combinedFilters.amountMax = maxAmount;
    }
    
    if (selectedFocusAreas.length > 0) {
      combinedFilters.focusAreas = selectedFocusAreas.join(',');
    }
    
    if (selectedOrgTypes.length > 0) {
      combinedFilters.orgTypes = selectedOrgTypes.join(',');
    }
    
    if (selectedStates.length > 0) {
      combinedFilters.regions = selectedStates.join(',');
    }
    
    return combinedFilters;
  }, [filters, hideExpired, minAmount, maxAmount, selectedFocusAreas, selectedOrgTypes, selectedStates]);

  // Data fetching
  const { data, isLoading, error, refetch } = useResources({
    type: 'grants',
    query: searchQuery,
    filters: grantsFilters,
    sort: sort as any,
    enabled: true
  });

  const grants = data?.items || [];
  const totalCount = data?.total || 0;

  // Update URL when filters/search change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    if (Object.keys(grantsFilters).length > 0) {
      params.set('filters', JSON.stringify(grantsFilters));
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
  }, [searchQuery, grantsFilters, sort, location, setLocation]);

  // Handle grant click
  const handleGrantClick = useCallback((grant: Resource) => {
    setSelectedResource(grant);
    setResourceModalOpen(true);
    trackResourceClick(grant.id, 'grant', grant.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: grant.id,
      resource_type: 'grant',
      resource_title: grant.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setResourceModalOpen(false);
    setSelectedResource(null);
  }, []);

  // Handle external link click from modal
  const handleExternalLinkClick = useCallback((grant: Resource) => {
    if (grant.url) {
      window.open(grant.url, '_blank', 'noopener,noreferrer');
      onAnalyticsEvent?.('grant_external_click', {
        resource_id: grant.id,
        resource_type: 'grant',
        resource_title: grant.title
      });
    }
  }, [onAnalyticsEvent]);

  // Handle column sort
  const handleSort = useCallback((column: string) => {
    setSort(column);
  }, []);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (grants.length === 0) return;
    
    const headers = ['Grant Name', 'Agency', 'Amount Range', 'Focus Areas', 'Due Date', 'Status', 'URL'];
    const csvData = grants.map(grant => [
      grant.title,
      grant.data?.agency || '',
      formatAmountRange(grant.data?.award_min, grant.data?.award_max),
      (grant.data?.focusAreas || []).join('; '),
      grant.data?.due_date || '',
      grant.data?.status || '',
      grant.data?.applyUrls?.grantsGov || grant.url
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grants-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    onAnalyticsEvent?.('grants_export', { count: grants.length });
  }, [grants, onAnalyticsEvent]);

  // Retry function for errors
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Format amount range
  const formatAmountRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) {
      return `$${(min/1000).toFixed(0)}K - $${max >= 1000000 ? (max/1000000).toFixed(1) + 'M' : (max/1000).toFixed(0) + 'K'}`;
    }
    if (min) return `$${(min/1000).toFixed(0)}K+`;
    if (max) return `Up to $${max >= 1000000 ? (max/1000000).toFixed(1) + 'M' : (max/1000).toFixed(0) + 'K'}`;
    return 'Not specified';
  };

  // Check if due date is within 30 days
  const isUpcoming = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <div 
      role="tabpanel" 
      id="grants-panel" 
      aria-labelledby="grants-tab"
      className="space-y-6"
    >
      {/* Header with intro text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Grant Opportunities for Greenhouse Operations</h2>
        <p className="text-blue-800">
          Federal and state grant opportunities for greenhouse operations, infrastructure, and research. 
          New to grants? Read our <a href="/blog/grants-101" className="text-blue-600 hover:text-blue-800 underline">Grants 101 Guide</a>.
        </p>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search grants by name, agency, or focus area..."
          resources={grants}
          resourceType="grants"
          className="max-w-md flex-1"
        />
        
        {/* Collapsible Filters */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {(Object.keys(grantsFilters).length > 0 || selectedFocusAreas.length > 0 || selectedOrgTypes.length > 0 || selectedStates.length > 0 || minAmount || maxAmount) && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {Object.keys(grantsFilters).length + selectedFocusAreas.length + selectedOrgTypes.length + selectedStates.length + (minAmount ? 1 : 0) + (maxAmount ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Grants</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Amount Range */}
              <div>
                <label className="text-sm font-medium mb-3 block">Amount Range</label>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="min-amount" className="text-xs text-gray-600 mb-1 block">Minimum Amount</label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="e.g., 50000"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-amount" className="text-xs text-gray-600 mb-1 block">Maximum Amount</label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="e.g., 500000"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Enter amounts in dollars (e.g., 50000 for $50,000)
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <label className="text-sm font-medium mb-3 block">Focus Areas</label>
                <div className="grid grid-cols-1 gap-3">
                  {FOCUS_AREAS.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${area}`}
                        checked={selectedFocusAreas.includes(area)}
                        onCheckedChange={(checked) => {
                          setSelectedFocusAreas(prev => 
                            checked 
                              ? [...prev, area]
                              : prev.filter(a => a !== area)
                          );
                        }}
                      />
                      <label htmlFor={`filter-${area}`} className="text-sm">{area}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Types */}
              <div>
                <label className="text-sm font-medium mb-3 block">Organization Type Eligibility</label>
                <div className="grid grid-cols-1 gap-3">
                  {ORG_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`org-${type}`}
                        checked={selectedOrgTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setSelectedOrgTypes(prev => 
                            checked 
                              ? [...prev, type]
                              : prev.filter(t => t !== type)
                          );
                        }}
                      />
                      <label htmlFor={`org-${type}`} className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* States/Regions */}
              <div>
                <label className="text-sm font-medium mb-3 block">Eligible Regions/States</label>
                <Select
                  value={selectedStates[0] || ''}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedStates([value]);
                    } else {
                      setSelectedStates([]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hide Expired Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="filter-hide-expired"
                  checked={hideExpired}
                  onCheckedChange={setHideExpired}
                />
                <label htmlFor="filter-hide-expired" className="text-sm font-medium">Hide expired grants</label>
              </div>
              
              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setFilters({});
                  setSelectedFocusAreas([]);
                  setSelectedOrgTypes([]);
                  setSelectedStates([]);
                  setMinAmount('');
                  setMaxAmount('');
                  setHideExpired(true);
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results Summary and Export */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <strong>{totalCount}</strong> {totalCount === 1 ? 'grant' : 'grants'} found
          {(Object.keys(grantsFilters).length > 0 || selectedFocusAreas.length > 0 || selectedOrgTypes.length > 0 || selectedStates.length > 0 || searchQuery.trim() || minAmount || maxAmount) ? ' (filtered)' : ''}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={grants.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load grants. Please try again.</span>
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

      {/* Grants Table */}
      {!isLoading && !error && (
        <Card>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('title')}
                  >
                    Grant Name {sort === 'title' && '•'}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('agency')}
                  >
                    Agency {sort === 'agency' && '•'}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('amount')}
                  >
                    Amount Range {sort === 'amount' && '•'}
                  </TableHead>
                  <TableHead>Focus Areas</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date {sort === 'dueDate' && '•'}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map(grant => (
                  <TableRow 
                    key={grant.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleGrantClick(grant)}
                  >
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <div className="font-semibold text-blue-600 hover:text-blue-800">
                          {grant.title}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {grant.summary}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {grant.data?.agency || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {formatAmountRange(grant.data?.award_min, grant.data?.award_max)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(grant.data?.focusAreas || []).slice(0, 3).map((area: string) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {(grant.data?.focusAreas || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(grant.data?.focusAreas || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${
                          isUpcoming(grant.data?.due_date) ? 'text-orange-500' : 'text-gray-400'
                        }`} />
                        <span className={isUpcoming(grant.data?.due_date) ? 'text-orange-700 font-medium' : ''}>
                          {grant.data?.due_date || 'Rolling'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={grant.data?.status === 'Open' ? 'default' : 
                                grant.data?.status === 'Rolling' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {grant.data?.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {grant.data?.applyUrls?.grantsGov && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(grant.data.applyUrls.grantsGov, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && grants.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grants found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery.trim() || Object.keys(grantsFilters).length > 0 
              ? "Try adjusting your search or filters to find more results."
              : "No grants are currently available."}
          </p>
          {(searchQuery.trim() || Object.keys(grantsFilters).length > 0) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                setSelectedFocusAreas([]);
                setSelectedOrgTypes([]);
                setSelectedStates([]);
                setMinAmount('');
                setMaxAmount('');
                setHideExpired(true);
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Grant Details Modal */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-2xl z-[1000]">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {selectedResource.data?.agency && (
                    <Badge variant="outline">
                      {selectedResource.data.agency}
                    </Badge>
                  )}
                  {selectedResource.data?.status && (
                    <Badge variant="secondary">
                      {selectedResource.data.status}
                    </Badge>
                  )}
                  {selectedResource.data?.due_date && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(selectedResource.data.due_date).toLocaleDateString()}
                    </Badge>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">
                    {selectedResource.summary || 'No description available.'}
                  </p>
                </div>
                
                {(selectedResource.data?.award_min || selectedResource.data?.award_max) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Award Amount</h4>
                    <p className="text-gray-700">
                      ${selectedResource.data.award_min?.toLocaleString() || 'N/A'} - ${selectedResource.data.award_max?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                )}
                
                {selectedResource.data?.focusAreas && selectedResource.data.focusAreas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.data.focusAreas.map((area: string, index: number) => (
                        <Badge key={index} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {selectedResource.url && (
                    <Button 
                      onClick={() => handleExternalLinkClick(selectedResource)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Grant Details
                    </Button>
                  )}
                  
                  {selectedResource.data?.applyUrls?.grantsGov && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedResource.data.applyUrls.grantsGov, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply on Grants.gov
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