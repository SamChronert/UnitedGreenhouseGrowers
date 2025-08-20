import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { DemoProvider } from "@/contexts/DemoContext";
import AppShell from "@/components/AppShell";
import LazyWrapper from "@/components/LazyWrapper";
import DashboardHome from "@/features/dashboard/DashboardHome";

// Lazy load feature components
const Resources = lazy(() => import("@/pages/Resources"));
const Forum = lazy(() => import("@/pages/Forum"));
const SalesHub = lazy(() => import("@/pages/SalesHub"));
const ProductHub = lazy(() => import("@/pages/ProductHub"));
const Assessment = lazy(() => import("@/pages/Assessment"));
const FindGrower = lazy(() => import("@/pages/FindGrower"));
const Profile = lazy(() => import("@/pages/Profile"));
const ResourceDetail = lazy(() => import("@/pages/ResourceDetail"));
const SavedResources = lazy(() => import("@/pages/SavedResources"));

interface DashboardWrapperProps {
  isDemo?: boolean;
}

export default function DashboardWrapper({ isDemo = false }: DashboardWrapperProps) {
  const [location] = useLocation();
  
  return (
    <DemoProvider isDemo={isDemo}>
      <AppShell>
        <Switch>
          {/* Home Route */}
          <Route path="/" component={DashboardHome} />
          
          {/* Feature Routes - Lazy Loaded */}
          <Route path="resources">
            <LazyWrapper>
              <Resources />
            </LazyWrapper>
          </Route>
          
          <Route path="resources/saved">
            <LazyWrapper>
              <SavedResources />
            </LazyWrapper>
          </Route>
          
          <Route path="resources/:id">
            <LazyWrapper>
              <ResourceDetail />
            </LazyWrapper>
          </Route>
          
          <Route path="forum">
            <LazyWrapper>
              <Forum />
            </LazyWrapper>
          </Route>
          
          <Route path="saleshub">
            <LazyWrapper>
              <SalesHub />
            </LazyWrapper>
          </Route>
          
          <Route path="producthub">
            <LazyWrapper>
              <ProductHub />
            </LazyWrapper>
          </Route>
          
          <Route path="assessment">
            <LazyWrapper>
              <Assessment />
            </LazyWrapper>
          </Route>
          
          <Route path="find-grower">
            <LazyWrapper>
              <FindGrower />
            </LazyWrapper>
          </Route>
          
          <Route path="profile">
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          </Route>
        </Switch>
      </AppShell>
    </DemoProvider>
  );
}
