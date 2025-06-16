import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download, 
  Flag, 
  Calendar, 
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import type { GrowerChallenge, User, Profile } from "@shared/schema";

type ChallengeWithUser = GrowerChallenge & { user: User & { profile: Profile } };

const flagOptions = [
  { value: "", label: "No flag", color: "bg-gray-100 text-gray-600" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-700" },
  { value: "important", label: "Important", color: "bg-red-100 text-red-700" },
  { value: "needs_follow_up", label: "Needs Follow-Up", color: "bg-yellow-100 text-yellow-700" }
];

const categoryColors = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", 
  "#6366f1", "#84cc16", "#f97316", "#ec4899", "#64748b"
];

export default function AdminChallenges() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFlag, setSelectedFlag] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["/api/admin/challenges"],
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/challenges/stats"],
  });

  // Update flag mutation
  const updateFlag = useMutation({
    mutationFn: ({ id, adminFlag }: { id: string; adminFlag: string }) =>
      apiRequest("PATCH", `/api/admin/challenges/${id}/flag`, { adminFlag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({
        title: "Flag Updated",
        description: "Challenge flag has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update challenge flag.",
        variant: "destructive",
      });
    },
  });

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge: ChallengeWithUser) => {
    const categoryMatch = selectedCategory === "all" || challenge.category === selectedCategory;
    const flagMatch = selectedFlag === "all" || 
      (selectedFlag === "none" && !challenge.adminFlag) ||
      challenge.adminFlag === selectedFlag;
    return categoryMatch && flagMatch;
  });

  // Prepare chart data
  const categoryData = stats?.categoryCounts ? 
    Object.entries(stats.categoryCounts).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count
    })) : [];

  const exportToCSV = () => {
    if (filteredChallenges.length === 0) {
      toast({
        title: "No Data",
        description: "No challenges to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["Date", "Member", "Email", "Category", "Description", "Flag"],
      ...filteredChallenges.map((challenge: ChallengeWithUser) => [
        format(new Date(challenge.createdAt), "yyyy-MM-dd HH:mm"),
        challenge.user.profile?.name || challenge.user.username,
        challenge.user.email,
        challenge.category || "Uncategorized",
        `"${challenge.description.replace(/"/g, '""')}"`,
        challenge.adminFlag || "None"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grower-challenges-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFlagDisplay = (flag: string | null) => {
    const option = flagOptions.find(opt => opt.value === (flag || ""));
    return option || flagOptions[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grower Challenges Insights</h1>
            <p className="text-gray-600 mt-1">
              Track and analyze challenges submitted by growers
            </p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCount || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-ugga-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Recent (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.recentCount || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(stats?.categoryCounts || {}).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {categoryData.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Challenges by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="irrigation">Irrigation</SelectItem>
                    <SelectItem value="disease">Disease</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="economics">Economics</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Flag
                </label>
                <Select value={selectedFlag} onValueChange={setSelectedFlag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flags</SelectItem>
                    <SelectItem value="none">No Flag</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="needs_follow_up">Needs Follow-Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenges List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Challenge Submissions ({filteredChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredChallenges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No challenges found matching the current filters.
                </div>
              ) : (
                filteredChallenges.map((challenge: ChallengeWithUser) => {
                  const flagDisplay = getFlagDisplay(challenge.adminFlag);
                  
                  return (
                    <div key={challenge.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {challenge.user.profile?.name || challenge.user.username}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {challenge.user.email}
                            </span>
                            {challenge.category && (
                              <Badge variant="secondary">
                                {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(challenge.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={flagDisplay.color}>
                            {flagDisplay.label}
                          </Badge>
                          
                          <Select
                            value={challenge.adminFlag || ""}
                            onValueChange={(value) => updateFlag.mutate({ 
                              id: challenge.id, 
                              adminFlag: value 
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Set flag" />
                            </SelectTrigger>
                            <SelectContent>
                              {flagOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}