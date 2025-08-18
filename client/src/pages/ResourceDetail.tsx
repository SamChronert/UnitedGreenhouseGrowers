import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Heart, MapPin, Calendar, Users, Building } from "lucide-react";
import { Link } from "wouter";

export default function ResourceDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link href="/dashboard/resources">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
          </div>

          {/* Resource Detail Skeleton */}
          <div className="space-y-6">
            {/* Main Content Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-8 w-3/4 mb-3" />
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" disabled>
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Resource Type</h3>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Cost</h3>
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Crops</h3>
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Region</h3>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button disabled className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Resource
                  </Button>
                  <Button variant="outline" disabled>
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Verification Status */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2 text-ugga-primary" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">UGGA Verified</span>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality Score</span>
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Verified</span>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Info */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-ugga-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> Resource ID: {id} | This is a skeleton page - fetch logic will be implemented in a later task.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}