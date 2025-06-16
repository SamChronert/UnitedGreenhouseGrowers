import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Filter, Loader2 } from "lucide-react";
import { type Resource } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const { user, isMember } = useAuth();

  const { data: resources, isLoading, error } = useQuery<Resource[]>({
    queryKey: ["/api/resources", user?.profile?.state, user?.profile?.farmType],
  });

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || resource.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  }) || [];

  const allTags = Array.from(
    new Set(resources?.flatMap(resource => resource.tags) || [])
  ).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load resources. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isMember ? "Member Resources" : "Resources"}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {isMember 
              ? `Curated resources for ${user?.profile?.farmType || "your"} farming in ${user?.profile?.state || "your area"}`
              : "Curated resources for greenhouse growers"
            }
          </p>
          
          {!isMember && (
            <div className="bg-ugga-primary/10 border border-ugga-primary/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-ugga-primary">
                <strong>Become a member</strong> to access resources filtered by your location and farm type!
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Topics</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchTerm || selectedTag 
                ? "No resources found matching your criteria." 
                : "No resources available yet."
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{resource.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 break-all">
                    {resource.url}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Member CTA */}
        {!isMember && filteredResources.length > 0 && (
          <div className="mt-16 text-center bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want More Personalized Resources?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join UGGA to access resources specifically curated for your location, 
              farm type, and experience level. Plus get access to our AI-powered tools!
            </p>
            <Button size="lg" className="bg-ugga-primary hover:bg-ugga-primary/90">
              Become a Member
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
