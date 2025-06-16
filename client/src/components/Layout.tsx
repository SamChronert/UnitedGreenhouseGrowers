import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
import { Menu, X } from "lucide-react";
import { useState } from "react";
import uggaLogo from "@assets/2_1750100657577.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const publicRoutes = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/resources", label: "Resources" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  const memberRoutes = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/dashboard/find-grower", label: "Find Grower" },
    { path: "/dashboard/assessment", label: "Assessment" },
    { path: "/dashboard/resources", label: "Resources" },
  ];

  const adminRoutes = [
    { path: "/admin/blog", label: "Manage Blog" },
    { path: "/admin/resources", label: "Manage Resources" },
    { path: "/admin/members", label: "View Members" },
    { path: "/admin/challenges", label: "Challenge Insights" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 mr-3" />
                <span className="font-bold text-lg text-ugga-primary hidden sm:block">United Greenhouse Growers Association</span>
                <span className="font-bold text-lg text-ugga-primary sm:hidden">UGGA</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {publicRoutes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        location === route.path
                          ? "text-ugga-primary"
                          : "text-gray-600 hover:text-ugga-primary"
                      }`}
                    >
                      {route.label}
                    </Link>
                  ))}
                  
                  {isAuthenticated && (
                    <>
                      {memberRoutes.map((route) => (
                        <Link
                          key={route.path}
                          href={route.path}
                          className={`px-3 py-2 text-sm font-medium transition-colors ${
                            location === route.path
                              ? "text-ugga-primary"
                              : "text-gray-600 hover:text-ugga-primary"
                          }`}
                        >
                          {route.label}
                        </Link>
                      ))}
                      
                      {isAdmin && adminRoutes.map((route) => (
                        <Link
                          key={route.path}
                          href={route.path}
                          className={`px-3 py-2 text-sm font-medium transition-colors ${
                            location === route.path
                              ? "text-ugga-primary"
                              : "text-gray-600 hover:text-ugga-primary"
                          }`}
                        >
                          {route.label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
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
                    <DropdownMenuContent className="w-56" align="end" forceMount>
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
                  <>
                    <Link href="/login">
                      <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/register">
                      <Button>Join UGGA</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {publicRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location === route.path
                      ? "text-ugga-primary bg-gray-50"
                      : "text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  {memberRoutes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        location === route.path
                          ? "text-ugga-primary bg-gray-50"
                          : "text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                  
                  {isAdmin && adminRoutes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`block px-3 py-2 text-base font-medium transition-colors ${
                        location === route.path
                          ? "text-ugga-primary bg-gray-50"
                          : "text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {route.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-2">
                    <Link
                      href="/dashboard/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                      className="w-full text-left block px-3 py-2 text-base font-medium text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-2 space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-ugga-primary hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-base font-medium bg-ugga-primary text-white rounded-md mx-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join UGGA
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer style={{backgroundColor: '#e6f2e6'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img src={uggaLogo} alt="UGGA Logo" className="h-8 w-8 mr-2" />
                <span className="font-bold text-xl text-gray-800">United Greenhouse Growers Association</span>
              </div>
              <p className="text-gray-700 mb-4">
                Bringing greenhouse growers together to share hard-earned knowledge, tackle real-world challenges, and strengthen the industry — together.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-700 hover:text-ugga-primary transition-colors">About Us</Link></li>
                <li><Link href="/resources" className="text-gray-700 hover:text-ugga-primary transition-colors">Resources</Link></li>
                <li><Link href="/blog" className="text-gray-700 hover:text-ugga-primary transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-700 hover:text-ugga-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Member Portal</h3>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li><Link href="/dashboard" className="text-gray-700 hover:text-ugga-primary transition-colors">Dashboard</Link></li>
                    <li><Link href="/dashboard/profile" className="text-gray-700 hover:text-ugga-primary transition-colors">Profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="text-gray-700 hover:text-ugga-primary transition-colors">Member Login</Link></li>
                    <li><Link href="/register" className="text-gray-700 hover:text-ugga-primary transition-colors">Join UGGA</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-8 pt-8 text-center">
            <p className="text-gray-700">
              © 2024 United Greenhouse Growers Association. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
