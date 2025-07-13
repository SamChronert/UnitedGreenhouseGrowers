import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Resources from "@/pages/Resources";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import FindGrower from "@/pages/FindGrower";
import Assessment from "@/pages/Assessment";
import AdminResources from "@/pages/AdminResources";
import AdminBlog from "@/pages/AdminBlog";
import AdminMembers from "@/pages/AdminMembers";
import AdminChallenges from "@/pages/AdminChallenges";
import AdminAssessmentTrainer from "@/pages/AdminAssessmentTrainer";
import Forum from "@/pages/Forum";

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
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />

      {/* Protected member routes */}
      <Route path="/dashboard">
        <AuthGuard requireMember>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/profile">
        <AuthGuard requireMember>
          <Profile />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/find-grower">
        <AuthGuard requireMember>
          <FindGrower />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/assessment">
        <AuthGuard requireMember>
          <Assessment />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/resources">
        <AuthGuard requireMember>
          <Resources />
        </AuthGuard>
      </Route>
      <Route path="/dashboard/forum">
        <AuthGuard requireMember>
          <Forum />
        </AuthGuard>
      </Route>
      <Route path="/forum">
        {() => {
          // Redirect to dashboard forum
          window.location.href = '/dashboard/forum';
          return null;
        }}
      </Route>
      <Route path="/resources">
        {() => {
          // Redirect to dashboard resources
          window.location.href = '/dashboard/resources';
          return null;
        }}
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

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Toaster />
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
