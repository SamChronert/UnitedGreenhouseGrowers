import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResourceFilters } from '@/hooks/useResources';
import { trackFilter } from '@/lib/analytics';

interface FilterBarProps {
  resourceType?: string;
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  className?: string;
}

// Type-specific filter configurations
const FILTER_CONFIGS: Record<string, any> = {
  universities: {
    state: {
      label: 'State',
      options: [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
        { value: 'TX', label: 'Texas' },
        { value: 'FL', label: 'Florida' },
        { value: 'OH', label: 'Ohio' },
        { value: 'NC', label: 'North Carolina' },
        { value: 'GA', label: 'Georgia' },
        { value: 'MI', label: 'Michigan' },
        { value: 'IN', label: 'Indiana' },
        { value: 'WA', label: 'Washington' },
        { value: 'AZ', label: 'Arizona' }
      ]
    },
    country: {
      label: 'Country',
      options: [
        { value: 'USA', label: 'United States' },
        { value: 'CAN', label: 'Canada' },
        { value: 'MEX', label: 'Mexico' }
      ]
    }
  },
  grants: {
    eligibility: {
      label: 'Eligibility',
      options: [
        { value: 'small-farm', label: 'Small Farms' },
        { value: 'beginning-farmer', label: 'Beginning Farmers' },
        { value: 'veteran', label: 'Veterans' },
        { value: 'minority', label: 'Minority Farmers' },
        { value: 'women', label: 'Women Farmers' },
        { value: 'young-farmer', label: 'Young Farmers' }
      ]
    },
    rfpDueDate: {
      label: 'RFP Due Date',
      options: [
        { value: '2024-Q1', label: 'Q1 2024' },
        { value: '2024-Q2', label: 'Q2 2024' },
        { value: '2024-Q3', label: 'Q3 2024' },
        { value: '2024-Q4', label: 'Q4 2024' }
      ]
    }
  },
  organizations: {
    state: {
      label: 'State',
      options: [
        { value: 'CA', label: 'California' },
        { value: 'NY', label: 'New York' },
        { value: 'TX', label: 'Texas' },
        { value: 'FL', label: 'Florida' }
      ]
    }
  }
};

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'newest', label: 'Newest First' },
  { value: 'quality', label: 'Quality Score' }
];

export default function FilterBar({
  resourceType,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  className
}: FilterBarProps) {
  
  // Get available filters for the current resource type
  const availableFilters = useMemo(() => {
    if (!resourceType || !FILTER_CONFIGS[resourceType]) return {};
    return FILTER_CONFIGS[resourceType];
  }, [resourceType]);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);
  
  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string | undefined) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === '') {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    
    onFiltersChange(newFilters);
    
    // Track filter analytics
    if (value) {
      trackFilter(filterKey, value, resourceType);
    }
  };
  
  // Clear all filters
  const handleClearAll = () => {
    onFiltersChange({});
  };
  
  // Remove specific filter
  const handleRemoveFilter = (filterKey: string) => {
    handleFilterChange(filterKey, undefined);
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Filters:
        </div>
        
        {/* Dynamic filters based on resource type */}
        {Object.entries(availableFilters).map(([filterKey, config]: [string, any]) => (
          <Select
            key={filterKey}
            value={filters[filterKey] || ''}
            onValueChange={(value) => handleFilterChange(filterKey, value || undefined)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={config.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                All {config.label}
              </SelectItem>
              {config.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        
        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-gray-600 hover:text-gray-900"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(filters).map(([filterKey, value]) => {
            if (!value) return null;
            
            const config = availableFilters[filterKey];
            const option = config?.options?.find((opt: any) => opt.value === value);
            const label = option?.label || value;
            
            return (
              <Badge
                key={filterKey}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {config?.label}: {label}
                <button
                  onClick={() => handleRemoveFilter(filterKey)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${config?.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}