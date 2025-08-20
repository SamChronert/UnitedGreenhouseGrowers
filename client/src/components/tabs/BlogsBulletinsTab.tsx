import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useResources } from '@/hooks/useResources';
import { type Resource, type ResourceFilters, type BlogPost } from '@shared/schema';
import { trackTabView, trackResourceClick } from '@/lib/analytics';
import { 
  FileText, 
  Calendar,
  ExternalLink,
  Search,
  BookOpen,
  Building,
  Clock,
  Loader2,
  Tag
} from 'lucide-react';

interface BlogsBulletinsTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const BULLETIN_SOURCES = [
  'University Extension',
  'Research Institution', 
  'Government Agency',
  'Industry Association',
  'Trade Publication'
];

const TOPIC_TAGS = [
  'Pest Management',
  'Disease Control',
  'Nutrition',
  'Climate Control',
  'Best Practices',
  'Regulations',
  'Sustainability',
  'Technology',
  'Economics'
];

export default function BlogsBulletinsTab({ onAnalyticsEvent }: BlogsBulletinsTabProps) {
  const { getParam, setParam } = useQueryParams();
  
  // Get active section from URL params
  const activeSection = getParam('section') || 'blogs';
  
  // State
  const [bulletinSearch, setBulletinSearch] = useState('');
  const [bulletinFilters, setBulletinFilters] = useState({
    source: 'all',
    topicTag: 'all'
  });

  // Track tab view on mount
  useEffect(() => {
    trackTabView('blogs-bulletins', 'Blogs & Bulletins');
    onAnalyticsEvent?.('tab_view', { tab: 'blogs-bulletins', section: activeSection });
  }, [onAnalyticsEvent, activeSection]);

  // Fetch blog posts from existing API
  const { data: blogPosts, isLoading: blogsLoading, error: blogsError } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Fetch bulletins from resources API
  const { data: bulletinsData, isLoading: bulletinsLoading, error: bulletinsError } = useResources({
    type: 'bulletins',
    query: bulletinSearch,
    filters: Object.fromEntries(Object.entries(bulletinFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
    enabled: activeSection === 'bulletins'
  });

  const bulletins = bulletinsData?.items || [];

  // Handle section change
  const handleSectionChange = useCallback((section: string) => {
    setParam('section', section);
  }, [setParam]);

  // Handle blog click
  const handleBlogClick = useCallback((blog: BlogPost) => {
    onAnalyticsEvent?.('blog_click', {
      blog_id: blog.id,
      blog_title: blog.title,
      blog_slug: blog.slug
    });
    
    // Navigate to blog post page
    window.location.href = `/blog/${blog.slug}`;
  }, [onAnalyticsEvent]);

  // Handle bulletin click
  const handleBulletinClick = useCallback((bulletin: Resource) => {
    trackResourceClick(bulletin.id, 'bulletin', bulletin.title);
    onAnalyticsEvent?.('bulletin_click', {
      bulletin_id: bulletin.id,
      bulletin_title: bulletin.title,
      source: bulletin.data?.source,
      topic_tags: bulletin.data?.topicTags
    });
    
    if (bulletin.url || bulletin.data?.url) {
      window.open(bulletin.url || bulletin.data?.url, '_blank');
    }
  }, [onAnalyticsEvent]);

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get excerpt from content
  const getExcerpt = (content: string, length: number = 120) => {
    const cleanContent = content.replace(/[#*`]/g, '').trim();
    return cleanContent.length > length 
      ? cleanContent.substring(0, length) + '...' 
      : cleanContent;
  };

  // Highlight search terms
  const highlightSearchTerms = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark className="bg-yellow-200">$1</mark>');
  };

  return (
    <div 
      role="tabpanel" 
      id="blogs-bulletins-panel" 
      aria-labelledby="blogs-bulletins-tab"
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">Blogs & Research Bulletins</h2>
        <p className="text-purple-800">
          Stay informed with UGGA insights and curated industry research bulletins.
        </p>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={handleSectionChange}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="blogs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            UGGA Blogs
          </TabsTrigger>
          <TabsTrigger value="bulletins" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Industry Bulletins
          </TabsTrigger>
        </TabsList>

        {/* UGGA Blogs Section */}
        <TabsContent value="blogs" className="space-y-6">
          {blogsLoading ? (
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
          ) : blogsError ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load blog posts</h3>
              <p className="text-gray-600">Please check your connection and try again.</p>
            </div>
          ) : !blogPosts || blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600">Check back soon for UGGA insights and updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(blog => (
                <Card 
                  key={blog.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleBlogClick(blog)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">{blog.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {getExcerpt(blog.contentMd)}
                    </p>
                    
                    <div className="mt-4">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        UGGA Blog
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Industry Bulletins Section */}
        <TabsContent value="bulletins" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search bulletins by topic or title..."
                value={bulletinSearch}
                onChange={(e) => setBulletinSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select
                value={bulletinFilters.source}
                onValueChange={(value) => setBulletinFilters(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {BULLETIN_SOURCES.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={bulletinFilters.topicTag}
                onValueChange={(value) => setBulletinFilters(prev => ({ ...prev, topicTag: value }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {TOPIC_TAGS.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          {!bulletinsLoading && (
            <div className="text-sm text-gray-600">
              {bulletins.length} {bulletins.length === 1 ? 'bulletin' : 'bulletins'} found
            </div>
          )}

          {/* Bulletins Content */}
          {bulletinsLoading ? (
            <div className="space-y-4">
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
          ) : bulletinsError ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load bulletins</h3>
              <p className="text-gray-600">Please check your connection and try again.</p>
            </div>
          ) : bulletins.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bulletins found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to find research bulletins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bulletins.map(bulletin => (
                <Card 
                  key={bulletin.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleBulletinClick(bulletin)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <BookOpen className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 
                              className="text-lg font-semibold"
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerms(bulletin.title, bulletinSearch)
                              }}
                            />
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {bulletin.data?.source && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span>{bulletin.data.source}</span>
                                </div>
                              )}
                              {bulletin.data?.publishedAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(bulletin.data.publishedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p 
                          className="text-gray-600 text-sm mb-3 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerms(
                              bulletin.summary || 'Bulletin description not available.',
                              bulletinSearch
                            )
                          }}
                        />
                        
                        {/* Topic Tags */}
                        {bulletin.data?.topicTags && bulletin.data.topicTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {bulletin.data.topicTags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}