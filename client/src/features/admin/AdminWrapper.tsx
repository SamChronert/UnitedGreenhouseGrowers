import { lazy } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import AdminLayout from "@/components/layout/AdminLayout";
import LazyWrapper from "@/components/LazyWrapper";
import AdminDashboardHome from "@/components/AdminDashboardHome";

// Lazy load admin pages
const AdminResources = lazy(() => import("@/pages/AdminResources"));
const AdminBlog = lazy(() => import("@/pages/AdminBlog"));
const AdminMembers = lazy(() => import("@/pages/AdminMembers"));
const AdminChallenges = lazy(() => import("@/pages/AdminChallenges"));
const AdminExpertRequests = lazy(() => import("@/pages/AdminExpertRequests"));
const AdminFarmRoadmapManager = lazy(() => import("@/pages/AdminFarmRoadmapManager"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const AdminAiAgents = lazy(() => import("@/pages/AdminAiAgents"));

export default function AdminWrapper() {
  const [location] = useLocation();
  
  return (
    <AdminLayout>
      <Switch>
        {/* Admin Tool Routes */}
        <Route path="/admin/resources">
          <LazyWrapper>
            <AdminResources />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/blog">
          <LazyWrapper>
            <AdminBlog />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/members">
          <LazyWrapper>
            <AdminMembers />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/challenges">
          <LazyWrapper>
            <AdminChallenges />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/expert-requests">
          <LazyWrapper>
            <AdminExpertRequests />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/farm-roadmap">
          <LazyWrapper>
            <AdminFarmRoadmapManager />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/analytics">
          <LazyWrapper>
            <AdminAnalytics />
          </LazyWrapper>
        </Route>
        
        <Route path="/admin/ai-agents">
          <LazyWrapper>
            <AdminAiAgents />
          </LazyWrapper>
        </Route>

        {/* Redirects from old routes */}
        <Route path="/dashboard/admin">
          <Redirect to="/admin" />
        </Route>
        
        <Route path="/admin-tools">
          <Redirect to="/admin" />
        </Route>

        {/* Admin Home Route - must be last for specificity */}
        <Route path="/admin">
          <div className="min-h-screen py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AdminDashboardHome />
            </div>
          </div>
        </Route>
      </Switch>
    </AdminLayout>
  );
}
