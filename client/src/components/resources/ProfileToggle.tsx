import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { User, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserProfile {
  crops?: string[];
  system_types?: string[];
  regions?: string[];
  experience_level?: string;
  interests?: string[];
  farm_size?: string;
  operation_type?: string;
}

export interface ProfileToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onApply: (profile: UserProfile) => void;
  onClear: () => void;
  userProfile?: UserProfile;
  className?: string;
}

export default function ProfileToggle({
  isEnabled,
  onToggle,
  onApply,
  onClear,
  userProfile,
  className
}: ProfileToggleProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (checked && userProfile) {
      onApply(userProfile);
    } else if (!checked) {
      onClear();
    }
  };

  const getProfileSummary = () => {
    if (!userProfile) return null;
    
    const parts = [];
    if (userProfile.crops?.length) {
      parts.push(`${userProfile.crops.length} crop${userProfile.crops.length > 1 ? 's' : ''}`);
    }
    if (userProfile.system_types?.length) {
      parts.push(`${userProfile.system_types.length} system${userProfile.system_types.length > 1 ? 's' : ''}`);
    }
    if (userProfile.experience_level) {
      parts.push(userProfile.experience_level);
    }
    
    return parts.slice(0, 3).join(', ');
  };

  const profileSummary = getProfileSummary();
  const hasProfile = userProfile && Object.keys(userProfile).some(key => 
    Array.isArray(userProfile[key as keyof UserProfile]) 
      ? (userProfile[key as keyof UserProfile] as any[]).length > 0
      : userProfile[key as keyof UserProfile]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Toggle */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-ugga-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="profile-toggle" className="font-medium cursor-pointer">
                    Use My Profile
                  </Label>
                  {hasProfile && (
                    <Badge variant="outline" className="text-xs">
                      Profile Ready
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Filter resources based on your farm profile and interests
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="profile-toggle"
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={!hasProfile}
              />
              {hasProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Helper Chip */}
          {isEnabled && profileSummary && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Filtering by: {profileSummary}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details */}
      {showDetails && hasProfile && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Your Profile</h4>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                {userProfile?.crops && userProfile.crops.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Crops: </span>
                    <span className="text-gray-600">
                      {userProfile.crops.slice(0, 3).join(', ')}
                      {userProfile.crops.length > 3 && ` +${userProfile.crops.length - 3} more`}
                    </span>
                  </div>
                )}
                
                {userProfile?.system_types && userProfile.system_types.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Systems: </span>
                    <span className="text-gray-600 capitalize">
                      {userProfile.system_types.map(s => s.replace('-', ' ')).join(', ')}
                    </span>
                  </div>
                )}
                
                {userProfile?.experience_level && (
                  <div>
                    <span className="font-medium text-gray-700">Experience: </span>
                    <span className="text-gray-600 capitalize">
                      {userProfile.experience_level}
                    </span>
                  </div>
                )}
                
                {userProfile?.regions && userProfile.regions.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Regions: </span>
                    <span className="text-gray-600">
                      {userProfile.regions.join(', ')}
                    </span>
                  </div>
                )}
                
                {userProfile?.operation_type && (
                  <div>
                    <span className="font-medium text-gray-700">Operation: </span>
                    <span className="text-gray-600 capitalize">
                      {userProfile.operation_type.replace('-', ' ')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApply(userProfile!)}
                  disabled={isEnabled}
                  className="w-full"
                >
                  Apply Profile Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Profile State */}
      {!hasProfile && (
        <Card className="shadow-sm bg-gray-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Complete your profile to get personalized resource recommendations
            </p>
            <Button variant="outline" size="sm">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}