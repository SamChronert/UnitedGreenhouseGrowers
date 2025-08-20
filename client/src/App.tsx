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

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/resources" component={Resources} />
      <Route path="/demo" nest>
        <DashboardWrapper isDemo />
      </Route>
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />

      {/* Protected dashboard routes - using App Shell */}
      <Route path="/dashboard" nest>
        <AuthGuard requireMember>
          <DashboardWrapper />
        </AuthGuard>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/resources">
        <AuthGuard requireAdmin>
          <AdminResources />
        </AuthGuard>
      </Route>
      <Route path="/admin/blog">
        <AuthGuard requireAdmin>
          <AdminBlog />
        </AuthGuard>
      </Route>
      <Route path="/admin/members">
        <AuthGuard requireAdmin>
          <AdminMembers />
        </AuthGuard>
      </Route>
      <Route path="/admin/challenges">
        <AuthGuard requireAdmin>
          <AdminChallenges />
        </AuthGuard>
      </Route>
      <Route path="/admin/assessment-trainer">
        <AuthGuard requireAdmin>
          <AdminAssessmentTrainer />
        </AuthGuard>
      </Route>
      <Route path="/admin/analytics">
        <AuthGuard requireAdmin>
          <AdminAnalytics />
        </AuthGuard>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider enableReporting={process.env.NODE_ENV === 'development'}>
        <TooltipProvider>
          <Layout>
            <main id="main-content" role="main" aria-label="Main content">
              <Router />
            </main>
            <Toaster />
          </Layout>
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
