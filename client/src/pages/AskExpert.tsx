import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Send, 
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ExpertRequest } from "@shared/schema";

type ExpertRequestWithUser = ExpertRequest & {
  user: {
    username: string;
    profile?: {
      name: string;
    };
  };
};

export default function AskExpert() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    preferredContactMethod: "email",
    urgency: "normal"
  });

  // Fetch user's previous requests
  const { data: requests = [], isLoading } = useQuery<ExpertRequestWithUser[]>({
    queryKey: ["/api/expert-requests"],
  });

  // Submit new request mutation
  const submitRequestMutation = useMutation({
    mutationFn: (requestData: typeof formData) =>
      apiRequest("POST", "/api/expert-requests", requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expert-requests"] });
      setFormData({
        subject: "",
        category: "",
        message: "",
        preferredContactMethod: "email",
        urgency: "normal"
      });
      toast({
        title: "Success",
        description: "Your request has been submitted. Our team will be in touch soon!",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.category || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitRequestMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-ugga-primary" />
            Ask an Expert
          </h1>
          <p className="text-gray-600">
            Connect with our network of industry professionals and academic experts. 
            We're here to help with questions about starting, operating, or improving your greenhouse operation.
          </p>
        </div>

        {/* Submit New Request Form */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Submit a New Request</CardTitle>
            <p className="text-gray-600">
              Tell us what you need help with, and we'll connect you with the right expert.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    data-testid="input-subject"
                    placeholder="Brief description of your question"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    data-testid="select-category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    <option value="starting-greenhouse">Starting a Greenhouse</option>
                    <option value="operations">Greenhouse Operations</option>
                    <option value="plant-health">Plant Health & Pest Management</option>
                    <option value="technology">Technology & Equipment</option>
                    <option value="business">Business & Marketing</option>
                    <option value="regulations">Regulations & Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <select
                    id="contactMethod"
                    data-testid="select-contact-method"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary"
                    value={formData.preferredContactMethod}
                    onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="video">Video Consultation</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <select
                    id="urgency"
                    data-testid="select-urgency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ugga-primary"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="normal">Normal - Within a week</option>
                    <option value="high">High - Within 2-3 days</option>
                    <option value="urgent">Urgent - Same day if possible</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Your Question/Request *</Label>
                <Textarea
                  id="message"
                  data-testid="textarea-message"
                  placeholder="Please provide as much detail as possible about your question or the consultation you're looking for..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                />
              </div>

              <Button 
                type="submit"
                disabled={submitRequestMutation.isPending}
                className="text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all duration-300"
                style={{backgroundColor: 'var(--color-sage)'}}
                data-testid="button-submit-request"
              >
                {submitRequestMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Your Previous Requests</CardTitle>
            <p className="text-gray-600">
              Track the status of your expert consultation requests
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading your requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                You haven't submitted any requests yet.
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div 
                    key={request.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{request.subject}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.message}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded-md">{request.category}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                          <span>•</span>
                          <span className="capitalize">{request.urgency} urgency</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium capitalize">{request.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
