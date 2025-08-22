import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  GraduationCap,
  Building2,
  DollarSign,
  Wrench,
  BookOpen,
  Newspaper,
  Users,
  MessageSquare,
  TrendingUp,
  Target
} from "lucide-react";

export default function AdminDashboardHome() {
  const adminTools = [
    // Row 1: Core Management Tools
    {
      icon: <GraduationCap className="h-8 w-8" style={{ color: "#c2410c" }} />,
      title: "Resource Management",
      description: "Manage all resource types: universities, organizations, grants, tools, templates, learning materials, and industry news.",
      href: "/admin/resources",
      iconBgColor: "#fed7aa"
    },
    {
      icon: <Newspaper className="h-8 w-8" style={{ color: "#7c3aed" }} />,
      title: "Blog Management",
      description: "Create, edit, and publish blog posts for the UGGA community.",
      href: "/admin/blog",
      iconBgColor: "#e9d5ff"
    },
    {
      icon: <Users className="h-8 w-8" style={{ color: "#16a34a" }} />,
      title: "Member Management",
      description: "View and manage member accounts, roles, and profile information.",
      href: "/admin/members",
      iconBgColor: "#bbf7d0"
    },
    // Row 2: Analytics & Insights
    {
      icon: <MessageSquare className="h-8 w-8" style={{ color: "#1d4ed8" }} />,
      title: "Feedback",
      description: "View feedback and messages from the dashboard.",
      href: "/admin/challenges",
      iconBgColor: "#dbeafe"
    },
    {
      icon: <TrendingUp className="h-8 w-8" style={{ color: "#dc2626" }} />,
      title: "Platform Analytics",
      description: "View platform usage statistics, user engagement metrics, and resource popularity.",
      href: "/admin/analytics",
      iconBgColor: "#fecaca"
    },
    {
      icon: <Target className="h-8 w-8" style={{ color: "#db2777" }} />,
      title: "Assessment Trainer",
      description: "Manage and train the AI assessment system for farm roadmap recommendations.",
      href: "/admin/assessment-trainer",
      iconBgColor: "#fce7f3"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Admin Tools</h2>
        <p className="text-gray-600">
          Manage platform content, users, and view analytics
        </p>
      </div>

      {/* Admin Tools Grid */}
      <div>
        {/* First row - 3 tools */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {adminTools.slice(0, 3).map((tool, index) => (
            <Link key={index} href={tool.href}>
              <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full group focus:outline-none focus:ring-2 focus:ring-red-500">
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

        {/* Second row - 3 tools */}
        <div className="grid md:grid-cols-3 gap-6">
          {adminTools.slice(3, 6).map((tool, index) => (
            <Link key={index + 3} href={tool.href}>
              <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full group focus:outline-none focus:ring-2 focus:ring-red-500">
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
    </div>
  );
}