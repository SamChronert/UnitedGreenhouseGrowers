import { Link } from "wouter";
import { Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">403 - Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. This area is restricted to administrators only.
            </p>
            
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button 
                  className="w-full"
                  data-testid="button-return-dashboard"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  className="w-full"
                  data-testid="button-return-home"
                >
                  Go to Home Page
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
