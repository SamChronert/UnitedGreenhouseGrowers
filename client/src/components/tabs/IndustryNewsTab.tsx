import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParamState } from '@/hooks/useQueryParams';
import { useResources } from '@/hooks/useResources';
import SearchBox from '@/components/SearchBox';
import { type Resource, type ResourceFilters } from '@shared/schema';
import { trackTabView, trackResourceClick } from '@/lib/analytics';
import { 
  Newspaper, 
  ExternalLink,
  Clock,
  Globe,
  Users,
  Mail,
  BookOpen,
  Loader2,
  Grid3X3,
  List
} from 'lucide-react';

interface IndustryNewsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const FREQUENCIES = [
  'Daily',
  'Weekly', 
  'Monthly',
  'Quarterly'
];

export default function IndustryNewsTab({ onAnalyticsEvent }: IndustryNewsTabProps) {
  // URL state management
  const [viewMode, setViewMode] = useParamState('view', 'list');
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    frequency: 'all'
  });
  
  // Handle view mode change
  const handleViewModeChange = useCallback((mode: string) => {
    setViewMode(mode);
  }, [setViewMode]);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('industry-news', 'Industry News');
    onAnalyticsEvent?.('tab_view', { tab: 'industry-news' });
  }, [onAnalyticsEvent]);

  // Data fetching
  const { data, isLoading, error } = useResources({
    type: 'industry_news',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
  });

  const newsSources = data?.items || [];

  // Handle news source click
  const handleNewsSourceClick = useCallback((source: Resource, action: 'visit' | 'subscribe') => {
    trackResourceClick(source.id, 'news_source', source.title);
    onAnalyticsEvent?.(action === 'visit' ? 'news_source_visit' : 'news_source_subscribe', {
      source_id: source.id,
      source_name: source.title,
      source_frequency: source.data?.frequency
    });
    
    const url = action === 'subscribe' && source.data?.subscribeUrl 
      ? source.data.subscribeUrl 
      : source.url || source.data?.url;
      
    if (url) {
      window.open(url, '_blank');
    }
  }, [onAnalyticsEvent]);

  // Get frequency badge variant
  const getFrequencyBadgeVariant = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return 'destructive';
      case 'Weekly': return 'default';
      case 'Monthly': return 'secondary';
      case 'Quarterly': return 'outline';
      default: return 'outline';
    }
  };

  // Group sources by frequency
  const groupedSources = useMemo(() => {
    const groups = FREQUENCIES.reduce((acc, freq) => {
      acc[freq] = newsSources.filter(source => source.data?.frequency === freq);
      return acc;
    }, {} as Record<string, Resource[]>);
    
    // Add "Other" category for sources without specified frequency
    const other = newsSources.filter(source => !FREQUENCIES.includes(source.data?.frequency));
    if (other.length > 0) {
      groups['Other'] = other;
    }
    
    return groups;
  }, [newsSources]);

  return (
    <div 
      role="tabpanel" 
      id="industry-news-panel" 
      aria-labelledby="industry-news-tab"
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-orange-900 mb-2">Industry News Sources</h2>
        <p className="text-orange-800">
          Connect with trusted greenhouse industry news sources and publications to stay updated on trends, research, and developments.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search news sources by name or description..."
            resources={newsSources}
            resourceType="industry_news"
            className="max-w-md"
          />
          
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={handleViewModeChange}>
            <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-4">
          
          <Select
            value={filters.frequency}
            onValueChange={(value) => setFilters(prev => ({ ...prev, frequency: value }))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {FREQUENCIES.map(freq => (
                <SelectItem key={freq} value={freq}>{freq}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-gray-600">
          {newsSources.length} {newsSources.length === 1 ? 'source' : 'sources'} found
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load news sources</h3>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      ) : newsSources.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news sources found</h3>
          <p className="text-gray-600">Try adjusting your search to find industry publications.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-8">
          {Object.entries(groupedSources)
            .filter(([_, sources]) => sources.length > 0)
            .map(([frequency, sources]) => (
              <div key={frequency}>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{frequency} Publications</h3>
                  <Badge variant={getFrequencyBadgeVariant(frequency)} className="text-xs">
                    {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sources.map(source => (
                    <Card key={source.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                            <Newspaper className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-clamp-2">{source.title}</CardTitle>
                            {source.data?.sourceName && source.data.sourceName !== source.title && (
                              <p className="text-sm text-gray-600 mt-1">{source.data.sourceName}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {source.summary || source.data?.description || 'Industry publication providing news and insights.'}
                        </p>
                        
                        <div className="space-y-3">
                          {/* Frequency Badge */}
                          {source.data?.frequency && (
                            <div className="flex items-center gap-2">
                              <Badge variant={getFrequencyBadgeVariant(source.data.frequency)}>
                                <Clock className="h-3 w-3 mr-1" />
                                {source.data.frequency}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleNewsSourceClick(source, 'visit')}
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Visit
                            </Button>
                            
                            {source.data?.subscribeUrl && (
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleNewsSourceClick(source, 'subscribe')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Subscribe
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsSources.map(source => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Newspaper className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2">{source.title}</CardTitle>
                    {source.data?.sourceName && source.data.sourceName !== source.title && (
                      <p className="text-sm text-gray-600 mt-1">{source.data.sourceName}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {source.summary || source.data?.description || 'Industry publication providing news and insights.'}
                </p>
                
                <div className="space-y-3">
                  {source.data?.frequency && (
                    <div className="flex items-center gap-2">
                      <Badge variant={getFrequencyBadgeVariant(source.data.frequency)}>
                        <Clock className="h-3 w-3 mr-1" />
                        {source.data.frequency}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleNewsSourceClick(source, 'visit')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                    
                    {source.data?.subscribeUrl && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleNewsSourceClick(source, 'subscribe')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}