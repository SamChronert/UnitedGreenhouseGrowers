import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Map, List } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapToggleProps {
  hasLocationAvailable: boolean;
  isMapView?: boolean;
  onToggleView?: (isMapView: boolean) => void;
  locationCount?: number;
  className?: string;
}

export default function MapToggle({
  hasLocationAvailable,
  isMapView = false,
  onToggleView,
  locationCount,
  className
}: MapToggleProps) {
  // Don't render if no location data is available
  if (!hasLocationAvailable) {
    return null;
  }

  const handleToggle = (viewMode: boolean) => {
    if (onToggleView) {
      onToggleView(viewMode);
    }
  };

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ugga-primary" />
            <span className="text-sm font-medium">Map View</span>
            {locationCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                {locationCount} locations
              </Badge>
            )}
          </div>
          
          {onToggleView && (
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={!isMapView ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToggle(false)}
                className={cn(
                  "rounded-none border-0 px-3 py-1",
                  !isMapView ? "text-white" : "text-gray-600"
                )}
                style={!isMapView ? { backgroundColor: 'var(--color-clay)' } : {}}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={isMapView ? "default" : "ghost"}
                size="sm"
                onClick={() => handleToggle(true)}
                className={cn(
                  "rounded-none border-0 px-3 py-1",
                  isMapView ? "text-white" : "text-gray-600"
                )}
                style={isMapView ? { backgroundColor: 'var(--color-clay)' } : {}}
                aria-label="Map view"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Map View Info */}
        {isMapView && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-600">
            Resources with location data will be displayed on an interactive map
          </div>
        )}
      </CardContent>
    </Card>
  );
}