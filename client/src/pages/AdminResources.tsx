import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Resource, type ResourceType } from "@shared/schema";
import { Plus, Edit, Trash2, ExternalLink, Search, Loader2, Upload, FileText, Check, X, AlertCircle } from "lucide-react";

// Form schemas
const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  type: z.string().min(1, "Resource type is required"),
  summary: z.string().optional(),
  topics: z.string().optional(),
  crop: z.string().optional(),
  system_type: z.string().optional(), 
  region: z.string().optional(),
  cost: z.string().optional(),
  // Grant-specific fields
  grant_amount_min: z.number().optional(),
  grant_amount_max: z.number().optional(),
  application_deadline: z.string().optional(),
  eligibility_geo: z.string().optional(),
  // Template-specific fields
  format: z.string().optional(),
  template_language: z.string().optional(),
});

type ResourceFormData = z.infer<typeof resourceFormSchema>;

interface CSVImportRow {
  row: number;
  data: Record<string, any>;
  errors: string[];
  valid: boolean;
}

interface CSVImportResult {
  valid: CSVImportRow[];
  invalid: CSVImportRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export default function AdminResources() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  
  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "",
      summary: "",
      topics: "",
      crop: "",
      system_type: "",
      region: "",
      cost: "",
    },
  });

  const selectedType = form.watch("type") as ResourceType;

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const createResourceMutation = useMutation({
    mutationFn: (data: Partial<Resource>) =>
      apiRequest("POST", "/api/admin/resources", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsCreateOpen(false);
      form.reset();
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
      form.reset();
      setIsCreateOpen(false);
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
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Success",
        description: "Resource deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resource.",
        variant: "destructive",
      });
    },
  });

  const filteredResources = resources?.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleSubmit = (data: ResourceFormData) => {
    const resourceData: Partial<Resource> = {
      title: data.title,
      url: data.url || undefined,
      type: data.type as ResourceType,
      summary: data.summary || undefined,
      topics: data.topics ? data.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
      crop: data.crop ? data.crop.split(',').map(t => t.trim()).filter(Boolean) : [],
      system_type: data.system_type ? data.system_type.split(',').map(t => t.trim()).filter(Boolean) : [],
      region: data.region || undefined,
      cost: data.cost || undefined,
      data: {}
    };

    // Add type-specific fields to data object
    if (selectedType === 'grant') {
      resourceData.data = {
        grant_amount_min: data.grant_amount_min,
        grant_amount_max: data.grant_amount_max,
        application_deadline: data.application_deadline,
        eligibility_geo: data.eligibility_geo,
      };
    } else if (selectedType === 'template') {
      resourceData.data = {
        format: data.format,
        template_language: data.template_language,
      };
    }

    if (editingResource) {
      updateResourceMutation.mutate({ id: editingResource.id, data: resourceData });
    } else {
      createResourceMutation.mutate(resourceData);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    
    // Populate form with resource data
    form.reset({
      title: resource.title,
      url: resource.url,
      type: resource.type || "",
      summary: resource.summary || "",
      topics: resource.topics?.join(', ') || "",
      crop: resource.crop?.join(', ') || "",
      system_type: resource.system_type?.join(', ') || "",
      region: resource.region || "",
      cost: resource.cost || "",
      // Type-specific fields from data object
      grant_amount_min: (resource.data as any)?.grant_amount_min,
      grant_amount_max: (resource.data as any)?.grant_amount_max,
      application_deadline: (resource.data as any)?.application_deadline,
      eligibility_geo: (resource.data as any)?.eligibility_geo,
      format: (resource.data as any)?.format,
      template_language: (resource.data as any)?.template_language,
    });
    
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(id);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsImporting(true);
      const response = await fetch('/api/admin/resources/import?dryRun=1', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to preview CSV');
      }
      
      const result = await response.json();
      setCsvPreview(result);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to preview CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCSVCommit = async () => {
    if (!csvFile) return;
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      setIsImporting(true);
      const response = await fetch('/api/admin/resources/import?dryRun=0', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to import CSV');
      }
      
      const result = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setCsvFile(null);
      setCsvPreview(null);
      
      toast({
        title: "Success",
        description: `Imported ${result.imported} resources successfully.`,
      });
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to import CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingResource(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600">Manage resources, review suggestions, and import data</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="create">Create/Edit</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { resetForm(); setActiveTab("create"); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resources ({filteredResources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredResources.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "No resources found matching your search." : "No resources available."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Topics</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium max-w-xs">
                              <div className="truncate">{resource.title}</div>
                            </TableCell>
                            <TableCell>
                              {resource.type && (
                                <Badge variant="secondary">{resource.type}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {resource.url && (
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-ugga-primary hover:text-ugga-secondary flex items-center gap-1 truncate"
                                >
                                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{resource.url}</span>
                                </a>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {resource.topics?.slice(0, 2).map((topic) => (
                                  <Badge key={topic} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                                {(resource.topics?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(resource.topics?.length || 0) - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {resource.ugga_verified ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
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
          </TabsContent>

          {/* Create/Edit Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingResource ? "Edit Resource" : "Create New Resource"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Core Fields */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select resource type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="university">University/Extension</SelectItem>
                                <SelectItem value="organization">Organization</SelectItem>
                                <SelectItem value="grant">Grant/Funding</SelectItem>
                                <SelectItem value="tool">Tool/Software</SelectItem>
                                <SelectItem value="education">Educational Material</SelectItem>
                                <SelectItem value="template">Template/Document</SelectItem>
                                <SelectItem value="consultant">Consultant/Service</SelectItem>
                                <SelectItem value="article">Article/Publication</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input type="url" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select cost type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="varies">Varies</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={3}
                              placeholder="Brief description of the resource..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="topics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topics (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. pest management, irrigation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="crop"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crops (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. tomato, cucumber, lettuce" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="system_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>System Types (comma-separated)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. hydroponic, soil-based" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Northeast, California" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Type-specific fields */}
                    {selectedType === 'grant' && (
                      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">Grant-Specific Fields</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="grant_amount_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Amount ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="grant_amount_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Amount ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field}
                                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="application_deadline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Application Deadline</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="eligibility_geo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Geographic Eligibility</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g. US nationwide, California only" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {selectedType === 'template' && (
                      <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">Template-Specific Fields</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="format"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Format</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="word">Word Document</SelectItem>
                                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                    <SelectItem value="google_docs">Google Docs</SelectItem>
                                    <SelectItem value="web_form">Web Form</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="template_language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                    <SelectItem value="bilingual">English/Spanish</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => { resetForm(); setActiveTab("browse"); }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createResourceMutation.isPending || updateResourceMutation.isPending}
                      >
                        {createResourceMutation.isPending || updateResourceMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        {editingResource ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import CSV Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Resources from CSV</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload a CSV file to import multiple resources. The system will validate the data before import.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Upload */}
                <div>
                  <Label htmlFor="csv-upload">Step 1: Upload CSV File</Label>
                  <div className="mt-2">
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      disabled={isImporting}
                    />
                  </div>
                  {csvFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Step 2: Preview */}
                {csvPreview && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Step 2: Review Import Preview</h3>
                      <div className="flex gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {csvPreview.summary.valid} Valid
                        </Badge>
                        {csvPreview.summary.invalid > 0 && (
                          <Badge variant="destructive">
                            {csvPreview.summary.invalid} Invalid
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Invalid rows */}
                    {csvPreview.invalid.length > 0 && (
                      <Card className="border-red-200">
                        <CardHeader>
                          <CardTitle className="text-red-800 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Rows with Errors ({csvPreview.invalid.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {csvPreview.invalid.slice(0, 5).map((row) => (
                              <div key={row.row} className="p-3 bg-red-50 rounded border">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">Row {row.row}: {row.data.title || 'Untitled'}</span>
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                                <ul className="mt-1 text-sm text-red-700">
                                  {row.errors.map((error, idx) => (
                                    <li key={idx}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            {csvPreview.invalid.length > 5 && (
                              <p className="text-sm text-gray-500">
                                ... and {csvPreview.invalid.length - 5} more rows with errors
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Valid rows preview */}
                    {csvPreview.valid.length > 0 && (
                      <Card className="border-green-200">
                        <CardHeader>
                          <CardTitle className="text-green-800 flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Valid Rows ({csvPreview.valid.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {csvPreview.valid.slice(0, 3).map((row) => (
                              <div key={row.row} className="p-3 bg-green-50 rounded border">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">Row {row.row}: {row.data.title}</span>
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Type: {row.data.type} | URL: {row.data.url}
                                </p>
                              </div>
                            ))}
                            {csvPreview.valid.length > 3 && (
                              <p className="text-sm text-gray-500">
                                ... and {csvPreview.valid.length - 3} more valid rows
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 3: Commit */}
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCsvFile(null);
                          setCsvPreview(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCSVCommit}
                        disabled={isImporting || csvPreview.valid.length === 0}
                      >
                        {isImporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Import {csvPreview.valid.length} Resources
                      </Button>
                    </div>
                  </div>
                )}

                {isImporting && !csvPreview && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
                    <span className="ml-2">Processing CSV...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}