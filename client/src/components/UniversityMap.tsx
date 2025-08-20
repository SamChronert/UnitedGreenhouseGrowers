import { memo, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Users } from "lucide-react";
import { Resource } from '@/hooks/useResources';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface UniversityMapProps {
  universities: Resource[];
  onUniversityClick?: (university: Resource) => void;
  className?: string;
}

// Custom marker icon for universities
const universityIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const UniversityMap = memo(function UniversityMap({ 
  universities, 
  onUniversityClick,
  className = '' 
}: UniversityMapProps) {
  // Filter universities that have geographic coordinates
  const geoUniversities = useMemo(() => {
    return universities.filter(uni => 
      uni.lat && 
      uni.long && 
      !isNaN(uni.lat) && 
      !isNaN(uni.long) &&
      uni.lat >= -90 && uni.lat <= 90 &&
      uni.long >= -180 && uni.long <= 180
    );
  }, [universities]);

  // Calculate map bounds
  const bounds = useMemo(() => {
    if (geoUniversities.length === 0) return null;
    
    const lats = geoUniversities.map(u => u.lat!);
    const lngs = geoUniversities.map(u => u.long!);
    
    return {
      center: [
        lats.reduce((sum, lat) => sum + lat, 0) / lats.length,
        lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length
      ] as [number, number],
      bounds: [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ] as [[number, number], [number, number]]
    };
  }, [geoUniversities]);

  if (geoUniversities.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <MapPin className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Geographic Data Available
          </h3>
          <p className="text-gray-600 mb-4">
            Universities need to be geocoded before they can be displayed on the map.
          </p>
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {universities.length} universities total
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-ugga-primary" />
          <span className="font-medium">University Locations</span>
          <Badge variant="secondary">
            {geoUniversities.length} mapped
          </Badge>
        </div>
        {universities.length > geoUniversities.length && (
          <Badge variant="outline" className="text-xs">
            {universities.length - geoUniversities.length} not geocoded
          </Badge>
        )}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={bounds?.center || [39.8283, -98.5795]} // Center of US as fallback
              zoom={bounds ? 4 : 3}
              style={{ height: '100%', width: '100%' }}
              bounds={bounds?.bounds}
              boundsOptions={{ padding: [20, 20] }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <div>
                {geoUniversities.map((university) => (
                  <Marker
                    key={university.id}
                    position={[university.lat!, university.long!]}
                    icon={universityIcon}
                    eventHandlers={{
                      click: () => onUniversityClick?.(university)
                    }}
                  >
                    <Popup>
                      <div className="min-w-64">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {university.title}
                        </h4>
                        
                        {university.summary && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {university.summary}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {university.ugga_verified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              UGGA Verified
                            </Badge>
                          )}
                          
                          {university.region && (
                            <Badge variant="outline" className="text-xs">
                              {university.region}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => onUniversityClick?.(university)}
                            className="text-sm font-medium text-ugga-primary hover:text-ugga-primary/80 transition-colors"
                          >
                            View Details
                          </button>
                          
                          {university.url && (
                            <a
                              href={university.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-ugga-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Visit
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </div>
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default UniversityMap;