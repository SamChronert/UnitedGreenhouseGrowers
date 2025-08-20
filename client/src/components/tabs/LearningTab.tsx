import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useResources } from '@/hooks/useResources';
import SearchBox from '@/components/SearchBox';
import { type Resource, type ResourceFilters } from '@shared/schema';
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
  Grid3X3,
  List,
  ExternalLink,
  Loader2
} from 'lucide-react';

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

const LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced'
];

const FORMATS = [
  'Online',
  'In-person',
  'Hybrid'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French'
];

export default function LearningTab({ onAnalyticsEvent }: LearningTabProps) {
  const { getParam, setParam } = useQueryParams();
  
  // Get view mode from URL params
  const viewMode = getParam('view') || 'grid';
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    costType: 'all',
    level: 'all',
    format: 'all',
    language: 'all'
  });

  // Track tab view on mount
  useEffect(() => {
    trackTabView('learning', 'Learning');
    onAnalyticsEvent?.('tab_view', { tab: 'learning' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error } = useResources({
    type: 'learning',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
  });

  const courses = data?.items || [];

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: string) => {
    setParam('view', mode);
  }, [setParam]);

  // Handle course click
  const handleCourseClick = useCallback((course: Resource) => {
    trackResourceClick(course.id, 'learning', course.title);
    onAnalyticsEvent?.('course_click', {
      course_id: course.id,
      course_name: course.title,
      provider: course.data?.provider,
      level: course.data?.level,
      cost_type: course.data?.costType
    });
    
    if (course.url || course.data?.url) {
      window.open(course.url || course.data?.url, '_blank');
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
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Learning & Development</h2>
        <p className="text-blue-800">
          Expand your greenhouse expertise with courses, certifications, and training resources from leading institutions.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search courses by title, provider, or topic..."
            resources={courses}
            resourceType="learning"
            className="max-w-md"
          />
          
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={handleViewModeChange}>
            <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
          
          <Select
            value={filters.level}
            onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.format}
            onValueChange={(value) => setFilters(prev => ({ ...prev, format: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {FORMATS.map(format => (
                <SelectItem key={format} value={format}>{format}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.language}
            onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-gray-600">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load courses</h3>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to find learning resources.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {courses.map(course => (
            <Card 
              key={course.id} 
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => handleCourseClick(course)}
            >
              {viewMode === 'grid' ? (
                <>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{course.data?.provider || 'Provider'}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.summary || 'Course description not available.'}
                    </p>
                    
                    <div className="space-y-3">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {course.data?.level && (
                          <Badge variant={getLevelBadgeVariant(course.data.level)}>
                            {course.data.level}
                          </Badge>
                        )}
                        {course.data?.costType && (
                          <Badge variant={getCostBadgeVariant(course.data.costType)}>
                            {course.data.costType}
                          </Badge>
                        )}
                        {course.data?.format && (
                          <Badge variant="outline">
                            {course.data.format === 'Online' ? <Globe className="h-3 w-3 mr-1" /> : 
                             course.data.format === 'In-person' ? <MapPin className="h-3 w-3 mr-1" /> :
                             <Globe className="h-3 w-3 mr-1" />}
                            {course.data.format}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Course details */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        {course.data?.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{course.data.duration}</span>
                          </div>
                        )}
                        {course.data?.priceTypical && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{course.data.priceTypical}</span>
                          </div>
                        )}
                        {course.data?.credential && (
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>{course.data.credential}</span>
                          </div>
                        )}
                        {course.data?.languages && course.data.languages.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{course.data.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
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
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}