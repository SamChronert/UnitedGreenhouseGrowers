import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
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

export default function DemoDashboard() {
  // Mock user data for demo
  const demoUser = {
    profile: {
      name: "Demo User"
    },
    username: "demo_user"
  };

  const memberTools = [
    // Row 1: Resource Library, Member Forum, Find a Grower
    {
      icon: <FolderOpen className="h-8 w-8" />,
      title: "Resource Library",
      description: "Browse curated grower resources — find relevant research findings, organizations near you, tax incentives and rebates, upcoming events, and more.",
      href: "/dashboard/resources",
      inDevelopment: true
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Member Forum",
      description: "Connect with fellow growers, share knowledge, organize bulk ordering.",
      href: "/dashboard/forum",
      inDevelopment: false
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Find a Grower",
      description: "Connect with growers by location and expertise",
      href: "/dashboard/find-grower",
      inDevelopment: true
    },
    // Row 2: Farm Assessment, Sales Hub, Product Hub, Member Profile
    {
      icon: <ClipboardList className="h-8 w-8" />,
      title: "Farm Assessment",
      description: "Respond to the prompts to determine which areas of your farm to work on to improve yield and profitability for your operation.",
      href: "/dashboard/assessment",
      inDevelopment: true
    },
    {
      icon: <Store className="h-8 w-8" />,
      title: "Sales Hub",
      description: "Find buyers and distributors for your products",
      href: "/dashboard/saleshub",
      inDevelopment: true
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Product Hub",
      description: "Browse vetted products and services",
      href: "/dashboard/producthub",
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

  const handleDemoAction = () => {
    alert("This is a demo dashboard. Please register or login to access full functionality.");
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Banner */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="font-semibold text-blue-900">Demo Dashboard</h3>
          </div>
          <p className="text-blue-800 text-sm">
            This is a preview of the UGGA member dashboard. <Link href="/register" className="underline hover:no-underline font-medium">Register here</Link> to access full functionality and connect with the grower community.
          </p>
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {demoUser.profile.name}
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
              Share Your Challenge
            </CardTitle>
            <p className="text-gray-600">Tell us about operational challenges, knowledge gaps, or areas where the industry needs better support. This will help us build tools for you, and eventually will be used to inform policy, research, and technology development.</p>
          </CardHeader>
          <CardContent>
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
                onClick={handleDemoAction}
                className="text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300"
                style={{backgroundColor: 'var(--color-clay)'}}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Challenge (Demo)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member Tools Grid */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Member Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {memberTools.slice(0, 3).map((tool, index) => (
              <div key={index} onClick={handleDemoAction} className="cursor-pointer">
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
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
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-4 gap-6 mt-6">
            {memberTools.slice(3, 7).map((tool, index) => (
              <div key={index + 3} onClick={handleDemoAction} className="cursor-pointer">
                <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full relative group focus:outline-none focus:ring-2 focus:ring-green-500">
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
                  className="bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary bg-gray-100"
                  disabled
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
                rows={4}
                className="bg-gray-100"
                disabled
              />
            </div>
            <Button 
              onClick={handleDemoAction}
              className="text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300"
              style={{backgroundColor: 'var(--color-clay)'}}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message (Demo)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}