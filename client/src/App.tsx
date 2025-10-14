import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessibilityProvider from "@/components/AccessibilityProvider";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Resources from "@/pages/Resources";
import ResourceDetail from "@/pages/ResourceDetail";
import SavedResources from "@/pages/SavedResources";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import DashboardWrapper from "@/features/dashboard/DashboardWrapper";
import AdminWrapper from "@/features/admin/AdminWrapper";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <main id="main-content" role="main" aria-label="Main content">
        {children}
      </main>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      {/* App Shell routes - bypass main Layout */}
      <Route path="/demo">
        <DashboardWrapper isDemo />
      </Route>
      
      <Route path="/demo/*">
        <DashboardWrapper isDemo />
      </Route>
      
      {/* Dashboard routes */}
      <Route path="/dashboard">
        <AuthGuard requireMember>
          <DashboardWrapper />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard/*">
        <AuthGuard requireMember>
          <DashboardWrapper />
        </AuthGuard>
      </Route>

      {/* Public routes with Layout */}
      <Route path="/">
        <LayoutWrapper>
          <Home />
        </LayoutWrapper>
      </Route>
      
      <Route path="/about">
        <LayoutWrapper>
          <About />
        </LayoutWrapper>
      </Route>
      
      <Route path="/contact">
        <LayoutWrapper>
          <Contact />
        </LayoutWrapper>
      </Route>
      
      <Route path="/blog">
        <LayoutWrapper>
          <Blog />
        </LayoutWrapper>
      </Route>
      
      <Route path="/blog/:slug">
        <LayoutWrapper>
          <BlogPost />
        </LayoutWrapper>
      </Route>
      
      <Route path="/library">
        <LayoutWrapper>
          <Resources />
        </LayoutWrapper>
      </Route>
      
      <Route path="/register">
        <LayoutWrapper>
          <Register />
        </LayoutWrapper>
      </Route>
      
      <Route path="/login">
        <LayoutWrapper>
          <Login />
        </LayoutWrapper>
      </Route>
      
      <Route path="/reset-password">
        <LayoutWrapper>
          <ResetPassword />
        </LayoutWrapper>
      </Route>

      {/* Admin routes - bypass main Layout */}
      <Route path="/admin">
        <AuthGuard requireAdmin>
          <AdminWrapper />
        </AuthGuard>
      </Route>
      
      <Route path="/admin/*">
        <AuthGuard requireAdmin>
          <AdminWrapper />
        </AuthGuard>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <LayoutWrapper>
          <NotFound />
        </LayoutWrapper>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider enableReporting={process.env.NODE_ENV === 'development'}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
