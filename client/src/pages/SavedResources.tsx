import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Bookmark } from "lucide-react";
import { Link } from "wouter";

export default function SavedResources() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link href="/dashboard/resources">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resources
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-ugga-primary" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Resources</h1>
                <p className="text-gray-700">Your bookmarked resources and favorites</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <Card className="shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bookmark className="h-10 w-10 text-gray-400" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  No saved resources yet
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Start building your personal resource library by saving helpful guides, tools, and references from our collection.
                </p>
                
                <Link href="/dashboard/resources">
                  <Button 
                    className="text-white"
                    style={{ backgroundColor: 'var(--color-clay)' }}
                  >
                    Browse Resources
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Member-Only Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Member Feature:</strong> This page is protected and only accessible to UGGA members. Fetch logic and saved resources will be implemented in a later task.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}