import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  User, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Newspaper, 
  Headphones,
  Edit,
  Calendar
} from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

export default function Dashboard() {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
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
            Manage your profile, connect with growers, and access AI tools
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
                    {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
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

          {/* AI Tools Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Find-a-Grower Widget */}
            <div className="h-80">
              <ChatWidget
                title="Find-a-Grower AI"
                placeholder="e.g., Find tomato growers in Florida with hydroponic experience"
                endpoint="/api/ai/find-grower"
                icon={<Users className="h-5 w-5" />}
              />
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
                  Get AI-powered analysis and recommendations for your greenhouse operation
                </p>
                <Link href="/dashboard/assessment">
                  <Button className="bg-ugga-secondary hover:bg-ugga-secondary/90">
                    Start Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

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

        {/* Recent Activity / Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">5,000+</div>
              <div className="text-sm text-gray-600">Network Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">50</div>
              <div className="text-sm text-gray-600">States Represented</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-ugga-primary mb-2">1,000+</div>
              <div className="text-sm text-gray-600">Resources Available</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
