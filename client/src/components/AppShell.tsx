import { Link } from "wouter";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, isAuthenticated } = useAuth();
  const { isDemo } = useDemo();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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


  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-4 py-2 rounded-md shadow-lg z-50 text-sm font-medium text-gray-900 border-2 border-ugga-primary"
      >
        Skip to content
      </a>

      {/* New Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3" role="banner">
          <div className="flex items-center justify-end">

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

    </div>
  );
}
