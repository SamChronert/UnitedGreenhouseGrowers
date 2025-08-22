import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import AdminDashboardHome from "@/components/AdminDashboardHome";

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = 'Admin Dashboard - UGGA Platform';
    return () => {
      document.title = 'UGGA Platform';
    };
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ugga-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminDashboardHome />
      </div>
    </div>
  );
}