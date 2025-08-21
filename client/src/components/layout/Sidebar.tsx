import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import uggaLogo from "@assets/2_1750100657577.png";
import {
  Search,
  Home,
  Heart,
  FolderOpen,
  MessageCircle,
  Store,
  ClipboardList,
  ShoppingBag,
  MapPin,
  UserCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isDemo, showDemoAction } = useDemo();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState) {
      const { collapsed } = JSON.parse(savedState);
      setIsCollapsed(collapsed);
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify({ collapsed: isCollapsed }));
  }, [isCollapsed]);

  const handleNavClick = (path: string) => {
    if (isDemo && !path.startsWith("/demo")) {
      showDemoAction();
    }
    setIsMobileOpen(false);
  };

  const handleSearchClick = () => {
    setShowSearchModal(true);
    setIsMobileOpen(false);
  };

  // Section 1: Top navigation items
  const topNavItems: NavigationItem[] = [
    {
      id: "search",
      label: "Search",
      path: "#",
      icon: Search,
      onClick: handleSearchClick,
    },
    {
      id: "home",
      label: "Home",
      path: isDemo ? "/demo" : "/dashboard",
      icon: Home,
    },
    {
      id: "favorites",
      label: "Favorites",
      path: isDemo ? "/demo/favorites" : "/dashboard/favorites",
      icon: Heart,
    },
  ];

  // Section 2: Main features
  const mainNavItems: NavigationItem[] = [
    {
      id: "resources",
      label: "Resource Library",
      path: isDemo ? "/demo/resources" : "/dashboard/resources",
      icon: FolderOpen,
    },
    {
      id: "forum",
      label: "Member Forum",
      path: isDemo ? "/demo/forum" : "/dashboard/forum",
      icon: MessageCircle,
    },
    {
      id: "saleshub",
      label: "Sales Hub",
      path: isDemo ? "/demo/saleshub" : "/dashboard/saleshub",
      icon: Store,
    },
    {
      id: "farm-roadmap",
      label: "Farm Roadmap",
      path: isDemo ? "/demo/farm-roadmap" : "/dashboard/farm-roadmap",
      icon: ClipboardList,
    },
    {
      id: "producthub",
      label: "Product Hub",
      path: isDemo ? "/demo/producthub" : "/dashboard/producthub",
      icon: ShoppingBag,
    },
    {
      id: "find-grower",
      label: "Find a Grower",
      path: isDemo ? "/demo/find-grower" : "/dashboard/find-grower",
      icon: MapPin,
    },
  ];

  // Section 3: Profile (only if authenticated)
  const profileNavItems: NavigationItem[] = isAuthenticated ? [
    {
      id: "profile",
      label: "Profile",
      path: "/dashboard/profile",
      icon: UserCircle,
    },
  ] : [];

  const isActive = (path: string) => {
    if (path === "#") return false;
    return location === path || 
      (path === "/dashboard" && location === "/dashboard") ||
      (path === "/demo" && location === "/demo") ||
      (path !== "/dashboard" && path !== "/demo" && location.startsWith(path));
  };

  const renderNavItem = (item: NavigationItem, mobile = false) => {
    const active = isActive(item.path);
    const IconComponent = item.icon;

    if (item.onClick) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                  active
                    ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || mobile) && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </button>
            </TooltipTrigger>
            {isCollapsed && !mobile && (
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider key={item.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            {isDemo && !item.path.startsWith("/demo") ? (
              <button
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                  active
                    ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || mobile) && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </button>
            ) : (
              <Link
                href={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                  active
                    ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                {(!isCollapsed || mobile) && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </Link>
            )}
          </TooltipTrigger>
          {isCollapsed && !mobile && (
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Mobile Toggle Button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      className="lg:hidden fixed top-4 left-4 z-50"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label="Toggle sidebar"
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  return (
    <>
      <MobileToggle />
      
      {/* Desktop Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0",
        "hidden lg:flex lg:flex-col",
        isCollapsed ? "lg:w-16" : "lg:w-64",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <a 
              href="https://www.greenhousegrowers.org/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center min-w-0"
            >
              <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-bold text-lg text-ugga-primary truncate ml-2">
                    {isDemo ? "UGGA Demo" : "UGGA"}
                  </span>
                  {isDemo && (
                    <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">
                      Demo
                    </Badge>
                  )}
                </>
              )}
            </a>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto p-2"
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-2"
                onClick={() => setIsCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Section 1: Top navigation */}
            <div className="space-y-1">
              {topNavItems.map(item => renderNavItem(item))}
            </div>

            <Separator className="my-4" />

            {/* Section 2: Main features */}
            <div className="space-y-1">
              {mainNavItems.map(item => renderNavItem(item))}
            </div>

            {profileNavItems.length > 0 && (
              <>
                <Separator className="my-4" />
                {/* Section 3: Profile */}
                <div className="space-y-1">
                  {profileNavItems.map(item => renderNavItem(item))}
                </div>
              </>
            )}
          </nav>
          
          {/* Return to Website Button */}
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://www.greenhousegrowers.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-white hover:opacity-90"
                    style={{ backgroundColor: '#36533C', focusRingColor: '#36533C' }}
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 truncate">Return to UGGA Website</span>
                    )}
                  </a>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>Return to UGGA Website</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:hidden",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <a 
              href="https://www.greenhousegrowers.org/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center min-w-0"
            >
              <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 flex-shrink-0" />
              <span className="font-bold text-lg text-ugga-primary truncate ml-2">
                {isDemo ? "UGGA Demo" : "UGGA"}
              </span>
              {isDemo && (
                <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">
                  Demo
                </Badge>
              )}
            </a>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Section 1: Top navigation */}
            <div className="space-y-1">
              {topNavItems.map(item => renderNavItem(item, true))}
            </div>

            <Separator className="my-4" />

            {/* Section 2: Main features */}
            <div className="space-y-1">
              {mainNavItems.map(item => renderNavItem(item, true))}
            </div>

            {profileNavItems.length > 0 && (
              <>
                <Separator className="my-4" />
                {/* Section 3: Profile */}
                <div className="space-y-1">
                  {profileNavItems.map(item => renderNavItem(item, true))}
                </div>
              </>
            )}
          </nav>
          
          {/* Return to Website Button */}
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 flex-shrink-0">
            <a
              href="https://www.greenhousegrowers.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 bg-green-700 text-white hover:bg-green-800"
              onClick={() => setIsMobileOpen(false)}
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span className="ml-3 truncate">Return to UGGA Website</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearchModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search with natural language..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ugga-primary focus:border-transparent"
                  autoFocus
                />
              </div>
              <p className="text-sm text-gray-500">
                This feature is coming soon! You'll be able to search across all UGGA resources using natural language.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}