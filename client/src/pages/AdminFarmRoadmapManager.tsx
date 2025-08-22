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
  MapPin, 
  Plus, 
  Settings,
  FolderPlus,
  HelpCircle,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Scale,
  List,
  CheckSquare
} from "lucide-react";
import { format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FarmRoadmapCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  questions: FarmRoadmapQuestion[];
}

interface FarmRoadmapQuestion {
  id: string;
  categoryId: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'yes-no';
  options?: string[];
  scaleLabels?: { min: string; max: string };
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

function AdminFarmRoadmapManager() {
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [newCategory, setNewCategory] = useState({ 
    name: "", 
    description: "", 
    color: "bg-blue-500"
  });
  
  const [newQuestion, setNewQuestion] = useState({
    categoryId: "",
    question: "",
    type: "multiple-choice" as const,
    options: [""],
    scaleLabels: { min: "", max: "" },
    description: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories with questions
  const { data: categories = [], isLoading } = useQuery<FarmRoadmapCategory[]>({
    queryKey: ["/api/admin/farm-roadmap/categories"],
    queryFn: () => apiRequest("GET", "/api/admin/farm-roadmap/categories"),
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description: string; color: string; displayOrder: number }) =>
      apiRequest("POST", "/api/admin/farm-roadmap/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      setNewCategory({ name: "", description: "", color: "bg-blue-500" });
      setShowCreateCategory(false);
      toast({
        title: "Success",
        description: "Category created successfully!",
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

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FarmRoadmapCategory> }) =>
      apiRequest("PUT", `/api/admin/farm-roadmap/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully!",
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

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/farm-roadmap/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully!",
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

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: (data: {
      categoryId: string;
      question: string;
      type: string;
      options?: string[];
      scaleLabels?: { min: string; max: string };
      description?: string;
      displayOrder: number;
    }) => apiRequest("POST", "/api/admin/farm-roadmap/questions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      setNewQuestion({
        categoryId: "",
        question: "",
        type: "multiple-choice",
        options: [""],
        scaleLabels: { min: "", max: "" },
        description: ""
      });
      setShowCreateQuestion(false);
      toast({
        title: "Success",
        description: "Question created successfully!",
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

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FarmRoadmapQuestion> }) =>
      apiRequest("PUT", `/api/admin/farm-roadmap/questions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      setEditingQuestion(null);
      toast({
        title: "Success",
        description: "Question updated successfully!",
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

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/farm-roadmap/questions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/farm-roadmap/categories"] });
      toast({
        title: "Success",
        description: "Question deleted successfully!",
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

  const handleCreateCategory = () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and description.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate({
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      displayOrder: categories.length + 1
    });
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.categoryId || !newQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please select a category and enter a question.",
        variant: "destructive",
      });
      return;
    }

    const category = categories.find(c => c.id === newQuestion.categoryId);
    const nextOrder = category ? category.questions.length + 1 : 1;

    const questionData: any = {
      categoryId: newQuestion.categoryId,
      question: newQuestion.question,
      type: newQuestion.type,
      description: newQuestion.description || null,
      displayOrder: nextOrder
    };

    if (newQuestion.type === 'multiple-choice') {
      questionData.options = newQuestion.options.filter(opt => opt.trim());
    } else if (newQuestion.type === 'scale') {
      questionData.scaleLabels = newQuestion.scaleLabels;
    }

    createQuestionMutation.mutate(questionData);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will also delete all questions in this category.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return <List className="h-4 w-4" />;
      case 'scale': return <Scale className="h-4 w-4" />;
      case 'yes-no': return <CheckSquare className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
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
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Farm Roadmap Questions Manager</h1>
                <p className="text-gray-600">
                  Manage categories and questions for the farm roadmap assessment
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateCategory(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
              <Button onClick={() => setShowCreateQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>

        {/* Create Category */}
        {showCreateCategory && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Category name (e.g., 'Technology')"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <Textarea
                placeholder="Category description..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                rows={3}
              />
              <Select 
                value={newCategory.color} 
                onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-green-500">Green</SelectItem>
                  <SelectItem value="bg-blue-500">Blue</SelectItem>
                  <SelectItem value="bg-purple-500">Purple</SelectItem>
                  <SelectItem value="bg-orange-500">Orange</SelectItem>
                  <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                  <SelectItem value="bg-red-500">Red</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCreateCategory(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Question */}
        {showCreateQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={newQuestion.categoryId} 
                onValueChange={(value) => setNewQuestion({ ...newQuestion, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Question text..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
              
              <Select 
                value={newQuestion.type} 
                onValueChange={(value: "multiple-choice" | "scale" | "yes-no") => 
                  setNewQuestion({ ...newQuestion, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="scale">Scale (1-5)</SelectItem>
                  <SelectItem value="yes-no">Yes/No</SelectItem>
                </SelectContent>
              </Select>

              {newQuestion.type === 'multiple-choice' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Options:</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                      />
                      {newQuestion.options.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = newQuestion.options.filter((_, i) => i !== index);
                            setNewQuestion({ ...newQuestion, options: newOptions });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewQuestion({ 
                        ...newQuestion, 
                        options: [...newQuestion.options, ""] 
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {newQuestion.type === 'scale' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Min label (e.g., 'Poor')"
                    value={newQuestion.scaleLabels.min}
                    onChange={(e) => setNewQuestion({ 
                      ...newQuestion, 
                      scaleLabels: { ...newQuestion.scaleLabels, min: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Max label (e.g., 'Excellent')"
                    value={newQuestion.scaleLabels.max}
                    onChange={(e) => setNewQuestion({ 
                      ...newQuestion, 
                      scaleLabels: { ...newQuestion.scaleLabels, max: e.target.value }
                    })}
                  />
                </div>
              )}

              <Textarea
                placeholder="Optional description or context..."
                value={newQuestion.description}
                onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                rows={2}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowCreateQuestion(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateQuestion}
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories and Questions List */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by creating categories to organize your farm roadmap questions.
                </p>
                <Button onClick={() => setShowCreateCategory(true)}>
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                        <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-white text-sm font-bold`}>
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-left">{category.name}</CardTitle>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </button>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.questions.length} questions
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                      >
                        {editingCategory === category.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {expandedCategories.has(category.id) && (
                  <CardContent>
                    <div className="space-y-3">
                      {category.questions.map((question) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getQuestionTypeIcon(question.type)}
                                <Badge variant="outline">{question.type}</Badge>
                                <Badge variant={question.isActive ? "default" : "secondary"}>
                                  {question.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="font-medium">{question.question}</p>
                              {question.description && (
                                <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                              )}
                              
                              {question.type === 'multiple-choice' && question.options && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {question.options.map((option, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {option}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {question.type === 'scale' && question.scaleLabels && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-600">
                                    Scale: {question.scaleLabels.min} → {question.scaleLabels.max}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                              >
                                {editingQuestion === question.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {category.questions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No questions in this category yet.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setNewQuestion({ ...newQuestion, categoryId: category.id });
                              setShowCreateQuestion(true);
                            }}
                          >
                            Add First Question
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Assessment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.reduce((total, cat) => total + cat.questions.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.reduce((total, cat) => total + cat.questions.filter(q => q.isActive).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Active Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(cat => cat.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminFarmRoadmapManager;