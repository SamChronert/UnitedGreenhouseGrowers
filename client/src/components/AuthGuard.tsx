import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireMember?: boolean;
  requireAdmin?: boolean;
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireMember = false, 
  requireAdmin = false 
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isMember, isAdmin } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (requireMember && !isMember) {
      toast({
        title: "Member Access Required",
        description: "This page is only available to UGGA members.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    if (requireAdmin && !isAdmin) {
      toast({
        title: "Admin Access Required",
        description: "This page is only available to administrators.",
        variant: "destructive",
      });
      setLocation("/dashboard");
      return;
    }
  }, [isLoading, isAuthenticated, isMember, isAdmin, requireAuth, requireMember, requireAdmin, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;
  if (requireMember && !isMember) return null;
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
}
