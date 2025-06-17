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
  Mail
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

  const quickActions = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Resources",
      description: "Browse curated resources",
      href: "/dashboard/resources",
      color: "bg-ugga-primary"
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "Edit Profile",
      description: "Update your information",
      href: "/dashboard/profile",
      color: "bg-ugga-secondary"
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      title: "Blog",
      description: "Read latest articles",
      href: "/blog",
      color: "bg-ugga-accent"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Support",
      description: "Get help and assistance",
      href: "/contact",
      color: "bg-gray-600"
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

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Profile Summary</CardTitle>
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{user?.profile?.state || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farm Type:</span>
                  <span className="font-medium">{user?.profile?.farmType || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown"}
                  </span>
                </div>
                {user?.profile?.employer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employer:</span>
                    <span className="font-medium">{user.profile.employer}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Member Tools Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Find-a-Grower Widget */}
            <div className="space-y-2">
              <div className="h-80">
                <ChatWidget
                  title="Find-a-Grower"
                  placeholder="e.g., Find tomato growers in Florida with hydroponic experience"
                  endpoint="/api/ai/find-grower"
                  icon={<Users className="h-5 w-5" />}
                />
              </div>
              <p className="text-sm text-gray-500 italic">
                This tool is still under development and being refined based on member feedback.
              </p>
            </div>

            {/* Farm Assessment Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-ugga-secondary" />
                  Farm Assessment Tool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get analysis and recommendations for your greenhouse operation
                </p>
                <Link href="/dashboard/assessment">
                  <Button className="bg-ugga-secondary hover:bg-ugga-secondary/90">
                    Start Assessment
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 italic mt-3">
                  This tool is still under development and being refined based on member feedback.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

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

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${action.color} rounded-full mb-4`}>
                    <span className="text-white">{action.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>


      </div>
    </div>
  );
}
