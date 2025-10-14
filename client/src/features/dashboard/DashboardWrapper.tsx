import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { DemoProvider } from "@/contexts/DemoContext";
import AppShell from "@/components/AppShell";
import LazyWrapper from "@/components/LazyWrapper";
import DashboardHome from "@/features/dashboard/DashboardHome";

// Lazy load feature components
const Resources = lazy(() => import("@/pages/Resources"));
const AskExpert = lazy(() => import("@/pages/AskExpert"));
const Forum = lazy(() => import("@/pages/Forum"));
const SalesHub = lazy(() => import("@/pages/SalesHub"));
const ProductHub = lazy(() => import("@/pages/ProductHub"));
const FarmRoadmap = lazy(() => import("@/pages/FarmRoadmap"));
const FindGrower = lazy(() => import("@/pages/FindGrower"));
const Profile = lazy(() => import("@/pages/Profile"));
const ResourceDetail = lazy(() => import("@/pages/ResourceDetail"));
const SavedResources = lazy(() => import("@/pages/SavedResources"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

interface DashboardWrapperProps {
  isDemo?: boolean;
}

export default function DashboardWrapper({ isDemo = false }: DashboardWrapperProps) {
  const [location] = useLocation();
  const basePath = isDemo ? "/demo" : "/dashboard";
  
  return (
    <DemoProvider isDemo={isDemo}>
      <AppShell>
        <Switch>
          {/* Feature Routes - Use absolute paths */}
          <Route path={`${basePath}/resources`}>
            <LazyWrapper>
              <Resources />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/resources/saved`}>
            <LazyWrapper>
              <SavedResources />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/resources/:id`}>
            <LazyWrapper>
              <ResourceDetail />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/ask-expert`}>
            <LazyWrapper>
              <AskExpert />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/forum`}>
            <LazyWrapper>
              <Forum />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/saleshub`}>
            <LazyWrapper>
              <SalesHub />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/producthub`}>
            <LazyWrapper>
              <ProductHub />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/farm-roadmap`}>
            <LazyWrapper>
              <FarmRoadmap />
            </LazyWrapper>
          </Route>
          
          {/* Backward compatibility - redirect old assessment route */}
          <Route path={`${basePath}/assessment`}>
            <LazyWrapper>
              <FarmRoadmap />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/find-grower`}>
            <LazyWrapper>
              <FindGrower />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/profile`}>
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/favorites`}>
            <LazyWrapper>
              <Favorites />
            </LazyWrapper>
          </Route>
          
          <Route path={`${basePath}/admin`}>
            <LazyWrapper>
              <AdminDashboard />
            </LazyWrapper>
          </Route>
          
          {/* Dashboard Home Route - must be last for specificity */}
          <Route path={basePath}>
            <DashboardHome />
          </Route>
        </Switch>
      </AppShell>
    </DemoProvider>
  );
}