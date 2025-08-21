import { useState, useEffect, useCallback } from "react";
import { useParamState } from "@/hooks/useQueryParams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Download, Eye, Copy, FileSpreadsheet, DollarSign, Monitor, Smartphone, Globe, Wrench, FileText, Calculator, Grid3X3, List } from "lucide-react";
import { useResources, Resource, ResourceFilters } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import TemplatePreviewModal from "../TemplatePreviewModal";
import { trackTabView, trackResourceClick } from "@/lib/analytics";
import { useToggleView } from "@/hooks/useToggleView";
import { ToggleGroup } from "@/features/resources/components/ToggleGroup";
import { useToast } from "@/hooks/use-toast";

interface ToolsTemplatesTabProps {
  onAnalyticsEvent?: (eventName: string, payload: any) => void;
}

const TOOL_CATEGORIES = [
  'Planning',
  'Operations', 
  'Finance',
  'Marketing',
  'Monitoring',
  'Analysis'
];

const PLATFORMS = [
  'Web',
  'iOS',
  'Android', 
  'Desktop',
  'Excel Add-in'
];

const COST_TYPES = [
  'Free',
  'Paid',
  'Freemium'
];

const TEMPLATE_CATEGORIES = [
  'Financial Planning',
  'Crop Planning',
  'Operations',
  'Compliance',
  'Marketing'
];

export default function ToolsTemplatesTab({ onAnalyticsEvent }: ToolsTemplatesTabProps) {
  const { toast } = useToast();
  
  // URL state management
  const [activeSubTab, setActiveSubTab] = useParamState('sub', 'tools');
  const [viewMode, setViewMode] = useParamState('view', 'list');
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [toolFilters, setToolFilters] = useState({
    category: 'all',
    platform: 'all',
    costType: 'all'
  });
  const [templateFilters, setTemplateFilters] = useState({
    category: 'all'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Resource | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Track tab view on mount
  useEffect(() => {
    trackTabView('tools-templates');
    onAnalyticsEvent?.('tab_view', { tab: 'tools-templates', sub: activeSubTab });
  }, [onAnalyticsEvent, activeSubTab]);

  // Data fetching for tools
  const { data: toolsData, isLoading: toolsLoading, error: toolsError } = useResources({
    type: 'tools',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(toolFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
    enabled: activeSubTab === 'tools'
  });

  // Data fetching for templates
  const { data: templatesData, isLoading: templatesLoading, error: templatesError } = useResources({
    type: 'templates',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(templateFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters,
    enabled: activeSubTab === 'templates'
  });

  const tools = toolsData?.items || [];
  const templates = templatesData?.items || [];

  // Handle sub-tab change
  const handleSubTabChange = useCallback((subTab: string) => {
    setActiveSubTab(subTab);
  }, [setActiveSubTab]);
  
  // Handle view mode change
  const handleViewModeChange = useCallback((mode: string) => {
    setViewMode(mode);
  }, [setViewMode]);

  // Handle tool click
  const handleToolClick = useCallback((tool: Resource) => {
    trackResourceClick(tool.id, 'tool', tool.title);
    onAnalyticsEvent?.('tool_click', {
      tool_id: tool.id,
      tool_name: tool.title,
      tool_category: tool.data?.category,
      cost_type: tool.data?.costType
    });
    
    if (tool.url) {
      window.open(tool.url, '_blank');
    }
  }, [onAnalyticsEvent]);

  // Handle template preview
  const handleTemplatePreview = useCallback((template: Resource) => {
    setSelectedTemplate(template);
    setPreviewModalOpen(true);
    onAnalyticsEvent?.('template_preview', {
      template_id: template.id,
      template_name: template.title,
      template_category: template.data?.category
    });
  }, [onAnalyticsEvent]);

  // Handle template download
  const handleTemplateDownload = useCallback((template: Resource, format: 'csv' | 'xlsx') => {
    const fileUrl = template.data?.fileRefs?.[format];
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${template.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
      link.click();
      
      onAnalyticsEvent?.('template_download', {
        template_id: template.id,
        template_name: template.title,
        format
      });
      
      toast({
        title: "Download Started",
        description: `${template.title} is downloading as ${format.toUpperCase()}`
      });
    }
  }, [onAnalyticsEvent, toast]);

  // Handle Google Sheets link
  const handleGoogleSheetsOpen = useCallback((template: Resource) => {
    const gsheetUrl = template.data?.fileRefs?.gsheetTemplateUrl;
    if (gsheetUrl) {
      window.open(gsheetUrl, '_blank');
      onAnalyticsEvent?.('template_gsheet_open', {
        template_id: template.id,
        template_name: template.title
      });
    }
  }, [onAnalyticsEvent]);

  // Handle copy link
  const handleCopyLink = useCallback((template: Resource) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?sub=templates&template=${template.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link Copied",
      description: "Template link copied to clipboard"
    });
    
    onAnalyticsEvent?.('template_link_copy', {
      template_id: template.id,
      template_name: template.title
    });
  }, [onAnalyticsEvent, toast]);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Web': return <Globe className="h-4 w-4" />;
      case 'iOS': case 'Android': return <Smartphone className="h-4 w-4" />;
      case 'Desktop': return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
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
      id="tools-templates-panel" 
      aria-labelledby="tools-templates-tab"
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-green-900 mb-2">Tools & Templates for Greenhouse Operations</h2>
        <p className="text-green-800">
          Discover software tools and downloadable templates to help streamline your greenhouse business operations.
        </p>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tools by name or description..."
                resources={tools}
                resourceType="tools"
                className="max-w-md"
              />
              
              {/* View Toggle */}
              <ToggleGroup
                value={viewMode}
                onValueChange={handleViewModeChange}
                options={[
                  { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
                  { value: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> }
                ]}
                ariaLabel="View mode for tools"
                className="max-w-[200px]"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select
                value={toolFilters.category}
                onValueChange={(value) => setToolFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TOOL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={toolFilters.platform}
                onValueChange={(value) => setToolFilters(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map(platform => (
                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={toolFilters.costType}
                onValueChange={(value) => setToolFilters(prev => ({ ...prev, costType: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cost Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cost Types</SelectItem>
                  {COST_TYPES.map(cost => (
                    <SelectItem key={cost} value={cost}>{cost}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tools Grid */}
          {toolsLoading ? (
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
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick(tool)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calculator className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {getPlatformIcon(tool.data?.platform || 'Web')}
                              <span className="text-sm text-gray-600">{tool.data?.platform || 'Web'}</span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{tool.summary}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{tool.data?.category || 'General'}</Badge>
                        <Badge variant={getCostBadgeVariant(tool.data?.costType)}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          {tool.data?.costType || 'Unknown'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {tools.map(tool => (
                  <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick(tool)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Calculator className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{tool.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{tool.summary}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                {getPlatformIcon(tool.data?.platform || 'Web')}
                                <span>{tool.data?.platform || 'Web'}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{tool.data?.category || 'General'}</Badge>
                              <Badge variant={getCostBadgeVariant(tool.data?.costType)} className="text-xs">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {tool.data?.costType || 'Unknown'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
          
          {!toolsLoading && tools.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search templates by name or description..."
                resources={templates}
                resourceType="templates"
                className="max-w-md"
              />
              
              {/* View Toggle */}
              <ToggleGroup
                value={viewMode}
                onValueChange={handleViewModeChange}
                options={[
                  { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
                  { value: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> }
                ]}
                ariaLabel="View mode for templates"
                className="max-w-[200px]"
              />
            </div>
            
            <Select
              value={templateFilters.category}
              onValueChange={(value) => setTemplateFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Templates Gallery */}
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileSpreadsheet className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {template.data?.category || 'General'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-2">{template.summary}</p>
                    
                    {/* Format Icons */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-500">Formats:</span>
                      {template.data?.fileRefs?.csv && (
                        <Badge variant="secondary" className="text-xs">CSV</Badge>
                      )}
                      {template.data?.fileRefs?.xlsx && (
                        <Badge variant="secondary" className="text-xs">XLSX</Badge>
                      )}
                      {template.data?.fileRefs?.gsheetTemplateUrl && (
                        <Badge variant="secondary" className="text-xs">Google Sheets</Badge>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleTemplatePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Template
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {template.data?.fileRefs?.csv && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTemplateDownload(template, 'csv')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            CSV
                          </Button>
                        )}
                        {template.data?.fileRefs?.xlsx && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTemplateDownload(template, 'xlsx')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            XLSX
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{template.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">{template.summary}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.data?.category || 'General'}
                            </Badge>
                            {template.data?.language && (
                              <span className="text-xs text-gray-500">
                                Language: {template.data.language}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTemplatePreview(template);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.data?.fileRefs?.csv && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateDownload(template, 'csv');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!templatesLoading && templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          open={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedTemplate(null);
          }}
          onDownload={handleTemplateDownload}
          onGoogleSheetsOpen={handleGoogleSheetsOpen}
          onCopyLink={handleCopyLink}
        />
      )}
    </div>
  );
}