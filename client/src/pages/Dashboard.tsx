import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Newspaper, 
  Headphones,
  Edit,
  Calendar,
  MessageSquare,
  Send,
  Mail,
  MapPin,
  ClipboardList,
  FolderOpen,
  UserCircle,
  LifeBuoy,
  MessageCircle,
  Check,
  Badge
} from "lucide-react";

import ChatWidget from "@/components/ChatWidget";
import ChallengeSubmissionForm from "@/components/ChallengeSubmissionForm";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState({
    subject: "",
    message: "",
    type: "feedback"
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

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

  // Onboarding steps tracking
  const onboardingSteps = [
    {
      id: "profile",
      title: "Complete Profile",
      completed: !!(user?.profile?.name && user?.profile?.state && user?.profile?.farmType)
    },
    {
      id: "explore",
      title: "Explore Dashboard",
      completed: true // Auto-complete when they visit dashboard
    },
    {
      id: "challenge",
      title: "Share Challenge",
      completed: false // This would be tracked via backend in real implementation
    },
    {
      id: "resources",
      title: "Read Resources",
      completed: false // This would be tracked via backend in real implementation
    }
  ];

  const memberTools = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Find a Grower",
      description: "Connect with growers by location and expertise",
      href: "/dashboard/find-grower",
      inDevelopment: true,
      color: "bg-blue-500"
    },
    {
      icon: <ClipboardList className="h-8 w-8" />,
      title: "Farm Assessment",
      description: "Get AI-powered analysis and recommendations",
      href: "/dashboard/assessment",
      inDevelopment: true,
      color: "bg-green-500"
    },
    {
      icon: <FolderOpen className="h-8 w-8" />,
      title: "Resource Library",
      description: "Browse curated grower resources",
      href: "/resources",
      inDevelopment: false,
      color: "bg-orange-500"
    },
    {
      icon: <UserCircle className="h-8 w-8" />,
      title: "Member Profile",
      description: "Update your information and preferences",
      href: "/dashboard/profile",
      inDevelopment: false,
      color: "bg-purple-500"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Support",
      description: "Get help and contact the UGGA team",
      href: "/contact",
      inDevelopment: false,
      color: "bg-gray-500"
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
            Manage your profile, connect with growers, and access member tools
          </p>
        </div>

        {/* Onboarding Progress Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <p className="text-sm text-gray-600">Complete these steps to get the most out of UGGA</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      step.completed ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div className={`hidden sm:block w-8 h-0.5 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Tools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Member Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberTools.map((tool, index) => (
              <Link key={index} href={tool.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full relative group">
                  {tool.inDevelopment && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full border border-orange-200">
                        In Development
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${tool.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <span className="text-white">{tool.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Forum Preview Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Member Forum
            </CardTitle>
            <Link href="/forum">
              <Button variant="outline" size="sm">
                View All Discussions
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect with fellow growers, ask questions, and share your expertise in our member-only forum.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Recent Discussions</h4>
                <p className="text-sm text-gray-600">Join ongoing conversations about greenhouse challenges and solutions</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Ask Questions</h4>
                <p className="text-sm text-gray-600">Get help from experienced growers in your region or specialty</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Share Knowledge</h4>
                <p className="text-sm text-gray-600">Help other growers by sharing your experiences and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary Card */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Profile Summary</CardTitle>
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium">{user?.profile?.state || "Not specified"}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Farm Type</p>
                <p className="font-medium">{user?.profile?.farmType || "Not specified"}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Unknown"}
                </p>
              </div>
              {user?.profile?.employer && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Employer</p>
                  <p className="font-medium">{user.profile.employer}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Challenge Submission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-ugga-secondary" />
              Share Your Challenge
            </CardTitle>
            <p className="text-gray-600">
              Tell us about operational challenges, knowledge gaps, or areas where the industry needs better support
            </p>
          </CardHeader>
          <CardContent>
            <ChallengeSubmissionForm />
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-ugga-secondary" />
              Contact UGGA Team
            </CardTitle>
            <p className="text-gray-600">
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
              className="bg-ugga-secondary hover:bg-ugga-secondary/90"
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




      </div>
    </div>
  );
}
