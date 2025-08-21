import { useLocation } from "wouter";
import { Link } from "wouter";
import ToolsTemplatesTab from "@/components/tabs/ToolsTemplatesTab";
import UniversitiesTab from "@/components/tabs/UniversitiesTab";
import OrganizationsTab from "@/components/tabs/OrganizationsTab";
import LearningTab from "@/components/tabs/LearningTab";
import GrantsTab from "@/components/tabs/GrantsTab";
import BlogsBulletinsTab from "@/components/tabs/BlogsBulletinsTab";
import IndustryNewsTab from "@/components/tabs/IndustryNewsTab";
import { SuggestDialog } from "@/components/resources/SuggestDialog";
import { Button } from "@/components/ui/button";
import { Heart, Grid3X3, List, Map, Wrench, FileText } from "lucide-react";

export default function ResourcesRouter() {
  console.log('🔍 ResourcesRouter is rendering');
  const [location, navigate] = useLocation();
  console.log('🔍 Current location:', location);

  // Extract current tab and view from URL
  const pathParts = location.split('/').filter(Boolean);
  console.log('🔍 Path parts:', pathParts);
  const currentTab = pathParts[2] || 'tools-templates';
  const currentView = pathParts[3] || 'list';
  const currentSubTab = pathParts[4]; // For tools vs templates

  console.log('🔍 ResourcesRouter - currentTab:', currentTab, 'currentView:', currentView, 'currentSubTab:', currentSubTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
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

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
              <Link href="/dashboard/resources/tools-templates/list">
                <Button variant={currentTab === 'tools-templates' ? 'default' : 'outline'}>
                  Tools & Templates
                </Button>
              </Link>
              <Link href="/dashboard/resources/universities/map">
                <Button variant={currentTab === 'universities' ? 'default' : 'outline'}>
                  Universities
                </Button>
              </Link>
              <Link href="/dashboard/resources/organizations/list">
                <Button variant={currentTab === 'organizations' ? 'default' : 'outline'}>
                  Organizations
                </Button>
              </Link>
              <Link href="/dashboard/resources/learning/grid">
                <Button variant={currentTab === 'learning' ? 'default' : 'outline'}>
                  Learning
                </Button>
              </Link>
              <Link href="/dashboard/resources/grants/list">
                <Button variant={currentTab === 'grants' ? 'default' : 'outline'}>
                  Grants
                </Button>
              </Link>
              <Link href="/dashboard/resources/blogs-bulletins/grid">
                <Button variant={currentTab === 'blogs-bulletins' ? 'default' : 'outline'}>
                  Blogs & Bulletins
                </Button>
              </Link>
              <Link href="/dashboard/resources/industry-news/list">
                <Button variant={currentTab === 'industry-news' ? 'default' : 'outline'}>
                  Industry News
                </Button>
              </Link>
              <Link href="/dashboard/resources/tax-incentives/list">
                <Button variant={currentTab === 'tax-incentives' ? 'default' : 'outline'}>
                  Tax Incentives
                </Button>
              </Link>
            </div>
          </header>

          {/* View Controls - Show different controls based on current tab */}
          <div className="mb-6 flex justify-between items-center">
            {/* Tools & Templates sub-navigation */}
            {currentTab === 'tools-templates' && (
              <div className="flex gap-2">
                <Link href="/dashboard/resources/tools-templates/list/tools">
                  <Button variant={currentSubTab === 'tools' || !currentSubTab ? 'default' : 'outline'} size="sm">
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </Link>
                <Link href="/dashboard/resources/tools-templates/list/templates">
                  <Button variant={currentSubTab === 'templates' ? 'default' : 'outline'} size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </Link>
              </div>
            )}

            {/* View Toggle Buttons */}
            <div className="flex gap-2 ml-auto">
              {currentTab === 'universities' && (
                <>
                  <Link href="/dashboard/resources/universities/grid">
                    <Button variant={currentView === 'grid' ? 'default' : 'outline'} size="sm">
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                  </Link>
                  <Link href="/dashboard/resources/universities/map">
                    <Button variant={currentView === 'map' ? 'default' : 'outline'} size="sm">
                      <Map className="h-4 w-4 mr-2" />
                      Map
                    </Button>
                  </Link>
                </>
              )}

              {(currentTab === 'tools-templates' || currentTab === 'learning' || currentTab === 'blogs-bulletins') && (
                <>
                  <Link href={`/dashboard/resources/${currentTab}/list${currentSubTab ? '/' + currentSubTab : ''}`}>
                    <Button variant={currentView === 'list' ? 'default' : 'outline'} size="sm">
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </Link>
                  <Link href={`/dashboard/resources/${currentTab}/grid${currentSubTab ? '/' + currentSubTab : ''}`}>
                    <Button variant={currentView === 'grid' ? 'default' : 'outline'} size="sm">
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <main>
            {(() => {
              console.log('🔍 Rendering content for currentTab:', currentTab, 'currentView:', currentView);
              
              if (currentTab === 'tools-templates') {
                const viewMode = (currentView === 'list' || currentView === 'grid') ? currentView : 'list';
                const subTab = (currentSubTab === 'tools' || currentSubTab === 'templates') ? currentSubTab : 'tools';
                return <ToolsTemplatesTab viewMode={viewMode} subTab={subTab} />;
              }
              
              if (currentTab === 'universities') {
                const viewMode = (currentView === 'grid' || currentView === 'map') ? currentView : 'map';
                return <UniversitiesTab viewMode={viewMode} />;
              }
              
              if (currentTab === 'organizations') {
                return <OrganizationsTab />;
              }
              
              if (currentTab === 'learning') {
                const viewMode = (currentView === 'grid' || currentView === 'list') ? currentView : 'grid';
                return <LearningTab viewMode={viewMode} />;
              }
              
              if (currentTab === 'grants') {
                return <GrantsTab />;
              }
              
              if (currentTab === 'blogs-bulletins') {
                const viewMode = (currentView === 'grid' || currentView === 'list') ? currentView : 'grid';
                return <BlogsBulletinsTab viewMode={viewMode} />;
              }
              
              if (currentTab === 'industry-news') {
                return <IndustryNewsTab />;
              }
              
              if (currentTab === 'tax-incentives') {
                return (
                  <div className="text-center py-12 text-gray-500">
                    Tax Incentives tab coming soon...
                  </div>
                );
              }
              
              // Default - redirect to tools-templates
              console.log('🔍 No matching tab, redirecting to tools-templates');
              navigate('/dashboard/resources/tools-templates/list');
              return null;
            })()}
          </main>
        </div>
      </div>
    </div>
  );
}