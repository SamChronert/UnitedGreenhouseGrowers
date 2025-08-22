import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Link } from "wouter";
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

import ChallengeSubmissionForm from "@/components/ChallengeSubmissionForm";

export default function DashboardHome() {
  const { user } = useAuth();
  const { isDemo, showDemoAction } = useDemo();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState({
    subject: "",
    message: "",
    type: "feedback"
  });

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
    if (isDemo) {
      showDemoAction();
      return;
    }
    
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
      icon: <FolderOpen className="h-8 w-8" />,
      title: "Resource Library",
      description: "Browse curated grower resources — find relevant research, organizations near you, tax incentives and rebates, upcoming events, and more.",
      href: isDemo ? "/demo/resources" : "/dashboard/resources",
      inDevelopment: false
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Member Forum",
      description: "Connect with fellow growers, share knowledge, organize bulk ordering.",
      href: isDemo ? "/demo/forum" : "/dashboard/forum",
      inDevelopment: false
    },
    {
      icon: <Store className="h-8 w-8" />,
      title: "Sales Hub",
      description: "Find buyers and distributors for your products",
      href: isDemo ? "/demo/saleshub" : "/dashboard/saleshub",
      inDevelopment: true
    },
    // Row 2: Find a Grower, Farm Roadmap, Product Hub, Member Profile
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Find a Grower",
      description: "Connect with growers by location and expertise",
      href: isDemo ? "/demo/find-grower" : "/dashboard/find-grower",
      inDevelopment: true
    },
    {
      icon: <ClipboardList className="h-8 w-8" />,
      title: "Farm Roadmap",
      description: "Respond to the prompts to determine which areas of your farm to work on to improve yield and profitability for your operation.",
      href: isDemo ? "/demo/farm-roadmap" : "/dashboard/farm-roadmap",
      inDevelopment: true
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Product Hub",
      description: "Browse vetted products and services",
      href: isDemo ? "/demo/producthub" : "/dashboard/producthub",
      inDevelopment: true
    },
    {
      icon: <UserCircle className="h-8 w-8" />,
      title: "Member Profile",
      description: "Update your information and preferences",
      href: "/dashboard/profile",
      inDevelopment: false
    }
  ];

  const handleToolClick = (href: string) => {
    // For profile link in demo mode, show the demo action since profile requires authentication
    if (isDemo && href === "/dashboard/profile") {
      showDemoAction();
    }
    // All other links work normally (demo links go to demo pages, dashboard links go to dashboard pages)
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back, {isDemo ? "Demo User" : (user?.profile?.name || user?.username)}
        </h1>
        <p className="text-gray-600">
          Manage your profile, connect with growers, and access member tools
        </p>
      </div>

      {/* Challenge Submission Section */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-ugga-secondary" />
            We need your feedback!
          </CardTitle>
          <p className="text-gray-600">
            We want to make this association useful for you. Tell us what would help most, what's missing, or what you'd like to see—drop your thoughts in the box below!
          </p>
        </CardHeader>
        <CardContent>
          {isDemo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Category
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary bg-gray-100"
                    disabled
                  >
                    <option>Select a category...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Size
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary bg-gray-100"
                    disabled
                  >
                    <option>Select farm size...</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Description
                </label>
                <Textarea
                  placeholder="Describe the challenge you're facing..."
                  rows={4}
                  className="bg-gray-100"
                  disabled
                />
              </div>
              <Button 
                onClick={showDemoAction}
                className="text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300"
                style={{backgroundColor: 'var(--color-clay)'}}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Challenge (Demo)
              </Button>
            </div>
          ) : (
            <ChallengeSubmissionForm />
          )}
        </CardContent>
      </Card>

      {/* Member Tools Grid */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Member Tools</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {memberTools.slice(0, 3).map((tool, index) => (
            <div key={index} onClick={() => handleToolClick(tool.href)}>
              {isDemo && tool.href === "/dashboard/profile" ? (
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                  {tool.inDevelopment && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                        In Development
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/10 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-green-700">{tool.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                  </CardContent>
                </Card>
              ) : (
                <Link href={tool.href}>
                  <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                    {tool.inDevelopment && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                          In Development
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/10 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-green-700">{tool.icon}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          {memberTools.slice(3, 7).map((tool, index) => (
            <div key={index + 3} onClick={() => handleToolClick(tool.href)}>
              {isDemo && tool.href === "/dashboard/profile" ? (
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                  {tool.inDevelopment && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                        In Development
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/10 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-green-700">{tool.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                  </CardContent>
                </Card>
              ) : (
                <Link href={tool.href}>
                  <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
                    {tool.inDevelopment && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                          In Development
                        </span>
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/10 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200">
                        <span className="text-green-700">{tool.icon}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact UGGA Team Section */}
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
                disabled={isDemo}
                className={isDemo ? "bg-gray-100" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary ${isDemo ? "bg-gray-100" : ""}`}
                value={feedback.type}
                onChange={(e) => setFeedback({ ...feedback, type: e.target.value })}
                disabled={isDemo}
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
              disabled={isDemo}
              className={isDemo ? "bg-gray-100" : ""}
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
                {isDemo ? "Send Message (Demo)" : "Send Message"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
