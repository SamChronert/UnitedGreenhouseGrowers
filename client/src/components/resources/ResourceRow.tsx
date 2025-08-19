import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Heart, ExternalLink, MapPin, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface ResourceRowProps {
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

export default function ResourceRow({
  resource,
  onToggleFavorite,
  onOpen,
  showBadges = true,
  isFavorited = false,
  className
}: ResourceRowProps) {
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

  const isStale = resource.last_verified_at && 
    new Date(resource.last_verified_at) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      year: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-50 group",
        "focus:outline-none focus:bg-gray-50",
        className
      )}
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`Open resource: ${resource.title}`}
    >
      {/* Title & Summary */}
      <TableCell className="font-medium">
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-ugga-primary transition-colors">
            {resource.title}
          </h3>
          {resource.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
              {resource.summary}
            </p>
          )}
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        {resource.type && (
          <Badge variant="outline" className="text-xs capitalize">
            {resource.type.replace('-', ' ')}
          </Badge>
        )}
      </TableCell>

      {/* Topics */}
      <TableCell>
        {resource.topics && resource.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-48">
            {resource.topics.slice(0, 2).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic.replace('-', ' ')}
              </Badge>
            ))}
            {resource.topics.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{resource.topics.length - 2}
              </Badge>
            )}
          </div>
        )}
      </TableCell>

      {/* Region & Cost */}
      <TableCell>
        <div className="space-y-1 text-sm text-gray-600">
          {resource.region && (
            <div>{resource.region}</div>
          )}
          {resource.cost && (
            <div className="capitalize text-xs">
              {resource.cost.replace('-', ' ')}
            </div>
          )}
        </div>
      </TableCell>

      {/* Status & Badges */}
      <TableCell>
        {showBadges && (
          <div className="flex flex-wrap gap-1">
            {resource.ugga_verified && (
              <CheckCircle className="h-4 w-4 text-green-600" aria-label="UGGA Verified" />
            )}
            
            {resource.has_location && (
              <MapPin className="h-4 w-4 text-blue-600" aria-label="Has location data" />
            )}
            
            {isStale && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" aria-label="Needs review" />
            )}
            
            {resource.url && (
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-ugga-primary transition-colors" aria-label="Has external link" />
            )}
          </div>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center justify-end">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={isToggling}
              className={cn(
                "h-8 w-8 p-0",
                isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"
              )}
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              onKeyDown={handleHeartKeyDown}
              aria-pressed={isFavorited}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} aria-hidden="true" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}