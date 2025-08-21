import { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Import new tabbed components
import TabsBar from "@/components/TabsBar";
import TabIntro from "@/components/TabIntro";
import UniversitiesTab from "@/components/tabs/UniversitiesTab";
import OrganizationsTab from "@/components/tabs/OrganizationsTab";
import GrantsTab from "@/components/tabs/GrantsTab";
import ToolsTemplatesTab from "@/components/tabs/ToolsTemplatesTab";
import LearningTab from "@/components/tabs/LearningTab";
import BlogsBulletinsTab from "@/components/tabs/BlogsBulletinsTab";
import IndustryNewsTab from "@/components/tabs/IndustryNewsTab";
import { SuggestDialog } from "@/components/resources/SuggestDialog";

// Import analytics tracking
import { trackTabView, trackSearchSubmit, trackFilterChange, trackResourceOpen, trackOutboundClick, trackTemplateDownload } from "@/lib/analytics";

// Analytics helper - bridge to new analytics system
const recordAnalyticsEvent = (eventName: string, payload: any) => {
  console.log('[Analytics]', eventName, payload);
  
  // Map old event names to new analytics tracking
  switch (eventName) {
    case 'tab_view':
      trackTabView(payload.tab, payload);
      break;
    case 'search_submit':
      trackSearchSubmit(payload.query, payload.tab, payload.filters);
      break;
    case 'filter_change':
      trackFilterChange(payload.tab, payload.filterType, payload.filterValue);
      break;
    case 'resource_open':
      trackResourceOpen(payload.resourceId, payload.tab, payload.position, payload.fromSearch);
      break;
    case 'outbound_click':
      trackOutboundClick(payload.url, payload.tab, payload.resourceId);
      break;
    case 'template_download':
      trackTemplateDownload(payload.templateId, payload.templateType, payload.tab);
      break;
    default:
      console.log('Unmapped analytics event:', eventName, payload);
  }
};

export default function Resources() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('tools-templates');
  
  // Update activeTab when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tabFromUrl = urlParams.get('tab') || 'tools-templates';
    setActiveTab(tabFromUrl);
  }, [location]);
  
  // Tab change handler
  const handleTabChange = useCallback((tabId: string) => {
    const previousTab = activeTab;
    setActiveTab(tabId);
    
    // Track tab view with new analytics
    trackTabView(tabId, {
      previousTab,
      timestamp: Date.now()
    });
  }, [activeTab]);
  
  // Analytics event handler
  const handleAnalyticsEvent = useCallback((eventName: string, payload: any) => {
    recordAnalyticsEvent(eventName, payload);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <div className="p-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Library</h1>
                <p className="text-gray-700">Expert-curated resources for greenhouse growers, from university research to industry tools and funding opportunities.</p>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard/resources/saved">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    Saved
                  </Button>
                </Link>
                
                <SuggestDialog />
              </div>
            </div>

            {/* Tabbed Navigation */}
            <TabsBar 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              onAnalyticsEvent={handleAnalyticsEvent}
            />
            
            {/* Tab Introduction */}
            <TabIntro activeTab={activeTab} />
          </header>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Tab Content */}
            {activeTab === 'universities' && (
              <UniversitiesTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'organizations' && (
              <OrganizationsTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'grants' && (
              <GrantsTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'tax-incentives' && (
              <div className="text-center py-12 text-gray-500">
                Tax Incentives tab coming soon...
              </div>
            )}
            
            {activeTab === 'tools-templates' && (
              <ToolsTemplatesTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'learning' && (
              <LearningTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'blogs-bulletins' && (
              <BlogsBulletinsTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
            
            {activeTab === 'industry-news' && (
              <IndustryNewsTab onAnalyticsEvent={handleAnalyticsEvent} />
            )}
          </main>
      </div>
    </div>
  );
}