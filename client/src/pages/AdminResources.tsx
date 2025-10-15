import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Resource, type ResourceType } from "@shared/schema";
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, Upload, FileDown, CheckCircle, AlertCircle, BookOpen, Building2, DollarSign, Receipt, Wrench, GraduationCap, Newspaper, Radio } from "lucide-react";
import ResourceTypeForm from "@/components/admin/ResourceTypeForm";
import CSVImporter from "@/components/admin/CSVImporter";

// Resource type definitions with proper icons
const RESOURCE_TYPES = [
  { id: 'universities', label: 'Universities', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'organizations', label: 'Organizations', icon: <Building2 className="h-4 w-4" /> },
  { id: 'grants', label: 'Grants', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'tools', label: 'Tools', icon: <Wrench className="h-4 w-4" /> },
  { id: 'templates', label: 'Templates', icon: <FileDown className="h-4 w-4" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'bulletins', label: 'Bulletins', icon: <Newspaper className="h-4 w-4" /> },
  { id: 'industry_news', label: 'Industry News', icon: <Radio className="h-4 w-4" /> }
] as const;

type ResourceTypeId = typeof RESOURCE_TYPES[number]['id'];

export default function AdminResources() {
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceTypeId>('universities');
  const [searchTerm, setSearchTerm] = useState("");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const { toast } = useToast();

  // Fetch resources by type
  const { data: resourceData, isLoading } = useQuery<{items: Resource[], total: number}>({
    queryKey: [`/api/resources?type=${selectedResourceType}&limit=1000`],
  });
  
  // Fetch resource counts for all types
  const { data: resourceCounts, isLoading: isLoadingCounts } = useQuery<{type: string, total: number}[]>({
    queryKey: ['/api/admin/resources/counts'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  const resources = resourceData?.items || [];
  
  // Helper to get count for a resource type
  const getResourceCount = (typeId: string) => {
    if (typeId === selectedResourceType) {
      // For selected type, use the actual loaded resources count
      return resources.length;
    }
    // For other types, use the counts from the API
    const countData = resourceCounts?.find(c => c.type === typeId);
    return countData?.total || 0;
  };

  // Mutations
  const createResourceMutation = useMutation({
    mutationFn: (data: Partial<Resource>) =>
      apiRequest("POST", "/api/admin/resources", { ...data, type: selectedResourceType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsFormDialogOpen(false);
      setEditingResource(null);
      toast({
        title: "Success",
        description: "Resource created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create resource.",
        variant: "destructive",
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resource> }) =>
      apiRequest("PUT", `/api/admin/resources/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setEditingResource(null);
      setIsFormDialogOpen(false);
      toast({
        title: "Success", 
        description: "Resource updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update resource.",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (ids: string[]) => 
      Promise.all(ids.map(id => apiRequest("DELETE", `/api/admin/resources/${id}`))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setSelectedResources(new Set());
      toast({
        title: "Success",
        description: `Deleted ${selectedResources.size} resource(s) successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resources.",
        variant: "destructive",
      });
    },
  });

  const importResourcesMutation = useMutation({
    mutationFn: async (data: any[]) => {
      // Since we don't have the import endpoint yet, we'll create resources one by one
      const results = await Promise.all(
        data.map(resource => 
          apiRequest("POST", "/api/admin/resources", { ...resource, type: selectedResourceType })
        )
      );
      return { imported: results.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsImportDialogOpen(false);
      toast({
        title: "Success",
        description: `Imported ${result.imported} resources successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import resources.",
        variant: "destructive",
      });
    },
  });

  // Filter resources
  const filteredResources = resources.filter((resource: Resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers
  const handleFormSubmit = useCallback((data: any) => {
    if (editingResource) {
      updateResourceMutation.mutate({ id: editingResource.id, data });
    } else {
      createResourceMutation.mutate(data);
    }
  }, [editingResource, createResourceMutation, updateResourceMutation]);

  const handleEdit = useCallback((resource: Resource) => {
    setEditingResource(resource);
    setIsFormDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate([id]);
    }
  }, [deleteResourceMutation]);

  const handleBulkDelete = useCallback(() => {
    if (selectedResources.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedResources.size} resource(s)?`)) {
      deleteResourceMutation.mutate(Array.from(selectedResources));
    }
  }, [selectedResources, deleteResourceMutation]);

  const toggleResourceSelection = useCallback((resourceId: string) => {
    setSelectedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedResources.size === filteredResources.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(filteredResources.map(r => r.id)));
    }
  }, [selectedResources, filteredResources]);

  const handleImport = useCallback(async (data: any[]) => {
    await importResourcesMutation.mutateAsync(data);
  }, [importResourcesMutation]);

  const handleExport = useCallback(async () => {
    try {
      // Create CSV content
      const headers = ['title', 'url', 'summary', 'tags'];
      const rows = filteredResources.map(r => [
        r.title,
        r.url || '',
        r.summary || '',
        r.tags?.join(', ') || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedResourceType}-resources.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Resources exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export resources.",
        variant: "destructive",
      });
    }
  }, [selectedResourceType, filteredResources, toast]);

  // Get current resource type info
  const currentResourceType = RESOURCE_TYPES.find(t => t.id === selectedResourceType) || RESOURCE_TYPES[0];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600">Manage resources, review suggestions, and import data</p>
        </div>

        {/* Resource Type Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map(type => (
              <Button
                key={type.id}
                variant={selectedResourceType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedResourceType(type.id)}
                className="flex items-center gap-2"
              >
                {type.icon}
                <span>{type.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {isLoadingCounts ? '...' : getResourceCount(type.id)}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={`Search ${currentResourceType.label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedResources.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedResources.size} selected
                </Badge>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingResource(null);
                setIsFormDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {currentResourceType.label.slice(0, -1)}
            </Button>
          </div>
        </div>

        {/* Resources Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentResourceType.icon}
              {currentResourceType.label} ({filteredResources.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No resources found matching your search." : "No resources available."}
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={selectedResources.size === filteredResources.length && filteredResources.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-[150px]">Title</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">URL</TableHead>
                      <TableHead className="hidden lg:table-cell">Summary</TableHead>
                      <TableHead className="hidden xl:table-cell min-w-[100px]">Tags</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-ugga-primary" />
                        </TableCell>
                      </TableRow>
                    ) : filteredResources.map((resource: Resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedResources.has(resource.id)}
                            onCheckedChange={() => toggleResourceSelection(resource.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="truncate max-w-[200px] md:max-w-[250px]">{resource.title}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {resource.url && (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-ugga-primary hover:text-ugga-secondary flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{new URL(resource.url).hostname}</span>
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="truncate text-sm text-gray-600 max-w-[250px]">
                            {resource.summary || '—'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {resource.tags?.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(resource.tags?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(resource.tags?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resource.ugga_verified ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 whitespace-nowrap">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(resource)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(resource.id)}
                              disabled={deleteResourceMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? `Edit ${currentResourceType.label.slice(0, -1)}` : `Add New ${currentResourceType.label.slice(0, -1)}`}
              </DialogTitle>
            </DialogHeader>
            <ResourceTypeForm
              resourceType={selectedResourceType}
              initialData={editingResource || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormDialogOpen(false);
                setEditingResource(null);
              }}
              isSubmitting={createResourceMutation.isPending || updateResourceMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Import {currentResourceType.label} from CSV
              </DialogTitle>
            </DialogHeader>
            <CSVImporter
              resourceType={selectedResourceType}
              onImport={handleImport}
              onCancel={() => setIsImportDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}