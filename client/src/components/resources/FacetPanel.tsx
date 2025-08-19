import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, Filter, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FacetFilters {
  q?: string;
  type?: string[];
  topics?: string[];
  crop?: string[];
  system_type?: string[];
  audience?: string[];
  cost?: string[];
  region?: string[];
  // Type-specific filters
  status?: string[];
  eligibility_geo?: string[];
  format?: string[];
  has_location?: boolean;
}

export interface FacetPanelProps {
  value: FacetFilters;
  onChange: (filters: FacetFilters) => void;
  className?: string;
  // Control display
  mobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Optional type-specific props
  showStatus?: boolean;
  showEligibilityGeo?: boolean;
  showFormat?: boolean;
  hasLocationAvailable?: boolean;
}

const FILTER_OPTIONS = {
  type: [
    { value: 'university', label: 'University' },
    { value: 'organization', label: 'Organization' },
    { value: 'grant', label: 'Grant/Funding' },
    { value: 'tool', label: 'Tool/Software' },
    { value: 'education', label: 'Educational' },
    { value: 'template', label: 'Template' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'article', label: 'Article/Research' },
  ],
  topics: [
    { value: 'management', label: 'Management' },
    { value: 'pest-management', label: 'Pest Management' },
    { value: 'disease-management', label: 'Disease Management' },
    { value: 'nutrition', label: 'Plant Nutrition' },
    { value: 'climate-control', label: 'Climate Control' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'automation', label: 'Automation' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'energy-efficiency', label: 'Energy Efficiency' },
    { value: 'hydroponics', label: 'Hydroponics' },
  ],
  crop: [
    { value: 'tomatoes', label: 'Tomatoes' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'peppers', label: 'Peppers' },
    { value: 'cucumbers', label: 'Cucumbers' },
    { value: 'strawberries', label: 'Strawberries' },
    { value: 'flowers', label: 'Flowers' },
    { value: 'ornamentals', label: 'Ornamentals' },
    { value: 'all-crops', label: 'All Crops' },
  ],
  system_type: [
    { value: 'hydroponics', label: 'Hydroponic' },
    { value: 'soil-based', label: 'Soil-based' },
    { value: 'controlled-environment', label: 'Controlled Environment' },
    { value: 'nft', label: 'NFT' },
    { value: 'dwc', label: 'Deep Water Culture' },
    { value: 'all-systems', label: 'All Systems' },
  ],
  audience: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'research', label: 'Research' },
  ],
  cost: [
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'membership', label: 'Membership Required' },
    { value: 'funding-opportunity', label: 'Funding Opportunity' },
  ],
  region: [
    { value: 'US', label: 'United States' },
    { value: 'Northeast', label: 'Northeast US' },
    { value: 'Southeast', label: 'Southeast US' },
    { value: 'Midwest', label: 'Midwest US' },
    { value: 'Southwest', label: 'Southwest US' },
    { value: 'West', label: 'West US' },
    { value: 'California', label: 'California' },
    { value: 'Canada', label: 'Canada' },
    { value: 'International', label: 'International' },
  ],
  status: [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'pending', label: 'Pending Review' },
  ],
  eligibility_geo: [
    { value: 'national', label: 'National' },
    { value: 'state', label: 'State-specific' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
  ],
  format: [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'video', label: 'Video' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'tool', label: 'Interactive Tool' },
    { value: 'website', label: 'Website' },
  ],
};

function FacetSection({ 
  title, 
  options, 
  selected = [], 
  onChange, 
  icon 
}: { 
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
  icon?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(title === 'Type' || title === 'Topics');
  const sectionId = `facet-${title.toLowerCase().replace(/\s+/g, '-')}`;

  const handleToggle = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, value]);
    } else {
      onChange(selected.filter(v => v !== value));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-0 h-auto font-medium"
          aria-expanded={isOpen}
          aria-controls={`${sectionId}-content`}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2">
            {icon && <span aria-hidden="true">{icon}</span>}
            {title}
            {selected.length > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 text-xs"
                aria-label={`${selected.length} ${title.toLowerCase()} filters selected`}
              >
                {selected.length}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2" id={`${sectionId}-content`}>
        <div role="group" aria-labelledby={`${sectionId}-heading`}>
          <div id={`${sectionId}-heading`} className="sr-only">{title} filter options</div>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${sectionId}-${option.value}`}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) => handleToggle(option.value, checked as boolean)}
                aria-describedby={`${sectionId}-${option.value}-desc`}
              />
              <Label
                htmlFor={`${sectionId}-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
              <div id={`${sectionId}-${option.value}-desc`} className="sr-only">
                {selected.includes(option.value) ? 'Selected' : 'Not selected'}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FacetPanelContent({ 
  value, 
  onChange, 
  showStatus, 
  showEligibilityGeo, 
  showFormat, 
  hasLocationAvailable 
}: Omit<FacetPanelProps, 'mobile' | 'open' | 'onOpenChange' | 'className'>) {
  const handleFilterChange = (key: keyof FacetFilters, newValue: any) => {
    onChange({ ...value, [key]: newValue });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Object.values(value).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  );

  return (
    <div className="space-y-6">
      {/* Note: Search is handled by parent component with debouncing */}

      <Separator />

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearAllFilters} 
          className="w-full"
          aria-label="Clear all applied filters"
        >
          <X className="h-4 w-4 mr-2" aria-hidden="true" />
          Clear All Filters
        </Button>
      )}

      {/* Core Facets */}
      <div className="space-y-4">
        <FacetSection
          title="Type"
          options={FILTER_OPTIONS.type}
          selected={value.type || []}
          onChange={(values) => handleFilterChange('type', values)}
        />

        <FacetSection
          title="Topics"
          options={FILTER_OPTIONS.topics}
          selected={value.topics || []}
          onChange={(values) => handleFilterChange('topics', values)}
        />

        <FacetSection
          title="Crop"
          options={FILTER_OPTIONS.crop}
          selected={value.crop || []}
          onChange={(values) => handleFilterChange('crop', values)}
        />

        <FacetSection
          title="System Type"
          options={FILTER_OPTIONS.system_type}
          selected={value.system_type || []}
          onChange={(values) => handleFilterChange('system_type', values)}
        />

        <FacetSection
          title="Audience"
          options={FILTER_OPTIONS.audience}
          selected={value.audience || []}
          onChange={(values) => handleFilterChange('audience', values)}
        />

        <FacetSection
          title="Cost"
          options={FILTER_OPTIONS.cost}
          selected={value.cost || []}
          onChange={(values) => handleFilterChange('cost', values)}
        />

        <FacetSection
          title="Region"
          options={FILTER_OPTIONS.region}
          selected={value.region || []}
          onChange={(values) => handleFilterChange('region', values)}
        />
      </div>

      {/* Optional Type-Specific Facets */}
      {(showStatus || showEligibilityGeo || showFormat) && (
        <>
          <Separator />
          <div className="space-y-4">
            {showStatus && (
              <FacetSection
                title="Status"
                options={FILTER_OPTIONS.status}
                selected={value.status || []}
                onChange={(values) => handleFilterChange('status', values)}
              />
            )}

            {showEligibilityGeo && (
              <FacetSection
                title="Eligibility Geography"
                options={FILTER_OPTIONS.eligibility_geo}
                selected={value.eligibility_geo || []}
                onChange={(values) => handleFilterChange('eligibility_geo', values)}
              />
            )}

            {showFormat && (
              <FacetSection
                title="Format"
                options={FILTER_OPTIONS.format}
                selected={value.format || []}
                onChange={(values) => handleFilterChange('format', values)}
              />
            )}
          </div>
        </>
      )}

      {/* Location Toggle */}
      {hasLocationAvailable && (
        <>
          <Separator />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-location"
              checked={value.has_location || false}
              onCheckedChange={(checked) => handleFilterChange('has_location', checked)}
              aria-describedby="has-location-desc"
            />
            <Label htmlFor="has-location" className="text-sm font-normal cursor-pointer flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Has Location Data
            </Label>
            <div id="has-location-desc" className="sr-only">
              Filter to show only resources that have geographic location data
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function FacetPanel({
  value,
  onChange,
  className,
  mobile = false,
  open,
  onOpenChange,
  showStatus,
  showEligibilityGeo,
  showFormat,
  hasLocationAvailable
}: FacetPanelProps) {
  const activeFiltersCount = Object.values(value).flat().filter(Boolean).length;

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            aria-label={`Open filters panel${activeFiltersCount > 0 ? `, ${activeFiltersCount} filters applied` : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2"
                aria-label={`${activeFiltersCount} filters applied`}
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80" 
          role="dialog" 
          aria-labelledby="filter-panel-title"
        >
          <SheetHeader>
            <SheetTitle id="filter-panel-title">Filter Resources</SheetTitle>
          </SheetHeader>
          <div className="mt-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <FacetPanelContent
              value={value}
              onChange={onChange}
              showStatus={showStatus}
              showEligibilityGeo={showEligibilityGeo}
              showFormat={showFormat}
              hasLocationAvailable={hasLocationAvailable}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version - always open collapsible
  return (
    <div 
      className={cn("w-80 space-y-6 p-6 bg-white border rounded-lg", className)}
      role="complementary"
      aria-label="Resource filters"
    >
      <div className="flex items-center justify-between">
        <h3 
          className="font-semibold text-gray-900"
          id="filter-panel-heading"
        >
          Filter Resources
        </h3>
        <Filter className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
      
      <FacetPanelContent
        value={value}
        onChange={onChange}
        showStatus={showStatus}
        showEligibilityGeo={showEligibilityGeo}
        showFormat={showFormat}
        hasLocationAvailable={hasLocationAvailable}
      />
    </div>
  );
}