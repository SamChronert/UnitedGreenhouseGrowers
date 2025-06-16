import { useQuery } from "@tanstack/react-query";
import { type User, type Profile } from "@shared/schema";

export interface AuthUser extends User {
  profile?: Profile;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isMember: user?.role === "MEMBER" || user?.role === "ADMIN",
    isAdmin: user?.role === "ADMIN",
    refetch,
  };
}
