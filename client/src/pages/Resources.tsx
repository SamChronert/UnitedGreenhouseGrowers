import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Grid, List, Heart, Plus, Book } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";

// Import new components for testing
import ResourceCard from "@/components/resources/ResourceCard";
import ResourceRow from "@/components/resources/ResourceRow";
import FacetPanel from "@/components/resources/FacetPanel";
import ProfileToggle from "@/components/resources/ProfileToggle";
import MapToggle from "@/components/resources/MapToggle";
import EmptyState from "@/components/common/EmptyState";

export default function Resources() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Component testing state
  const [facetFilters, setFacetFilters] = useState({});
  const [profileEnabled, setProfileEnabled] = useState(false);
  const [isMapView, setIsMapView] = useState(false);

  // Mock data for component testing
  const mockResources = [
    {
      id: "1",
      title: "USDA Greenhouse Management Guide",
      summary: "Comprehensive guide to greenhouse management practices from the USDA",
      type: "education" as const,
      topics: ["management", "best-practices"],
      crop: ["vegetables", "herbs"],
      system_type: ["controlled-environment"],
      region: "US",
      cost: "free",
      ugga_verified: true,
      quality_score: 95,
      has_location: false,
      url: "https://usda.gov/guide"
    },
    {
      id: "2", 
      title: "Cornell Extension - Greenhouse Production",
      summary: "Research-based greenhouse production techniques and disease management",
      type: "university" as const,
      topics: ["disease-management", "research"],
      crop: ["tomatoes", "peppers"],
      region: "Northeast",
      cost: "free",
      ugga_verified: true,
      has_location: true,
      url: "https://cornell.edu/extension"
    },
    {
      id: "3",
      title: "Climate Controller Pro",
      summary: "Advanced climate control system for precision greenhouse management",
      type: "tool" as const,
      topics: ["climate-control", "automation"],
      cost: "paid",
      has_location: false,
      last_verified_at: new Date("2023-01-01") // Stale
    }
  ];

  const mockProfile = {
    crops: ["tomatoes", "peppers", "leafy-greens"],
    system_types: ["hydroponics", "controlled-environment"],
    regions: ["Northeast", "US"],
    experience_level: "intermediate",
    operation_type: "commercial"
  };

  const filters = ["All", "Organizations", "Events", "Tools"];

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
              <Link href="/dashboard/resources/saved">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Saved
                </Button>
              </Link>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Suggest Resource
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar and Controls */}
        <div className="mb-8 space-y-4">
          {/* Facet Filters Container */}
          <Card className="shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className={selectedFilter === filter 
                        ? "text-white shadow-sm" 
                        : "border-2 hover:border-gray-300"
                      }
                      style={selectedFilter === filter 
                        ? {backgroundColor: 'var(--color-clay)'} 
                        : {}
                      }
                    >
                      {filter}
                    </Button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">View:</span>
                  <div className="flex border rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`rounded-none border-0 ${viewMode === 'grid' ? 'text-white' : ''}`}
                      style={viewMode === 'grid' ? {backgroundColor: 'var(--color-clay)'} : {}}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`rounded-none border-0 ${viewMode === 'list' ? 'text-white' : ''}`}
                      style={viewMode === 'list' ? {backgroundColor: 'var(--color-clay)'} : {}}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Testing Area */}
        <div className="mb-8 space-y-8">
          <Card className="shadow-sm bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Component Testing - Will be removed after verification</h3>
              <p className="text-sm text-yellow-700">Testing the new Resource Library UI components with mock data</p>
            </CardContent>
          </Card>

          {/* Test Layout */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - FacetPanel & ProfileToggle */}
            <div className="lg:col-span-1 space-y-4">
              <FacetPanel
                value={facetFilters}
                onChange={setFacetFilters}
                showStatus={true}
                showFormat={true}
                hasLocationAvailable={true}
              />
              
              <ProfileToggle
                isEnabled={profileEnabled}
                onToggle={setProfileEnabled}
                onApply={(profile) => console.log("Apply profile:", profile)}
                onClear={() => console.log("Clear profile")}
                userProfile={mockProfile}
              />
              
              <MapToggle
                hasLocationAvailable={true}
                isMapView={isMapView}
                onToggleView={setIsMapView}
                locationCount={2}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* ResourceCard Grid */}
              <div>
                <h3 className="font-medium mb-4">ResourceCard Components (Grid View)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockResources.map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      onToggleFavorite={(id, on) => console.log("Toggle favorite:", id, on)}
                      onOpen={(id) => console.log("Open resource:", id)}
                      isFavorited={index === 0}
                      showBadges={true}
                    />
                  ))}
                </div>
              </div>

              {/* ResourceRow Table */}
              <div>
                <h3 className="font-medium mb-4">ResourceRow Components (List View)</h3>
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
                    {mockResources.map((resource, index) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        onToggleFavorite={(id, on) => console.log("Toggle favorite:", id, on)}
                        onOpen={(id) => console.log("Open resource:", id)}
                        isFavorited={index === 1}
                        showBadges={true}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* EmptyState */}
              <div>
                <h3 className="font-medium mb-4">EmptyState Component</h3>
                <EmptyState
                  title="No resources found"
                  body="We couldn't find any resources matching your current filters. Try adjusting your search criteria or suggest a new resource."
                  icon={<Book className="h-10 w-10 text-gray-400" />}
                  ctaText="Suggest a Resource"
                  onCtaClick={() => console.log("Suggest resource clicked")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Footer Placeholder */}
        <div className="mt-12 flex justify-center">
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Pagination controls will be implemented in the next task
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}