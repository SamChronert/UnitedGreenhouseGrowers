import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Plus, 
  Upload,
  FileText,
  Image,
  Tag,
  Calendar,
  Trash2,
  Edit3,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import type { AssessmentTrainingData } from "@shared/schema";

function AdminAssessmentTrainer() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ 
    title: "", 
    content: "", 
    tags: "" 
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch training data
  const { data: trainingData = [], isLoading } = useQuery({
    queryKey: ["/api/admin/assessment-training"],
    queryFn: () => apiRequest("GET", "/api/admin/assessment-training"),
  });

  // Create training data mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; tags: string[] }) =>
      apiRequest("POST", "/api/admin/assessment-training", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment-training"] });
      setNewItem({ title: "", content: "", tags: "" });
      setShowCreate(false);
      toast({
        title: "Success",
        description: "Training data added successfully!",
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

  // Update training data mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssessmentTrainingData> }) =>
      apiRequest("PUT", `/api/admin/assessment-training/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment-training"] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Training data updated successfully!",
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

  // Delete training data mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/assessment-training/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assessment-training"] });
      toast({
        title: "Success",
        description: "Training data deleted successfully!",
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

  const handleCreate = () => {
    if (!newItem.title.trim() || !newItem.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    const tags = newItem.tags.split(",").map(tag => tag.trim()).filter(Boolean);
    createMutation.mutate({
      title: newItem.title,
      content: newItem.content,
      tags
    });
  };

  const handleUpdate = (item: AssessmentTrainingData, updatedData: Partial<AssessmentTrainingData>) => {
    updateMutation.mutate({ id: item.id, data: updatedData });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this training data? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ugga-secondary rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assessment Trainer</h1>
                <p className="text-gray-600">
                  Add context and examples to improve Farm Assessment recommendations
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Training Data
            </Button>
          </div>
        </div>

        {/* Create Training Data */}
        {showCreate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Training Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title (e.g., 'Humidity Control Best Practices')"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
              <Textarea
                placeholder="Detailed content, examples, or reference information..."
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                rows={8}
              />
              <Input
                placeholder="Tags (comma-separated: humidity, climate, greenhouse)"
                value={newItem.tags}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Training Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Training Data List */}
        <div className="space-y-6">
          {trainingData.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No training data yet</h3>
                <p className="text-gray-600 mb-4">
                  Start adding expert knowledge and examples to improve assessment recommendations.
                </p>
                <Button onClick={() => setShowCreate(true)}>
                  Add First Training Data
                </Button>
              </CardContent>
            </Card>
          ) : (
            trainingData.map((item: AssessmentTrainingData) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingItem === item.id ? (
                        <Input
                          defaultValue={item.title}
                          onBlur={(e) => handleUpdate(item, { title: e.target.value })}
                          className="font-semibold text-lg"
                        />
                      ) : (
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {item.title}
                        </CardTitle>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>Added {format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                        {item.updatedAt !== item.createdAt && (
                          <>
                            <span>•</span>
                            <span>Updated {format(new Date(item.updatedAt), "MMM d, yyyy")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                      >
                        {editingItem === item.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingItem === item.id ? (
                    <div className="space-y-4">
                      <Textarea
                        defaultValue={item.content}
                        onBlur={(e) => handleUpdate(item, { content: e.target.value })}
                        rows={6}
                      />
                      <Input
                        defaultValue={item.tags?.join(", ") || ""}
                        onBlur={(e) => {
                          const tags = e.target.value.split(",").map(tag => tag.trim()).filter(Boolean);
                          handleUpdate(item, { tags });
                        }}
                        placeholder="Tags (comma-separated)"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                      </div>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.attachments.map((attachment, index) => (
                              <Badge key={index} variant="outline">
                                <Image className="h-3 w-3 mr-1" />
                                {attachment.split('/').pop()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upload Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Coming Soon:</strong> Upload images, documents, and reference materials 
                to enhance assessment recommendations. Files will be automatically processed 
                and integrated into the training knowledge base.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Training Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-ugga-primary">{trainingData.length}</div>
                <div className="text-sm text-gray-600">Training Examples</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ugga-primary">
                  {trainingData.reduce((total, item) => total + (item.tags?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Topic Tags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ugga-primary">
                  {trainingData.reduce((total, item) => total + item.content.split(' ').length, 0)}
                </div>
                <div className="text-sm text-gray-600">Words of Context</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminAssessmentTrainer;