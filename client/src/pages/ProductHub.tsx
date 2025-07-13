import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Star, User } from "lucide-react";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";
import { useState } from "react";

interface ProductTestimonial {
  growerName: string;
  growerEmail: string;
  quote: string;
}

interface Product {
  id: string;
  productName: string;
  category: string;
  vendorName: string;
  vendorEmail: string;
  description: string;
  testimonials: ProductTestimonial[];
}

const sampleProducts: Product[] = [
  {
    id: "1",
    productName: "BioGrow Nutrient System",
    category: "fertilizers",
    vendorName: "GreenTech Solutions",
    vendorEmail: "sales@greentechsol.com",
    description: "Advanced hydroponic nutrient solution designed specifically for greenhouse tomatoes and leafy greens. Provides optimal NPK ratios with micronutrients.",
    testimonials: [
      {
        growerName: "Sarah Johnson",
        growerEmail: "sarah@willowfarms.com",
        quote: "Increased our tomato yield by 20% in the first season. The plants were noticeably healthier and more vigorous."
      },
      {
        growerName: "Mike Chen",
        growerEmail: "mike@sunrisegreenhouse.com",
        quote: "Easy to use and consistent results. Our lettuce quality improved dramatically with this system."
      }
    ]
  },
  {
    id: "2",
    productName: "ClimateControl Pro",
    category: "climate_control",
    vendorName: "Precision Agriculture Inc.",
    vendorEmail: "info@precisionag.com",
    description: "Smart climate monitoring and control system with AI-powered optimization for greenhouse environments. Includes sensors, controllers, and mobile app.",
    testimonials: [
      {
        growerName: "David Rodriguez",
        growerEmail: "david@valleygreens.com",
        quote: "Cut our energy costs by 30% while maintaining perfect growing conditions. The automated system is incredibly reliable."
      },
      {
        growerName: "Lisa Thompson",
        growerEmail: "lisa@mountainview.farm",
        quote: "The mobile monitoring gives me peace of mind. I can check and adjust conditions from anywhere."
      }
    ]
  },
  {
    id: "3",
    productName: "Integrated Pest Management Kit",
    category: "pest_control",
    vendorName: "BioPest Solutions",
    vendorEmail: "orders@biopestsol.com",
    description: "Complete IPM solution including beneficial insects, pheromone traps, and organic treatment options. Specifically designed for greenhouse operations.",
    testimonials: [
      {
        growerName: "James Wilson",
        growerEmail: "james@organic-greens.com",
        quote: "Finally found a pest control system that works with our organic certification. Thrips and aphids are no longer a problem."
      },
      {
        growerName: "Anna Martinez",
        growerEmail: "anna@freshleaf.farm",
        quote: "The beneficial insects have created a perfect balance in our greenhouse. We've reduced chemical treatments by 90%."
      }
    ]
  }
];

const PRODUCT_CATEGORIES = [
  { value: "fertilizers", label: "Fertilizers & Nutrients" },
  { value: "climate_control", label: "Climate Control" },
  { value: "pest_control", label: "Pest Control" },
  { value: "irrigation", label: "Irrigation Systems" },
  { value: "lighting", label: "Lighting Systems" },
  { value: "seeds", label: "Seeds & Seedlings" },
  { value: "tools", label: "Tools & Equipment" },
  { value: "structures", label: "Structures & Materials" },
  { value: "automation", label: "Automation & Software" }
];

export default function ProductHub() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredProducts = sampleProducts.filter(product => {
    const searchMatch = !searchQuery || 
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryMatch = !selectedCategory || selectedCategory === "all" || product.category === selectedCategory;
    
    return searchMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InDevelopmentBanner 
          title="Product Hub" 
          description="This feature is currently in development and needs some more work before it is fully functional."
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Hub</h1>
          <p className="text-gray-600 mb-4">
            Browse vetted products and services for your greenhouse operation
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Want your product listed here?</h3>
            <p className="text-blue-800 text-sm">
              Let us know if you want your product listed here! Vendors must provide testimonials from 
              two growers (with contact info) that can be seen by grower members.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products, vendors, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map(category => (
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

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{product.productName}</CardTitle>
                    <p className="text-gray-600 mt-1">by {product.vendorName}</p>
                  </div>
                  <Badge variant="secondary">
                    {PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Vendor Contact:</span> {product.vendorEmail}
                  </p>
                </div>

                {/* Testimonials */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Grower Testimonials
                  </h4>
                  <div className="space-y-3">
                    {product.testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <blockquote className="text-sm text-gray-700 italic mb-2">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{testimonial.growerName}</span>
                          <span>•</span>
                          <span>{testimonial.growerEmail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm">Try adjusting your search or category filter.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}