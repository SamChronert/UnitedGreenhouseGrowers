import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bot,
  Settings,
  MessageSquare 
} from "lucide-react";
import type { AiAgentConfig } from "@shared/schema";

interface ModelConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export default function AdminAiAgents() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AiAgentConfig | null>(null);
  const [formData, setFormData] = useState({
    type: "FIND_GROWER",
    name: "",
    systemPrompt: "",
    modelConfig: { model: "gpt-4o", maxTokens: 500, temperature: 0.7 }
  });

  const { toast } = useToast();

  // Fetch AI agent configurations
  const { data: configs = [], isLoading } = useQuery<AiAgentConfig[]>({
    queryKey: ["/api/admin/ai-agent-configs"],
  });

  // Create configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/admin/ai-agent-configs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-agent-configs"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "AI agent configuration created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create AI agent configuration.",
        variant: "destructive",
      });
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      apiRequest("PUT", `/api/admin/ai-agent-configs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-agent-configs"] });
      setEditingConfig(null);
      resetForm();
      toast({
        title: "Success",
        description: "AI agent configuration updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update AI agent configuration.",
        variant: "destructive",
      });
    },
  });

  // Delete configuration mutation
  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/admin/ai-agent-configs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-agent-configs"] });
      toast({
        title: "Success",
        description: "AI agent configuration deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete AI agent configuration.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "FIND_GROWER",
      name: "",
      systemPrompt: "",
      modelConfig: { model: "gpt-4o", maxTokens: 500, temperature: 0.7 }
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createConfigMutation.mutate(formData);
  };

  const handleEdit = (config: AiAgentConfig) => {
    setEditingConfig(config);
    const modelConfig = config.modelConfig as ModelConfig || {};
    setFormData({
      type: config.type,
      name: config.name,
      systemPrompt: config.systemPrompt,
      modelConfig: {
        model: modelConfig.model || "gpt-4o",
        maxTokens: modelConfig.maxTokens || 500,
        temperature: modelConfig.temperature || 0.7
      }
    });
  };

  const handleUpdate = () => {
    if (!editingConfig) return;
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    updateConfigMutation.mutate({ id: editingConfig.id, data: formData });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this AI agent configuration?")) {
      deleteConfigMutation.mutate(id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FIND_GROWER":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "FIND_GROWER":
        return "Find-a-Grower";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Agent Manager</h1>
          <p className="text-gray-600 mt-1">
            Configure AI chatbot prompts and settings for different features
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create AI Agent Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Agent Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FIND_GROWER">Find-a-Grower</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="name">Configuration Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Default Find-a-Grower Agent"
                />
              </div>
              
              <div>
                <Label htmlFor="systemPrompt">System Prompt *</Label>
                <Textarea
                  id="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Enter the system prompt that defines the AI agent's behavior..."
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <select
                    id="model"
                    value={formData.modelConfig.model}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      modelConfig: { ...prev.modelConfig, model: e.target.value }
                    }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={formData.modelConfig.maxTokens}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      modelConfig: { ...prev.modelConfig, maxTokens: parseInt(e.target.value) }
                    }))}
                    min="1"
                    max="4000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={formData.modelConfig.temperature}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      modelConfig: { ...prev.modelConfig, temperature: parseFloat(e.target.value) }
                    }))}
                    step="0.1"
                    min="0"
                    max="2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createConfigMutation.isPending}
                >
                  {createConfigMutation.isPending ? "Creating..." : "Create Configuration"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations Grid */}
      <div className="grid gap-6">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Configurations</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first AI agent configuration to get started.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Configuration
              </Button>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => {
            const modelConfig = config.modelConfig as ModelConfig || {};
            return (
              <Card key={config.type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(config.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <p className="text-sm text-gray-500">{getTypeName(config.type)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">System Prompt</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border text-sm">
                      {config.systemPrompt.length > 200 
                        ? `${config.systemPrompt.substring(0, 200)}...`
                        : config.systemPrompt
                      }
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Model: <span className="font-medium">{modelConfig.model || "gpt-4o"}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Max Tokens: <span className="font-medium">{modelConfig.maxTokens || 500}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Temperature: <span className="font-medium">{modelConfig.temperature || 0.7}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit AI Agent Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Agent Type *</Label>
              <select
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option value="FIND_GROWER">Find-a-Grower</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="edit-name">Configuration Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Default Find-a-Grower Agent"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-systemPrompt">System Prompt *</Label>
              <Textarea
                id="edit-systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Enter the system prompt that defines the AI agent's behavior..."
                rows={8}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-model">Model</Label>
                <select
                  id="edit-model"
                  value={formData.modelConfig.model}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    modelConfig: { ...prev.modelConfig, model: e.target.value }
                  }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-maxTokens">Max Tokens</Label>
                <Input
                  id="edit-maxTokens"
                  type="number"
                  value={formData.modelConfig.maxTokens}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    modelConfig: { ...prev.modelConfig, maxTokens: parseInt(e.target.value) }
                  }))}
                  min="1"
                  max="4000"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-temperature">Temperature</Label>
                <Input
                  id="edit-temperature"
                  type="number"
                  value={formData.modelConfig.temperature}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    modelConfig: { ...prev.modelConfig, temperature: parseFloat(e.target.value) }
                  }))}
                  step="0.1"
                  min="0"
                  max="2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingConfig(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? "Updating..." : "Update Configuration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}