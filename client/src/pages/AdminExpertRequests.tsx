import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  HelpCircle,
  Calendar,
  User,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import type { ExpertRequest, User as UserType, Profile } from "@shared/schema";

type ExpertRequestWithUser = ExpertRequest & { user: UserType & { profile: Profile } };

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle }
];

const urgencyColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
};

export default function AdminExpertRequests() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expert requests
  const { data: requests = [], isLoading } = useQuery<ExpertRequestWithUser[]>({
    queryKey: ["/api/admin/expert-requests"],
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      apiRequest("PATCH", `/api/admin/expert-requests/${id}`, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-requests"] });
      toast({
        title: "Request Updated",
        description: "Expert request has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update expert request.",
        variant: "destructive",
      });
    },
  });

  // Filter requests
  const filteredRequests = requests.filter((item: ExpertRequestWithUser) => {
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus;
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  // Get unique categories
  const categories = Array.from(new Set(requests.map(r => r.category)));

  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      toast({
        title: "No Data",
        description: "No expert requests to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["Date", "Member", "Email", "Subject", "Category", "Urgency", "Status", "Contact Method", "Message", "Admin Notes"],
      ...filteredRequests.map((item: ExpertRequestWithUser) => [
        format(new Date(item.createdAt), "yyyy-MM-dd HH:mm"),
        item.user.profile?.name || item.user.username,
        item.user.email,
        `"${item.subject.replace(/"/g, '""')}"`,
        item.category,
        item.urgency,
        item.status,
        item.preferredContactMethod,
        `"${item.message.replace(/"/g, '""')}"`,
        `"${(item.adminNotes || '').replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expert-requests-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusDisplay = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || statusOptions[0];
  };

  const handleSaveNotes = (requestId: string) => {
    const notes = adminNotes[requestId];
    const request = requests.find(r => r.id === requestId);
    if (request) {
      updateStatus.mutate({ 
        id: requestId, 
        status: request.status,
        adminNotes: notes 
      });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Expert Requests</h1>
            <p className="text-gray-600 mt-1">
              Manage and respond to member requests for expert assistance
            </p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                </div>
                <HelpCircle className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {requests.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {requests.filter(r => r.status === "in_progress").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {requests.filter(r => r.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Expert Requests ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No expert requests found.
                </div>
              ) : (
                filteredRequests.map((item: ExpertRequestWithUser) => {
                  const statusDisplay = getStatusDisplay(item.status);
                  const StatusIcon = statusDisplay.icon;
                  const isExpanded = expandedRequest === item.id;
                  
                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {item.subject}
                            </h3>
                            <Badge className={urgencyColors[item.urgency as keyof typeof urgencyColors]}>
                              {item.urgency} urgency
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">
                                {item.user.profile?.name || item.user.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{item.user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MessageSquare className="h-3 w-3" />
                            Prefers: {item.preferredContactMethod}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <Badge className={statusDisplay.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusDisplay.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {item.message}
                        </p>
                      </div>

                      {/* Admin Section */}
                      <div className="border-t pt-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedRequest(isExpanded ? null : item.id)}
                            data-testid={`button-toggle-${item.id}`}
                          >
                            {isExpanded ? "Hide" : "Show"} Admin Details
                          </Button>
                          
                          <Select
                            value={item.status}
                            onValueChange={(value) => {
                              updateStatus.mutate({ 
                                id: item.id, 
                                status: value,
                                adminNotes: item.adminNotes || undefined
                              });
                            }}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {isExpanded && (
                          <div className="space-y-3 bg-blue-50 rounded-md p-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Notes
                              </label>
                              <Textarea
                                placeholder="Add internal notes about this request..."
                                value={adminNotes[item.id] ?? item.adminNotes ?? ''}
                                onChange={(e) => setAdminNotes({ ...adminNotes, [item.id]: e.target.value })}
                                rows={3}
                                className="bg-white"
                              />
                              <Button
                                size="sm"
                                className="mt-2"
                                onClick={() => handleSaveNotes(item.id)}
                                disabled={updateStatus.isPending}
                              >
                                Save Notes
                              </Button>
                            </div>

                            {item.resolvedAt && (
                              <div className="text-sm text-gray-600">
                                <strong>Resolved:</strong> {format(new Date(item.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                              </div>
                            )}
                          </div>
                        )}
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
