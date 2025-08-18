import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Calendar, MapPin, DollarSign, Tag, Heart, AlertCircle, Download, Loader2 } from "lucide-react";
import { format, isAfter, addDays } from "date-fns";
import { useState } from "react";

// Import API functions
import { type Resource } from "@/lib/api/resources";
import { toggleFavorite, isFavorited } from "@/lib/api/favorites";

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function getResource(id: string): Promise<Resource> {
  return apiRequest(`/api/resources/${id}`);
}

async function requestResourceUpdate(resourceId: string, title: string): Promise<void> {
  return apiRequest('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({
      type: 'resource_update_request',
      resource_id: resourceId,
      message: `Update requested for resource: ${title}`,
      title: `Resource Update Request: ${title}`,
    }),
  });
}

export default function ResourceDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRequestingUpdate, setIsRequestingUpdate] = useState(false);

  // Fetch resource data
  const { 
    data: resource, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/resources', id],
    queryFn: () => getResource(id!),
    enabled: !!id,
  });

  // Check if favorited
  const { data: favoriteStatus = false } = useQuery({
    queryKey: ['/api/favorites', id, 'status'],
    queryFn: () => isFavorited(id!),
    enabled: !!id,
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) => toggleFavorite(id, on),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites', id, 'status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favoriteStatus ? "Removed from favorites" : "Added to favorites",
        description: favoriteStatus ? "Resource removed from your saved items" : "Resource saved for later",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Request update mutation
  const updateRequestMutation = useMutation({
    mutationFn: () => requestResourceUpdate(id!, resource?.title || ''),
    onSuccess: () => {
      toast({
        title: "Update request sent",
        description: "Thank you for helping us keep our resources current!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send update request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!id) return;
    favoriteMutation.mutate({ id, on: !favoriteStatus });
  };

  const handleRequestUpdate = () => {
    updateRequestMutation.mutate();
  };

  const handleOpenResource = () => {
    if (resource?.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Check if resource needs review (stale)
  const isStale = resource?.last_verified_at ? 
    isAfter(new Date(), addDays(new Date(resource.last_verified_at), 90)) : false;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard/resources">
                <Button variant="ghost" className="flex items-center gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Resources
                </Button>
              </Link>
            </div>

            {/* Header Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/dashboard/resources">
                <Button variant="ghost" className="flex items-center gap-2 mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Resources
                </Button>
              </Link>
            </div>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">Resource not found</h2>
                </div>
                <p className="text-red-800 mb-4">
                  The resource you're looking for couldn't be found or there was an error loading it.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => setLocation('/dashboard/resources')}>
                    Back to Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/dashboard/resources">
              <Button variant="ghost" className="flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{resource.title}</h1>
                <p className="text-lg text-gray-700 mb-4">{resource.summary}</p>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.ugga_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      UGGA Verified
                    </Badge>
                  )}
                  {isStale && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Needs Review
                    </Badge>
                  )}
                  <Badge variant="outline">{resource.type}</Badge>
                  <Badge variant="outline">Score: {resource.quality_score}</Badge>
                  {resource.last_verified_at && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Verified {format(new Date(resource.last_verified_at), 'MMM dd, yyyy')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant={favoriteStatus ? "default" : "outline"} 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleToggleFavorite}
                  disabled={favoriteMutation.isPending}
                >
                  {favoriteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${favoriteStatus ? 'fill-current' : ''}`} />
                  )}
                  {favoriteStatus ? "Saved" : "Save"}
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleOpenResource}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Resource
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grant Panel */}
              {resource.type === 'grant' && resource.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Grant Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {resource.data.sponsor && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Sponsor</h4>
                          <p className="text-gray-900">{resource.data.sponsor}</p>
                        </div>
                      )}
                      {resource.data.program_name && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Program</h4>
                          <p className="text-gray-900">{resource.data.program_name}</p>
                        </div>
                      )}
                      {(resource.data.award_min || resource.data.award_max) && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Award Range</h4>
                          <p className="text-gray-900">
                            {resource.data.award_min && `$${resource.data.award_min.toLocaleString()}`}
                            {resource.data.award_min && resource.data.award_max && ' - '}
                            {resource.data.award_max && `$${resource.data.award_max.toLocaleString()}`}
                          </p>
                        </div>
                      )}
                      {resource.data.due_date && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Due Date</h4>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {resource.data.due_date === 'rolling' ? 'Rolling' : format(new Date(resource.data.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                      {resource.data.status && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Status</h4>
                          <Badge variant={resource.data.status === 'open' ? 'default' : 'secondary'}>
                            {resource.data.status}
                          </Badge>
                        </div>
                      )}
                      {resource.data.eligibility_geo && Array.isArray(resource.data.eligibility_geo) && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Eligibility</h4>
                          <p className="text-gray-900">{resource.data.eligibility_geo.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    {resource.data.link_to_rfp && (
                      <div className="pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2"
                          onClick={() => window.open(resource.data.link_to_rfp, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View RFP
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Template Panel */}
              {resource.type === 'template' && resource.data && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      Template Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {resource.version && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-600">Version</h4>
                          <p className="text-gray-900">{resource.version}</p>
                        </div>
                      )}
                      {resource.data.version_notes && (
                        <div className="col-span-2">
                          <h4 className="font-medium text-sm text-gray-600">Version Notes</h4>
                          <p className="text-gray-900">{resource.data.version_notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        className="flex items-center gap-2"
                        onClick={handleOpenResource}
                      >
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Meta Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resource.topics && resource.topics.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Topics</h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {resource.crop && resource.crop.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Crops</h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.crop.map((crop) => (
                          <Badge key={crop} variant="outline" className="text-xs">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {resource.system_type && resource.system_type.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">System Type</h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.system_type.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {resource.region && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">Region</h4>
                      <p className="text-gray-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {resource.region}
                      </p>
                    </div>
                  )}

                  {resource.cost && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">Cost</h4>
                      <p className="text-gray-900">{resource.cost}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Request Update */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Help Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Notice incorrect information or have an update to share?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleRequestUpdate}
                    disabled={updateRequestMutation.isPending}
                  >
                    {updateRequestMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Request Update'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}