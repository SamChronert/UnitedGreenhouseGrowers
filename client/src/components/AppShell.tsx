import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, Search, HelpCircle, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import uggaLogo from "@assets/2_1750100657577.png";
import { getDemoFeatures, getAuthenticatedFeatures } from "@/lib/features";
import FeatureIcon from "@/components/FeatureIcon";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isDemo, showDemoAction } = useDemo();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile overlay
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop collapse

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out.",
        variant: "destructive",
      });
    },
  });

  // Get the appropriate features based on auth state and demo mode
  const availableFeatures = isDemo ? getDemoFeatures() : getAuthenticatedFeatures();

  const handleNavClick = (path: string) => {
    if (isDemo && !path.startsWith("/demo")) {
      showDemoAction();
    }
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-md shadow-lg z-50 text-sm font-medium text-gray-900 border-2 border-ugga-primary"
      >
        Skip to content
      </a>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:static lg:inset-0",
        // Mobile: controlled by sidebarOpen, Desktop: always visible
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center min-w-0">
              <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 flex-shrink-0" />
              {!sidebarCollapsed && (
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
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Dashboard navigation">
            {availableFeatures.map((feature) => {
              const isActive = location === feature.path || 
                (feature.path === "/dashboard" && location === "/dashboard") ||
                (feature.path === "/demo" && location === "/demo") ||
                (feature.path !== "/dashboard" && feature.path !== "/demo" && location.startsWith(feature.path));
              
              return (
                <div key={feature.id}>
                  {isDemo && !feature.path.startsWith("/demo") ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavClick(feature.path)}
                            className={cn(
                              "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                              isActive
                                ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <FeatureIcon iconName={feature.iconName} />
                            {!sidebarCollapsed && (
                              <>
                                <span className="ml-3 truncate">{feature.label}</span>
                                {feature.inDevelopment && (
                                  <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    Dev
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right">
                            <p>{feature.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={feature.path}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
                              isActive
                                ? "bg-ugga-primary/10 text-ugga-primary border-r-2 border-ugga-primary"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <FeatureIcon iconName={feature.iconName} />
                            {!sidebarCollapsed && (
                              <>
                                <span className="ml-3 truncate">{feature.label}</span>
                                {feature.inDevelopment && (
                                  <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    Dev
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                          <TooltipContent side="right">
                            <p>{feature.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            })}
          </nav>
          
          {/* Return to Website Button */}
          <div className="px-4 pb-4 border-t border-gray-200 pt-4 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 truncate">Return to UGGA Website</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right">
                    <p>Return to UGGA Website</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3" role="banner">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Desktop collapse button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex mr-3 p-2"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Future: Search */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search (coming soon)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Help */}
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help</span>
              </Button>

              {/* User Menu or Demo Badge */}
              {isDemo ? (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    Demo Mode
                  </Badge>
                  <Link href="/register">
                    <Button size="sm" className="bg-ugga-primary hover:bg-ugga-primary/90 text-white">
                      Join UGGA
                    </Button>
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.profile?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.profile?.name || user?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-ugga-primary hover:bg-ugga-primary/90 text-white">
                      Join UGGA
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main 
          id="main-content" 
          className="flex-1 overflow-auto bg-gray-50" 
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
