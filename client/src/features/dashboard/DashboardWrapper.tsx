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
          {/* Dashboard Home */}
          <Route path="/dashboard" component={DashboardHome} />
          
          {/* Feature Routes - Lazy Loaded */}
          <Route path="/dashboard/resources">
            <LazyWrapper>
              <Resources />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/resources/saved">
            <LazyWrapper>
              <SavedResources />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/resources/:id">
            <LazyWrapper>
              <ResourceDetail />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/forum">
            <LazyWrapper>
              <Forum />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/saleshub">
            <LazyWrapper>
              <SalesHub />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/producthub">
            <LazyWrapper>
              <ProductHub />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/assessment">
            <LazyWrapper>
              <Assessment />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/find-grower">
            <LazyWrapper>
              <FindGrower />
            </LazyWrapper>
          </Route>
          
          <Route path="/dashboard/profile">
            <LazyWrapper>
              <Profile />
            </LazyWrapper>
          </Route>
          
          {/* Demo Routes - Same components but in demo context */}
          {isDemo && (
            <>
              <Route path="/demo">
                <DashboardHome />
              </Route>
              
              <Route path="/demo/resources">
                <LazyWrapper>
                  <Resources />
                </LazyWrapper>
              </Route>
              
              <Route path="/demo/forum">
                <LazyWrapper>
                  <Forum />
                </LazyWrapper>
              </Route>
              
              <Route path="/demo/saleshub">
                <LazyWrapper>
                  <SalesHub />
                </LazyWrapper>
              </Route>
              
              <Route path="/demo/producthub">
                <LazyWrapper>
                  <ProductHub />
                </LazyWrapper>
              </Route>
              
              <Route path="/demo/assessment">
                <LazyWrapper>
                  <Assessment />
                </LazyWrapper>
              </Route>
              
              <Route path="/demo/find-grower">
                <LazyWrapper>
                  <FindGrower />
                </LazyWrapper>
              </Route>
            </>
          )}
        </Switch>
      </AppShell>
    </DemoProvider>
  );
}
