import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Download, Eye, Copy, FileSpreadsheet, DollarSign, Monitor, Smartphone, Globe, Wrench, FileText, Calculator, ChevronDown, ChevronRight } from "lucide-react";
import { useResources, Resource, ResourceFilters } from "@/hooks/useResources";
import SearchBox from "@/components/SearchBox";
import TemplatePreviewModal from "../TemplatePreviewModal";
import { trackTabView, trackResourceClick } from "@/lib/analytics";
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
  
  // State for collapsible sections
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [templatesExpanded, setTemplatesExpanded] = useState(true);
  
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
    onAnalyticsEvent?.('tab_view', { tab: 'tools-templates' });
  }, [onAnalyticsEvent]);

  // Data fetching for tools
  const { data: toolsData, isLoading: toolsLoading, error: toolsError } = useResources({
    type: 'tools',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(toolFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters
  });

  // Data fetching for templates
  const { data: templatesData, isLoading: templatesLoading, error: templatesError } = useResources({
    type: 'templates',
    query: searchQuery,
    filters: Object.fromEntries(Object.entries(templateFilters).filter(([_, v]) => v && v !== 'all')) as ResourceFilters
  });

  const tools = toolsData?.items || [];
  const templates = templatesData?.items || [];

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
    const shareUrl = `${window.location.origin}${window.location.pathname}?template=${template.id}`;
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
      {/* Search Bar */}
      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search tools and templates..."
        resources={[...tools, ...templates]}
        resourceType="tools-templates"
        className="max-w-md"
      />

      {/* Tools Section */}
      <Collapsible open={toolsExpanded} onOpenChange={setToolsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 justify-between text-lg font-semibold hover:bg-gray-50 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5" />
              Tools ({tools.length})
            </div>
            {toolsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Tool Filters */}
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

          {/* Tools List */}
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
          )}
          
          {!toolsLoading && tools.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Templates Section */}
      <Collapsible open={templatesExpanded} onOpenChange={setTemplatesExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 justify-between text-lg font-semibold hover:bg-gray-50 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              Templates ({templates.length})
            </div>
            {templatesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Template Filters */}
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

          {/* Templates List */}
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
          ) : (
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
          )}
          
          {!templatesLoading && templates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedTemplate(null);
          }}
          onDownload={(format) => handleTemplateDownload(selectedTemplate, format)}
          onGoogleSheetsOpen={() => handleGoogleSheetsOpen(selectedTemplate)}
        />
      )}
    </div>
  );
}