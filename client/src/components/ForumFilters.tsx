import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForumCategory } from "@shared/schema";

interface ForumFiltersProps {
  filters: {
    state: string;
    county: string;
    category: string;
  };
  setFilters: (filters: {
    state: string;
    county: string;
    category: string;
  }) => void;
}

// US States list
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Sample counties for demonstration - in production, these would come from an API
const COUNTIES_BY_STATE: Record<string, string[]> = {
  "Ohio": ["Franklin", "Cuyahoga", "Hamilton", "Lucas", "Summit", "Montgomery", "Stark", "Butler", "Lorain", "Mahoning"],
  "California": ["Los Angeles", "San Diego", "Orange", "Riverside", "San Bernardino", "Santa Clara", "Alameda", "Sacramento", "Contra Costa", "Fresno"],
  "Texas": ["Harris", "Dallas", "Tarrant", "Bexar", "Travis", "Collin", "Fort Bend", "Denton", "El Paso", "Williamson"],
  "Florida": ["Miami-Dade", "Broward", "Palm Beach", "Hillsborough", "Orange", "Pinellas", "Duval", "Lee", "Polk", "Brevard"],
  "New York": ["Kings", "Queens", "New York", "Suffolk", "Bronx", "Nassau", "Westchester", "Erie", "Monroe", "Richmond"],
  // Add more states as needed
};

export default function ForumFilters({ filters, setFilters }: ForumFiltersProps) {
  const availableCounties = filters.state ? COUNTIES_BY_STATE[filters.state] || [] : [];

  const handleStateChange = (value: string) => {
    const newState = value === "all" ? "" : value;
    setFilters({
      state: newState,
      county: "", // Reset county when state changes
      category: filters.category,
    });
  };

  const handleCountyChange = (value: string) => {
    setFilters({
      ...filters,
      county: value === "all" ? "" : value,
    });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value === "all" ? "" : value,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-1 min-w-48">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          State
        </label>
        <Select value={filters.state || "all"} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map(state => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          County
        </label>
        <Select 
          value={filters.county || "all"} 
          onValueChange={handleCountyChange}
          disabled={!filters.state}
        >
          <SelectTrigger>
            <SelectValue placeholder="All counties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Counties</SelectItem>
            {availableCounties.map(county => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(ForumCategory).map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}