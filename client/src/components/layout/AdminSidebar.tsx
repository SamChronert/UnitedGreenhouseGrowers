import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Home,
  FolderOpen,
  Newspaper,
  Users,
  MessageSquare,
  TrendingUp,
  Target,
  Bot,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarState');
    if (savedState) {
      const { collapsed } = JSON.parse(savedState);
      setIsCollapsed(collapsed);
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('adminSidebarState', JSON.stringify({ collapsed: isCollapsed }));
  }, [isCollapsed]);

  // Admin navigation items
  const adminNavItems: NavigationItem[] = [
    {
      id: "admin-home",
      label: "Admin Home",
      path: "/admin",
      icon: Home,
    },
    {
      id: "resources",
      label: "Resource Management",
      path: "/admin/resources",
      icon: FolderOpen,
    },
    {
      id: "blog",
      label: "Blog Management",
      path: "/admin/blog",
      icon: Newspaper,
    },
    {
      id: "members",
      label: "Member Management",
      path: "/admin/members",
      icon: Users,
    },
    {
      id: "feedback",
      label: "Feedback",
      path: "/admin/challenges",
      icon: MessageSquare,
    },
    {
      id: "analytics",
      label: "Platform Analytics",
      path: "/admin/analytics",
      icon: TrendingUp,
    },
    {
      id: "farm-roadmap",
      label: "Farm Roadmap Manager",
      path: "/admin/farm-roadmap",
      icon: Target,
    },
    {
      id: "ai-agent",
      label: "AI Agent Manager",
      path: "/admin/ai-agents",
      icon: Bot,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(path);
  };

  const renderNavItem = (item: NavigationItem, mobile = false) => {
    const active = isActive(item.path);
    const IconComponent = item.icon;

    return (
      <TooltipProvider key={item.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                active
                  ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              onClick={() => setIsMobileOpen(false)}
              data-testid={`admin-nav-${item.id}`}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              {(!isCollapsed || mobile) && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </Link>
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
      data-testid="button-toggle-mobile-sidebar"
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
            <Link href="/admin" className="flex items-center min-w-0">
              <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-bold text-lg text-ugga-primary truncate ml-2">
                  Admin Dashboard
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto p-2"
                onClick={() => setIsCollapsed(true)}
                aria-label="Collapse sidebar"
                data-testid="button-collapse-sidebar"
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
                data-testid="button-expand-sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Admin navigation items */}
            <div className="space-y-1">
              {adminNavItems.map(item => renderNavItem(item))}
            </div>

            <Separator className="my-4" />

            {/* Switch to Member Dashboard */}
            <div className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      data-testid="link-switch-member-dashboard"
                    >
                      <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 truncate">Switch to Member Dashboard</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>Switch to Member Dashboard</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </nav>
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
            <Link href="/admin" className="flex items-center min-w-0">
              <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 flex-shrink-0" />
              <span className="font-bold text-lg text-ugga-primary truncate ml-2">
                Admin Dashboard
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Admin navigation items */}
            <div className="space-y-1">
              {adminNavItems.map(item => renderNavItem(item, true))}
            </div>

            <Separator className="my-4" />

            {/* Switch to Member Dashboard */}
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileOpen(false)}
                data-testid="link-switch-member-dashboard-mobile"
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 truncate">Switch to Member Dashboard</span>
              </Link>
            </div>
          </nav>
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
    </>
  );
}
