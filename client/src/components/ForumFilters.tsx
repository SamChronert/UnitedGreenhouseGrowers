import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForumCategory } from "@shared/schema";

interface ForumFiltersProps {
  filters: {
    region: string;
    category: string;
  };
  setFilters: (filters: {
    region: string;
    category: string;
  }) => void;
}

// US Regions list (from existing resource filters)
const US_REGIONS = [
  "Northeast US",
  "Southeast US",
  "Midwest US", 
  "Southwest US",
  "West US",
  "California"
];



export default function ForumFilters({ filters, setFilters }: ForumFiltersProps) {

  const handleRegionChange = (value: string) => {
    const newRegion = value === "all" ? "" : value;
    setFilters({
      region: newRegion,
      category: filters.category,
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
          Region
        </label>
        <Select value={filters.region || "all"} onValueChange={handleRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder="All regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {US_REGIONS.map(region => (
              <SelectItem key={region} value={region}>
                {region}
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