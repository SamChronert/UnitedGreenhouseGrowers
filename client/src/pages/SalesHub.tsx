import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import InDevelopmentBanner from "@/components/InDevelopmentBanner";
import { useState } from "react";
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SampleBuyer {
  id: string;
  name: string;
  state: string;
  county: string;
  categories: string[];
  contactEmail: string;
  phone?: string;
  websiteUrl?: string;
  lat: number;
  lng: number;
}

const sampleBuyers: SampleBuyer[] = [
  {
    id: "1",
    name: "Kentucky Fresh Produce Co.",
    state: "KY",
    county: "Jefferson",
    categories: ["wholesale", "retail"],
    contactEmail: "orders@kyfreshproduce.com",
    phone: "(502) 555-0123",
    websiteUrl: "https://kyfreshproduce.com",
    lat: 38.2527,
    lng: -85.7585
  },
  {
    id: "2",
    name: "Midwest Greenhouse Distribution",
    state: "IN",
    county: "Marion",
    categories: ["wholesale", "CSA"],
    contactEmail: "purchasing@midwestgreenhouse.com",
    phone: "(317) 555-0456",
    lat: 39.7684,
    lng: -86.1581
  },
  {
    id: "3",
    name: "Fresh Valley Farmers Market",
    state: "OH",
    county: "Hamilton",
    categories: ["retail", "farmers_market"],
    contactEmail: "vendors@freshvalley.com",
    lat: 39.1031,
    lng: -84.5120
  }
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const BUYER_CATEGORIES = [
  { value: "wholesale", label: "Wholesale" },
  { value: "retail", label: "Retail" },
  { value: "CSA", label: "CSA" },
  { value: "farmers_market", label: "Farmers Market" },
  { value: "restaurant", label: "Restaurant" },
  { value: "food_service", label: "Food Service" }
];

export default function SalesHub() {
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredBuyers = sampleBuyers.filter(buyer => {
    const stateMatch = !selectedState || buyer.state === selectedState;
    const categoryMatch = !selectedCategory || buyer.categories.includes(selectedCategory);
    return stateMatch && categoryMatch;
  });

  const centerPosition: LatLngExpression = [39.8283, -98.5795]; // Geographic center of US

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InDevelopmentBanner 
          title="Sales Hub" 
          description="This feature is currently in development. Sample data is shown for demonstration purposes."
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Hub</h1>
          <p className="text-gray-600">
            Find buyers and distributors for your greenhouse products
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Buyers & Distributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {BUYER_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <MapContainer 
                    center={centerPosition} 
                    zoom={4} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {filteredBuyers.map(buyer => (
                      <Marker key={buyer.id} position={[buyer.lat, buyer.lng]}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{buyer.name}</h3>
                            <p className="text-sm text-gray-600">{buyer.county}, {buyer.state}</p>
                            <p className="text-sm">
                              <span className="font-medium">Categories:</span> {buyer.categories.join(', ')}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Contact:</span> {buyer.contactEmail}
                            </p>
                            {buyer.phone && (
                              <p className="text-sm">
                                <span className="font-medium">Phone:</span> {buyer.phone}
                              </p>
                            )}
                            {buyer.websiteUrl && (
                              <p className="text-sm">
                                <a href={buyer.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  Visit Website
                                </a>
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  Buyers & Distributors 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredBuyers.length} results)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBuyers.map(buyer => (
                    <div key={buyer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium text-gray-900">{buyer.name}</h4>
                      <p className="text-sm text-gray-600">{buyer.county}, {buyer.state}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {buyer.categories.map(category => (
                          <span key={category} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {BUYER_CATEGORIES.find(c => c.value === category)?.label || category}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {buyer.contactEmail}
                        </p>
                        {buyer.phone && (
                          <p className="text-sm">
                            <span className="font-medium">Phone:</span> {buyer.phone}
                          </p>
                        )}
                        {buyer.websiteUrl && (
                          <p className="text-sm">
                            <a href={buyer.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Visit Website
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredBuyers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No buyers found matching your criteria.</p>
                      <p className="text-sm mt-2">Try adjusting your filters.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}