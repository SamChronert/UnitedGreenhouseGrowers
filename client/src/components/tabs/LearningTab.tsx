import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useParamState } from '@/hooks/useQueryParams';
import { useResources } from '@/hooks/useResources';
import SearchBox from '@/components/SearchBox';
import { type Resource, type ResourceFilters } from '@/hooks/useResources';
import { trackTabView, trackResourceClick } from '@/lib/analytics';
import { 
  GraduationCap, 
  Clock, 
  Globe, 
  MapPin, 
  DollarSign, 
  Award, 
  Users,
  BookOpen,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface LearningTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const LEARNING_CATEGORIES = [
  'Technical',
  'Business', 
  'Certification',
  'Safety',
  'Sustainability'
];

const COST_TYPES = [
  'Free',
  'Paid',
  'Freemium'
];

// Format categories as specified in requirements
const FORMAT_CATEGORIES = [
  'Online Courses',
  'Certifications', 
  'Workshops',
  'Webinars'
];


export default function LearningTab({ onAnalyticsEvent }: LearningTabProps) {
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    costType: 'all'
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ugga-learning-sections-expanded');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { [FORMAT_CATEGORIES[0]]: true };
      }
    }
    return { [FORMAT_CATEGORIES[0]]: true };
  });

  // Track tab view on mount
  useEffect(() => {
    trackTabView('learning');
    onAnalyticsEvent?.('tab_view', { tab: 'learning' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error } = useResources({
    type: 'learning',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
  });

  const courses = data?.items || [];

  // Handle resource click for modal
  const handleResourceClick = useCallback((resource: Resource) => {
    setSelectedResource(resource);
    setResourceModalOpen(true);
    trackResourceClick(resource.id, 'learning', resource.title);
    onAnalyticsEvent?.('resource_open', {
      resource_id: resource.id,
      resource_type: 'learning',
      resource_title: resource.title
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setResourceModalOpen(false);
    setSelectedResource(null);
  }, []);

  // Handle external link click from modal
  const handleExternalLinkClick = useCallback((resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      onAnalyticsEvent?.('learning_external_click', {
        resource_id: resource.id,
        resource_type: 'learning',
        resource_title: resource.title
      });
    }
  }, [onAnalyticsEvent]);
  
  // Group courses by format
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    
    // Initialize all groups
    FORMAT_CATEGORIES.forEach(format => {
      groups[format] = [];
    });
    
    // Group courses by their format
    courses.forEach(course => {
      const format = course.data?.format || course.data?.type;
      let targetGroup = 'Online Courses'; // default
      
      // Map course format/type to our categories
      if (format) {
        const formatLower = format.toLowerCase();
        if (formatLower.includes('certification') || formatLower.includes('certificate')) {
          targetGroup = 'Certifications';
        } else if (formatLower.includes('workshop')) {
          targetGroup = 'Workshops';
        } else if (formatLower.includes('webinar')) {
          targetGroup = 'Webinars';
        } else if (formatLower.includes('online') || formatLower.includes('course')) {
          targetGroup = 'Online Courses';
        }
      }
      
      groups[targetGroup].push(course);
    });
    
    return groups;
  }, [courses]);
  
  // Save expanded sections to localStorage
  useEffect(() => {
    localStorage.setItem('ugga-learning-sections-expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);
  
  // Toggle section expanded state
  const toggleSection = useCallback((format: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  }, []);

  // View mode changes are now handled by routing

  // Handle course click
  const handleCourseClick = useCallback((course: Resource) => {
    trackResourceClick(course.id, 'learning', course.title);
    onAnalyticsEvent?.('course_click', {
      course_id: course.id,
      course_name: course.title,
      provider: course.data?.provider || 'Unknown',
      level: course.data?.level || 'Unknown',
      cost_type: course.data?.costType || 'Unknown'
    });
    
    if (course.url || (course.data && 'url' in course.data && course.data.url)) {
      window.open(course.url || (course.data as any).url, '_blank');
    }
  }, [onAnalyticsEvent]);

  // Get level badge variant
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner': return 'secondary';
      case 'Intermediate': return 'default';
      case 'Advanced': return 'destructive';
      default: return 'outline';
    }
  };

  // Get cost badge variant  
  const getCostBadgeVariant = (costType: string) => {
    switch (costType) {
      case 'Free': return 'secondary';
      case 'Paid': return 'destructive';
      case 'Freemium': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div 
      role="tabpanel" 
      id="learning-panel" 
      aria-labelledby="learning-tab"
      className="space-y-6"
    >

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {LEARNING_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.costType}
            onValueChange={(value) => setFilters(prev => ({ ...prev, costType: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Costs</SelectItem>
              {COST_TYPES.map(cost => (
                <SelectItem key={cost} value={cost}>{cost}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-gray-600">
          {courses.length} {courses.length === 1 ? 'learning resource' : 'learning resources'} found
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {FORMAT_CATEGORIES.map((format) => (
            <Card key={format} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load learning resources</h3>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No learning resources found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find learning resources.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {FORMAT_CATEGORIES.map((format) => {
            const sectionCourses = groupedCourses[format] || [];
            
            // Only show sections that have courses
            if (sectionCourses.length === 0) {
              return null;
            }
            
            return (
              <Collapsible
                key={format}
                open={expandedSections[format] || false}
                onOpenChange={() => toggleSection(format)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full p-6 justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {expandedSections[format] ? (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {format}
                        </h3>
                        <Badge variant="secondary">
                          {sectionCourses.length}
                        </Badge>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {sectionCourses.map(course => (
                          <Card 
                            key={course.id} 
                            className="hover:shadow-lg transition-shadow cursor-pointer flex"
                            onClick={() => handleResourceClick(course)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleResourceClick(course);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`View details for ${course.title}`}
                          >
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="flex-shrink-0">
                                      {course.image_url ? (
                                        <img 
                                          src={course.image_url}
                                          alt={`${course.title} logo`}
                                          className="h-9 w-9 object-cover rounded-lg border"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      ) : null}
                                      <div className={cn(
                                        "p-2 bg-blue-100 rounded-lg",
                                        course.image_url ? "hidden" : "block"
                                      )}>
                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold">{course.title}</h3>
                                      <p className="text-sm text-gray-600">{course.data?.provider || 'Provider'}</p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {course.summary || 'Course description not available.'}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {course.data?.level && (
                                      <Badge variant={getLevelBadgeVariant(course.data.level)} className="text-xs">
                                        {course.data.level}
                                      </Badge>
                                    )}
                                    {course.data?.costType && (
                                      <Badge variant={getCostBadgeVariant(course.data.costType)} className="text-xs">
                                        {course.data.costType}
                                      </Badge>
                                    )}
                                    {course.data?.format && (
                                      <Badge variant="outline" className="text-xs">
                                        {course.data.format}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2 ml-4">
                                  <ExternalLink className="h-4 w-4 text-gray-400" />
                                  {course.data?.duration && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{course.data.duration}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Learning Resource Details Modal */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-2xl z-[1000]">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedResource.image_url ? (
                    <img 
                      src={selectedResource.image_url}
                      alt={`${selectedResource.title} logo`}
                      className="h-6 w-6 object-cover rounded"
                    />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  )}
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {selectedResource.data?.provider && (
                    <Badge variant="outline">
                      {selectedResource.data.provider}
                    </Badge>
                  )}
                  {selectedResource.data?.level && (
                    <Badge variant="secondary">
                      {selectedResource.data.level}
                    </Badge>
                  )}
                  {selectedResource.data?.costType && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {selectedResource.data.costType}
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
                
                {selectedResource.data?.duration && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                    <p className="text-gray-700 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedResource.data.duration}
                    </p>
                  </div>
                )}
                
                {selectedResource.data?.format && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Format</h4>
                    <Badge variant="outline">{selectedResource.data.format}</Badge>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {selectedResource.url && (
                    <Button 
                      onClick={() => handleExternalLinkClick(selectedResource)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access Course
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