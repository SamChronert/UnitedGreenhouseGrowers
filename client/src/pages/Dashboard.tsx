import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare,
  Send,
  Mail,
  MapPin,
  ClipboardList,
  FolderOpen,
  UserCircle,
  MessageCircle,
  Store,
  ShoppingBag
} from "lucide-react";

import ChatWidget from "@/components/ChatWidget";
import ChallengeSubmissionForm from "@/components/ChallengeSubmissionForm";
import AdminDashboardHome from "@/components/AdminDashboardHome";

export default function Dashboard() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState({
    subject: "",
    message: "",
    type: "feedback"
  });
  
  // Check URL params to determine if showing admin dashboard
  const showAdminDashboard = new URLSearchParams(location.split('?')[1] || '').get('admin') === 'true';
  
  // Update page title based on current view
  useEffect(() => {
    if (showAdminDashboard) {
      document.title = 'Admin Dashboard - UGGA Platform';
    } else {
      document.title = 'Dashboard - UGGA Platform';
    }
    return () => {
      document.title = 'UGGA Platform';
    };
  }, [showAdminDashboard]);
  


  // Feedback submission mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (feedbackData: { subject: string; message: string; type: string }) =>
      apiRequest("POST", "/api/feedback", feedbackData),
    onSuccess: () => {
      setFeedback({ subject: "", message: "", type: "feedback" });
      toast({
        title: "Success",
        description: "Your feedback has been sent to the UGGA team. Thank you!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFeedbackSubmit = () => {
    if (!feedback.subject.trim() || !feedback.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }
    submitFeedbackMutation.mutate(feedback);
  };

  const memberTools = [
    // Row 1: Resource Library, Member Forum, Sales Hub
    {
      icon: <FolderOpen className="h-8 w-8" style={{ color: "#c2410c" }} />,
      title: "Resource Library",
      description: "Browse curated grower resources — find relevant research, organizations near you, tax incentives and rebates, upcoming events, and more.",
      href: "/dashboard/resources",
      inDevelopment: false,
      iconBgColor: "#fed7aa"
    },
    {
      icon: <MessageCircle className="h-8 w-8" style={{ color: "#7c3aed" }} />,
      title: "Member Forum",
      description: "Connect with fellow growers, share knowledge, organize bulk ordering.",
      href: "/dashboard/forum",
      inDevelopment: false,
      iconBgColor: "#e9d5ff"
    },
    {
      icon: <Store className="h-8 w-8" style={{ color: "#16a34a" }} />,
      title: "Sales Hub",
      description: "Find buyers and distributors for your products",
      href: "/dashboard/saleshub",
      inDevelopment: true,
      iconBgColor: "#bbf7d0"
    },
    // Row 2: Find a Grower, Farm Roadmap, Product Hub, Member Profile
    {
      icon: <MapPin className="h-8 w-8" style={{ color: "#1d4ed8" }} />,
      title: "Find a Grower",
      description: "Connect with growers by location and expertise",
      href: "/dashboard/find-grower",
      inDevelopment: true,
      iconBgColor: "#dbeafe"
    },
    {
      icon: <ClipboardList className="h-8 w-8" style={{ color: "#dc2626" }} />,
      title: "Farm Roadmap",
      description: "Respond to the prompts to determine which areas of your farm to work on to improve yield and profitability for your operation.",
      href: "/dashboard/farm-roadmap",
      inDevelopment: true,
      iconBgColor: "#fecaca"
    },
    {
      icon: <ShoppingBag className="h-8 w-8" style={{ color: "#db2777" }} />,
      title: "Product Hub",
      description: "Browse vetted products and services",
      href: "/dashboard/producthub",
      inDevelopment: true,
      iconBgColor: "#fce7f3"
    },
    {
      icon: <UserCircle className="h-8 w-8" style={{ color: "#4f46e5" }} />,
      title: "Member Profile",
      description: "Update your information and preferences",
      href: "/dashboard/profile",
      inDevelopment: false,
      iconBgColor: "#e0e7ff"
    }
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {user?.profile?.name || user?.username}
          </h1>
          <p className="text-gray-600">
            {showAdminDashboard 
              ? "Manage platform content, users, and view analytics"
              : "Manage your profile, connect with growers, and access member tools"
            }
          </p>
        </div>

        {/* Conditional Content */}
        {showAdminDashboard ? (
          /* Admin Dashboard */
          <AdminDashboardHome />
        ) : (
          /* Regular Member Dashboard */
          <>
            {/* Challenge Submission Section */}
            <Card className="mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-ugga-secondary" />
                  We want to hear from you!
                </CardTitle>
                <p className="text-gray-600">
                  We want this association to make a real difference for growers. To help shape that vision, we'd love to know: what does a "United Greenhouse Growers Association" look like to you?
                </p>
              </CardHeader>
              <CardContent>
                <ChallengeSubmissionForm />
              </CardContent>
            </Card>

            {/* Member Tools Grid */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Member Tools</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {memberTools.slice(0, 3).map((tool, index) => (
                  <Link key={index} href={tool.href}>
                    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                      {tool.inDevelopment && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                            In Development
                          </span>
                        </div>
                      )}
                      <CardContent className="p-6 text-center">
                        <div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: tool.iconBgColor }}
                        >
                          {tool.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="grid md:grid-cols-4 gap-6 mt-6">
                {memberTools.slice(3, 7).map((tool, index) => (
                  <Link key={index + 3} href={tool.href}>
                    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                      {tool.inDevelopment && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                            In Development
                          </span>
                        </div>
                      )}
                      <CardContent className="p-6 text-center">
                        <div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: tool.iconBgColor }}
                        >
                          {tool.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}



        {/* Contact UGGA Team Section - Only show on regular dashboard */}
        {!showAdminDashboard && (
          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Mail className="h-5 w-5 text-ugga-secondary" />
                Contact UGGA Team
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Share feedback, request features, or message the UGGA team directly
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    placeholder="e.g., Feature request, Bug report, General feedback"
                    value={feedback.subject}
                    onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary"
                    value={feedback.type}
                    onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="bug-report">Bug Report</option>
                    <option value="question">Question</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Tell us what's on your mind..."
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleFeedbackSubmit}
                disabled={submitFeedbackMutation.isPending}
                className="text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300"
                style={{backgroundColor: 'var(--color-clay)'}}
                aria-label="Submit feedback to UGGA development team"
              >
                {submitFeedbackMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}




      </div>
    </div>
  );
}
