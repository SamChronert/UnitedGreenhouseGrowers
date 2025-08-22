import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Flag, 
  MessageSquare,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";
import type { GrowerChallenge, User as UserType, Profile } from "@shared/schema";

type FeedbackWithUser = GrowerChallenge & { user: UserType & { profile: Profile } };

const flagOptions = [
  { value: "none", label: "No flag", color: "bg-gray-100 text-gray-600" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-700" },
  { value: "important", label: "Important", color: "bg-red-100 text-red-700" },
  { value: "needs_follow_up", label: "Needs Follow-Up", color: "bg-yellow-100 text-yellow-700" }
];

export default function AdminChallenges() {
  const [selectedFlag, setSelectedFlag] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedback = [], isLoading } = useQuery<FeedbackWithUser[]>({
    queryKey: ["/api/admin/challenges"],
  });

  // Update flag mutation
  const updateFlag = useMutation({
    mutationFn: ({ id, adminFlag }: { id: string; adminFlag: string }) =>
      apiRequest("PATCH", `/api/admin/challenges/${id}/flag`, { adminFlag }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({
        title: "Flag Updated",
        description: "Feedback flag has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update feedback flag.",
        variant: "destructive",
      });
    },
  });

  // Filter feedback
  const filteredFeedback = feedback.filter((item: FeedbackWithUser) => {
    const flagMatch = selectedFlag === "all" || 
      (selectedFlag === "none" && !item.adminFlag) ||
      item.adminFlag === selectedFlag;
    return flagMatch;
  });


  const exportToCSV = () => {
    if (filteredFeedback.length === 0) {
      toast({
        title: "No Data",
        description: "No feedback to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["Date", "Member", "Email", "Description", "Flag"],
      ...filteredFeedback.map((item: FeedbackWithUser) => [
        format(new Date(item.createdAt), "yyyy-MM-dd HH:mm"),
        item.user.profile?.name || item.user.username,
        item.user.email,
        `"${item.description.replace(/"/g, '""')}"`,
        item.adminFlag || "None"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grower-feedback-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFlagDisplay = (flag: string | null) => {
    if (!flag) return flagOptions[0]; // Return "No flag" option
    const option = flagOptions.find(opt => opt.value === flag);
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
            <h1 className="text-3xl font-bold text-gray-900">Grower Feedback</h1>
            <p className="text-gray-600 mt-1">
              View feedback submitted by growers from the dashboard
            </p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>



        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
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

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Submissions ({filteredFeedback.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feedback submissions found.
                </div>
              ) : (
                filteredFeedback.map((item: FeedbackWithUser) => {
                  const flagDisplay = getFlagDisplay(item.adminFlag);
                  
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {item.user.profile?.name || item.user.username}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {item.user.email}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={flagDisplay.color}>
                            {flagDisplay.label}
                          </Badge>
                          
                          <Select
                            value={item.adminFlag || "none"}
                            onValueChange={(value) => {
                              const newFlag = value === "none" ? null : value;
                              updateFlag.mutate({ 
                                id: item.id, 
                                adminFlag: newFlag || "" 
                              });
                            }}
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