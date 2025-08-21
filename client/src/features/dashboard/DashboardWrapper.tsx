import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { DemoProvider } from "@/contexts/DemoContext";
import AppShell from "@/components/AppShell";
import LazyWrapper from "@/components/LazyWrapper";
import DashboardHome from "@/features/dashboard/DashboardHome";

// Lazy load feature components
const ResourcesRouter = lazy(() => import("@/pages/ResourcesRouter"));
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
  const basePath = isDemo ? "/demo" : "/dashboard";
  
  return (
    <DemoProvider isDemo={isDemo}>
      <AppShell>
        <Switch>
          {/* Feature Routes - Use absolute paths */}
          <Route path={`${basePath}/resources/:rest*`}>
            {() => {
              console.log('🔍 Resource route matched');
              return (
                <LazyWrapper>
                  <ResourcesRouter />
                </LazyWrapper>
              );
            }}
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
          
          <Route path={`${basePath}/assessment`}>
            <LazyWrapper>
              <Assessment />
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
          
          {/* Dashboard Home Route - must be last for specificity */}
          <Route path={basePath}>
            <DashboardHome />
          </Route>
        </Switch>
      </AppShell>
    </DemoProvider>
  );
}