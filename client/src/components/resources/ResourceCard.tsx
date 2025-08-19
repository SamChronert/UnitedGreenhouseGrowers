import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, MapPin, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    summary?: string;
    type?: string;
    topics?: string[];
    crop?: string[];
    system_type?: string[];
    region?: string;
    cost?: string;
    ugga_verified?: boolean;
    last_verified_at?: string | Date;
    quality_score?: number;
    has_location?: boolean;
    url?: string;
  };
  onToggleFavorite?: (id: string, on: boolean) => void;
  onOpen?: (id: string) => void;
  showBadges?: boolean;
  isFavorited?: boolean;
  className?: string;
}

export default function ResourceCard({
  resource,
  onToggleFavorite,
  onOpen,
  showBadges = true,
  isFavorited = false,
  className
}: ResourceCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || isToggling) return;
    
    setIsToggling(true);
    try {
      await onToggleFavorite(resource.id, !isFavorited);
    } finally {
      setIsToggling(false);
    }
  };

  const handleHeartKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (!onToggleFavorite || isToggling) return;
      
      setIsToggling(true);
      try {
        await onToggleFavorite(resource.id, !isFavorited);
      } finally {
        setIsToggling(false);
      }
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen(resource.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const isStale = resource.last_verified_at && 
    new Date(resource.last_verified_at) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <Card 
      className={cn(
        "shadow-sm hover:shadow-md transition-shadow cursor-pointer group",
        "focus:outline-none focus:ring-2 focus:ring-ugga-primary focus:ring-offset-2",
        className
      )}
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`Open resource: ${resource.title}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-ugga-primary transition-colors">
              {resource.title}
            </h3>
            
            {resource.summary && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {resource.summary}
              </p>
            )}
          </div>
          
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={cn(
                "h-8 w-8 p-0 shrink-0",
                isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
              )}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorited}
              onKeyDown={handleHeartKeyDown}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} aria-hidden="true" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Badges */}
        {showBadges && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.ugga_verified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                UGGA Verified
              </Badge>
            )}
            
            {resource.last_verified_at && !isStale && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                Verified {formatDate(resource.last_verified_at)}
              </Badge>
            )}
            
            {isStale && (
              <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                Needs Review
              </Badge>
            )}
            
            {resource.has_location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                Location
              </Badge>
            )}
          </div>
        )}

        {/* Quick Meta */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            {resource.type && (
              <span className="capitalize">
                <strong>Type:</strong> {resource.type.replace('-', ' ')}
              </span>
            )}
            
            {resource.cost && (
              <span className="capitalize">
                <strong>Cost:</strong> {resource.cost.replace('-', ' ')}
              </span>
            )}
          </div>
          
          {resource.region && (
            <div>
              <strong>Region:</strong> {resource.region}
            </div>
          )}
          
          {resource.topics && resource.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.topics.slice(0, 3).map((topic, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic.replace('-', ' ')}
                </Badge>
              ))}
              {resource.topics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{resource.topics.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* External Link Indicator */}
        {resource.url && (
          <div className="flex items-center justify-end mt-4 pt-3 border-t">
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-ugga-primary transition-colors" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}