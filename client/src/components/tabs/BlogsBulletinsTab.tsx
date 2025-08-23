import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery } from '@tanstack/react-query';
import { useResources } from '@/hooks/useResources';
import { type Resource, type ResourceFilters } from '@/hooks/useResources';
import { trackTabView, trackResourceClick } from '@/lib/analytics';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentMd: string;
  publishedAt: string | Date;
}
import { 
  FileText, 
  Calendar,
  ExternalLink,
  Search,
  BookOpen,
  Building,
  Clock,
  Loader2,
  Tag,
  ChevronDown,
  ChevronRight
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
  // State for collapsible sections
  const [blogsExpanded, setBlogsExpanded] = useState(true);
  const [bulletinsExpanded, setBulletinsExpanded] = useState(true);
  
  // State
  const [bulletinSearch, setBulletinSearch] = useState('');
  const [bulletinFilters, setBulletinFilters] = useState({
    source: 'all',
    topicTag: 'all'
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('blogs-bulletins');
    onAnalyticsEvent?.('tab_view', { tab: 'blogs-bulletins' });
  }, [onAnalyticsEvent]);

  // Fetch blog posts from existing API
  const { data: blogPosts, isLoading: blogsLoading, error: blogsError } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Fetch bulletins from resources API
  const { data: bulletinsData, isLoading: bulletinsLoading, error: bulletinsError } = useResources({
    type: 'bulletins',
    query: bulletinSearch,
    filters: Object.fromEntries(Object.entries(bulletinFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters
  });

  const bulletins = bulletinsData?.items || [];


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
    setSelectedResource(bulletin);
    setResourceModalOpen(true);
    trackResourceClick(bulletin.id, 'bulletin', bulletin.title);
    onAnalyticsEvent?.('bulletin_click', {
      bulletin_id: bulletin.id,
      bulletin_title: bulletin.title,
      source: (bulletin.data as any)?.source || 'Unknown',
      topic_tags: (bulletin.data as any)?.topicTags || []
    });
  }, [onAnalyticsEvent]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setResourceModalOpen(false);
    setSelectedResource(null);
  }, []);

  // Handle external link click from modal
  const handleExternalLinkClick = useCallback((resource: Resource) => {
    if (resource.url || (resource.data && 'url' in resource.data && resource.data.url)) {
      window.open(resource.url || (resource.data as any).url, '_blank');
      onAnalyticsEvent?.('bulletin_external_click', {
        resource_id: resource.id,
        resource_type: 'bulletin',
        resource_title: resource.title
      });
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

      {/* UGGA Blogs Section */}
      <Collapsible open={blogsExpanded} onOpenChange={setBlogsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            style={{ backgroundColor: '#7C3AED' }}
            className="w-full p-4 justify-between text-lg font-semibold text-white hover:opacity-90 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              UGGA Blogs ({blogPosts?.length || 0})
            </div>
            {blogsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Blogs Content */}
          {blogsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
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
            <div className="space-y-3">
              {blogPosts.map(blog => (
                <Card 
                  key={blog.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleBlogClick(blog)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{blog.title}</h3>
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {getExcerpt(blog.contentMd)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            UGGA Blog
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Industry Bulletins Section */}
      <Collapsible open={bulletinsExpanded} onOpenChange={setBulletinsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            style={{ backgroundColor: '#059669' }}
            className="w-full p-4 justify-between text-lg font-semibold text-white hover:opacity-90 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5" />
              Extension ({bulletins.length})
            </div>
            {bulletinsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <div className="space-y-3">
              {bulletins.map(bulletin => (
                <Card 
                  key={bulletin.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleBulletinClick(bulletin)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 
                            className="font-semibold text-gray-900 line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerms(bulletin.title, bulletinSearch)
                            }}
                          />
                          <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          {bulletin.data?.source && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{bulletin.data.source}</span>
                            </div>
                          )}
                          {bulletin.data?.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(bulletin.data.publishedAt)}</span>
                            </div>
                          )}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Bulletin Details Modal */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-2xl z-[1000]">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  {selectedResource.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {selectedResource.data?.source && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {selectedResource.data.source}
                    </Badge>
                  )}
                  {selectedResource.data?.publishedAt && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedResource.data.publishedAt)}
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
                
                {selectedResource.data?.topicTags && selectedResource.data.topicTags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.data.topicTags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {(selectedResource.url || (selectedResource.data && 'url' in selectedResource.data)) && (
                    <Button 
                      onClick={() => handleExternalLinkClick(selectedResource)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Bulletin
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