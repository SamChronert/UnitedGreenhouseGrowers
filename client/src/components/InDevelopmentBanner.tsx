import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface InDevelopmentBannerProps {
  title: string;
  description?: string;
}

export default function InDevelopmentBanner({ title, description }: InDevelopmentBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="bg-orange-50 border-orange-200 mb-6">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-orange-800">{title} – In Development</span>
          {description && (
            <p className="text-sm text-orange-700 mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}