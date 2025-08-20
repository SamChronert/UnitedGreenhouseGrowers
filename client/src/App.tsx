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
import DashboardWrapper from "@/features/dashboard/DashboardWrapper";
import AdminResources from "@/pages/AdminResources";
import AdminBlog from "@/pages/AdminBlog";
import AdminMembers from "@/pages/AdminMembers";
import AdminChallenges from "@/pages/AdminChallenges";
import AdminAssessmentTrainer from "@/pages/AdminAssessmentTrainer";
import AdminAnalytics from "@/pages/AdminAnalytics";

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
      <Route path="/demo" nest>
        <DashboardWrapper isDemo />
      </Route>
      
      <Route path="/dashboard" nest>
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
      
      <Route path="/blog" component={BlogPost}>
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

      {/* Admin routes with Layout */}
      <Route path="/admin/resources">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminResources />
          </AuthGuard>
        </LayoutWrapper>
      </Route>
      
      <Route path="/admin/blog">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminBlog />
          </AuthGuard>
        </LayoutWrapper>
      </Route>
      
      <Route path="/admin/members">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminMembers />
          </AuthGuard>
        </LayoutWrapper>
      </Route>
      
      <Route path="/admin/challenges">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminChallenges />
          </AuthGuard>
        </LayoutWrapper>
      </Route>
      
      <Route path="/admin/assessment-trainer">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminAssessmentTrainer />
          </AuthGuard>
        </LayoutWrapper>
      </Route>
      
      <Route path="/admin/analytics">
        <LayoutWrapper>
          <AuthGuard requireAdmin>
            <AdminAnalytics />
          </AuthGuard>
        </LayoutWrapper>
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
