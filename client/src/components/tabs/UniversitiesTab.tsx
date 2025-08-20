import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, MapPin, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface University {
  id: string;
  type: 'universities';
  title: string;
  summary: string;
  data: {
    city: string;
    state: string;
    country: string;
    programName: string;
    urls: {
      site: string;
      extension?: string;
    };
  };
}

const MOCK_UNIVERSITIES: University[] = [
  {
    id: 'ucd-1',
    type: 'universities',
    title: 'University of California, Davis',
    summary: 'Leading research in controlled environment agriculture and greenhouse technology development.',
    data: {
      city: 'Davis',
      state: 'CA',
      country: 'USA',
      programName: 'Controlled Environment Agriculture Program',
      urls: {
        site: 'https://ucdavis.edu',
        extension: 'https://extension.ucdavis.edu'
      }
    }
  },
  {
    id: 'cornell-1',
    type: 'universities',
    title: 'Cornell University',
    summary: 'Innovative greenhouse research and extension services for sustainable agriculture.',
    data: {
      city: 'Ithaca',
      state: 'NY',
      country: 'USA',
      programName: 'Greenhouse and Floriculture Program',
      urls: {
        site: 'https://cornell.edu',
        extension: 'https://cce.cornell.edu'
      }
    }
  },
  {
    id: 'ncsu-1',
    type: 'universities',
    title: 'North Carolina State University',
    summary: 'Comprehensive greenhouse management research and grower education programs.',
    data: {
      city: 'Raleigh',
      state: 'NC',
      country: 'USA',
      programName: 'Greenhouse and Nursery Extension',
      urls: {
        site: 'https://ncsu.edu',
        extension: 'https://extension.ncsu.edu'
      }
    }
  },
  {
    id: 'osu-1',
    type: 'universities',
    title: 'Ohio State University',
    summary: 'Advanced greenhouse technology and sustainable production system research.',
    data: {
      city: 'Columbus',
      state: 'OH',
      country: 'USA',
      programName: 'Greenhouse Program',
      urls: {
        site: 'https://osu.edu',
        extension: 'https://extension.osu.edu'
      }
    }
  },
  {
    id: 'uga-1',
    type: 'universities',
    title: 'University of Georgia',
    summary: 'Climate-controlled agriculture research and extension for southeastern growers.',
    data: {
      city: 'Athens',
      state: 'GA',
      country: 'USA',
      programName: 'Controlled Environment Agriculture',
      urls: {
        site: 'https://uga.edu',
        extension: 'https://extension.uga.edu'
      }
    }
  },
  {
    id: 'purdue-1',
    type: 'universities',
    title: 'Purdue University',
    summary: 'Innovative greenhouse automation and precision agriculture research.',
    data: {
      city: 'West Lafayette',
      state: 'IN',
      country: 'USA',
      programName: 'Greenhouse Technology Program',
      urls: {
        site: 'https://purdue.edu',
        extension: 'https://extension.purdue.edu'
      }
    }
  },
  {
    id: 'uariz-1',
    type: 'universities',
    title: 'University of Arizona',
    summary: 'Desert greenhouse technology and water-efficient production systems.',
    data: {
      city: 'Tucson',
      state: 'AZ',
      country: 'USA',
      programName: 'Controlled Environment Agriculture Center',
      urls: {
        site: 'https://arizona.edu',
        extension: 'https://extension.arizona.edu'
      }
    }
  },
  {
    id: 'wsu-1',
    type: 'universities',
    title: 'Washington State University',
    summary: 'Pacific Northwest greenhouse research and sustainable growing practices.',
    data: {
      city: 'Pullman',
      state: 'WA',
      country: 'USA',
      programName: 'Greenhouse and Nursery Program',
      urls: {
        site: 'https://wsu.edu',
        extension: 'https://extension.wsu.edu'
      }
    }
  }
];

const US_REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'northeast', label: 'Northeast', states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'] },
  { id: 'southeast', label: 'Southeast', states: ['DE', 'MD', 'VA', 'WV', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'] },
  { id: 'midwest', label: 'Midwest', states: ['OH', 'MI', 'IN', 'WI', 'IL', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'] },
  { id: 'southwest', label: 'Southwest', states: ['TX', 'OK', 'NM', 'AZ'] },
  { id: 'west', label: 'West', states: ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'UT', 'NV', 'CA', 'AK', 'HI'] }
];

interface UniversitiesTabProps {
  onAnalyticsEvent: (eventName: string, payload: any) => void;
}

export default function UniversitiesTab({ onAnalyticsEvent }: UniversitiesTabProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['all']);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter universities by region
  const filteredUniversities = useMemo(() => {
    if (selectedRegions.includes('all')) {
      return MOCK_UNIVERSITIES;
    }
    
    return MOCK_UNIVERSITIES.filter(university => {
      return selectedRegions.some(regionId => {
        const region = US_REGIONS.find(r => r.id === regionId);
        return region?.states?.includes(university.data.state);
      });
    });
  }, [selectedRegions]);

  // Handle region filter change
  const handleRegionChange = useCallback((regionId: string) => {
    if (regionId === 'all') {
      setSelectedRegions(['all']);
    } else {
      setSelectedRegions(prev => {
        const withoutAll = prev.filter(id => id !== 'all');
        if (withoutAll.includes(regionId)) {
          const newRegions = withoutAll.filter(id => id !== regionId);
          return newRegions.length === 0 ? ['all'] : newRegions;
        } else {
          return [...withoutAll, regionId];
        }
      });
    }
  }, []);

  // Handle university card click
  const handleUniversityClick = useCallback((university: University) => {
    setSelectedUniversity(university);
    setIsModalOpen(true);
    
    // Fire analytics event
    onAnalyticsEvent('resource_open', {
      resource_id: university.id,
      resource_type: 'university',
      resource_title: university.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close with escape key
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUniversity(null);
  }, []);

  return (
    <div 
      role="tabpanel" 
      id="universities-panel" 
      aria-labelledby="universities-tab"
      className="space-y-6"
    >
      {/* Region Filter */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Filter by Region</h3>
        <div className="flex flex-wrap gap-2">
          {US_REGIONS.map(region => {
            const isSelected = selectedRegions.includes(region.id);
            return (
              <button
                key={region.id}
                onClick={() => handleRegionChange(region.id)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
                aria-pressed={isSelected}
              >
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredUniversities.length} {filteredUniversities.length === 1 ? 'university' : 'universities'} found
      </div>

      {/* University Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUniversities.map(university => (
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
                {university.data.city}, {university.data.state}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 mb-3">
                {university.data.programName}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {university.summary}
              </p>
            </CardContent>
          </Card>
        ))}
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
                  {selectedUniversity.data.city}, {selectedUniversity.data.state}, {selectedUniversity.data.country}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Program</h4>
                  <p className="text-gray-700">{selectedUniversity.data.programName}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700">{selectedUniversity.summary}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1">
                    <a 
                      href={selectedUniversity.data.urls.site}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Visit Website
                    </a>
                  </Button>
                  {selectedUniversity.data.urls.extension && (
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