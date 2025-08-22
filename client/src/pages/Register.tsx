import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import uggaLogo from "@assets/2_1750100657577.png";
import greenhouseVanImage from "@assets/ProduceVanGreenhouse_1755900251902.png";
import nationalNetworkImage from "@assets/NationalNetwork_1755900255831.png";

const registerSchema = z.object({
  // Basic fields for all members
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  phone: z.string().min(10, "Phone number is required"),
  state: z.string().min(1, "State is required"),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  farmType: z.string().optional(),
  // Member type selection
  memberType: z.enum(["grower", "general"]).default("grower"),
  // Grower-specific fields
  county: z.string().optional(),
  greenhouseRole: z.string().optional(),
  cropTypes: z.array(z.string()).optional(),
  otherCrop: z.string().optional(),
  ghSize: z.string().optional(),
  productionMethod: z.string().optional(),
  suppLighting: z.string().optional(),
  climateControl: z.array(z.string()).optional(),
  otherFarmType: z.string().optional(),
}).refine((data) => {
  // Conditional validation for grower members
  if (data.memberType === "grower") {
    return data.county && data.county.length > 0;
  }
  return true;
}, {
  message: "County is required for grower members",
  path: ["county"],
}).refine((data) => {
  // Validate "Other" crop requirement
  if (data.memberType === "grower" && data.cropTypes?.includes("Other")) {
    return data.otherCrop && data.otherCrop.length > 0;
  }
  return true;
}, {
  message: "Please specify other crop type",
  path: ["otherCrop"],
}).refine((data) => {
  // Validate climate control multi-select
  if (data.memberType === "grower" && data.climateControl) {
    return data.climateControl.length > 0;
  }
  return true;
}, {
  message: "Please select at least one climate control type",
  path: ["climateControl"],
}).refine((data) => {
  // Validate "Other" farm type requirement
  if (data.memberType === "grower" && data.farmType === "Other") {
    return data.otherFarmType && data.otherFarmType.length > 0;
  }
  return true;
}, {
  message: "Please specify other farm type",
  path: ["otherFarmType"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

const FARM_TYPES = [
  "Vegetable", "Flower", "Herb", "Mixed", "Nursery", "Fruit", "Other"
];

const CROP_TYPES = [
  "Tomatoes", "Cucumbers", "Leafy greens", "Herbs", "Strawberries", 
  "Peppers", "Flowers/ornamentals", "Other", "N/A"
];

const GREENHOUSE_SIZES = [
  "Under 500 ft²", "500 – 2 000 ft²", "2 001 – 10 000 ft²", "10 001 – 43 560 ft² (≈ 1 acre)",
  "43 560 – 87 119 ft² (1 – 2 acres)", "87 120 – 217 799 ft² (2 – 5 acres)", "Over 217 800 ft² (> 5 acres)", "N/A"
];

const PRODUCTION_METHODS = ["Soil-based", "Hydroponics", "N/A"];

const LIGHTING_OPTIONS = ["Yes", "No", "Planning to add", "N/A"];

const CLIMATE_CONTROL_OPTIONS = [
  { value: "Passive High Tunnel", label: "Passive High Tunnel", blurb: "Unheated hoop house, roll-up sides" },
  { value: "Naturally Ventilated", label: "Naturally Ventilated", blurb: "Roof/side vents, no fans" },
  { value: "Mechanically Ventilated", label: "Mechanically Ventilated", blurb: "Fans + shutters for airflow" },
  { value: "Evaporative-Cooled (Fan-and-Pad)", label: "Evaporative-Cooled (Fan-and-Pad)", blurb: "Wet pad cooling system" },
  { value: "Fog / Misting-Cooled", label: "Fog / Misting-Cooled", blurb: "Fine mist cools air" },
  { value: "Semi-Closed", label: "Semi-Closed", blurb: "Filtered intake, partial recirculation" },
  { value: "Fully Closed / HVAC-Controlled", label: "Fully Closed / HVAC-Controlled", blurb: "Sealed, AC + dehumidification" },
  { value: "Other / Not Listed", label: "Other / Not Listed", blurb: "Select if none match" }
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [memberType, setMemberType] = useState<"grower" | "general">("grower");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedClimateControl, setSelectedClimateControl] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      state: "",
      employer: "",
      jobTitle: "",
      farmType: "",
      memberType: "grower",
      county: "",
      greenhouseRole: "",
      cropTypes: [],
      otherCrop: "",
      ghSize: "",
      productionMethod: "",
      suppLighting: "",
      climateControl: [],
      otherFarmType: "",
    },
  });

  // Handle member type change
  const handleMemberTypeChange = (type: "grower" | "general") => {
    setMemberType(type);
    form.setValue("memberType", type);
    
    // Clear grower-specific fields when switching to general
    if (type === "general") {
      form.setValue("county", "");
      form.setValue("greenhouseRole", "");
      form.setValue("cropTypes", []);
      form.setValue("otherCrop", "");
      form.setValue("ghSize", "");
      form.setValue("productionMethod", "");
      form.setValue("suppLighting", "");
      form.setValue("climateControl", []);
      form.setValue("farmType", "");
      form.setValue("otherFarmType", "");
      setSelectedCrops([]);
      setSelectedClimateControl([]);
    }
  };

  // Handle crop type selection
  const handleCropToggle = (crop: string) => {
    const newCrops = selectedCrops.includes(crop)
      ? selectedCrops.filter(c => c !== crop)
      : [...selectedCrops, crop];
    
    // Limit to 8 crops maximum
    if (newCrops.length <= 8) {
      setSelectedCrops(newCrops);
      form.setValue("cropTypes", newCrops);
      
      // Clear other crop field if "Other" is unselected
      if (!newCrops.includes("Other")) {
        form.setValue("otherCrop", "");
      }
    }
  };

  // Handle climate control selection
  const handleClimateControlToggle = (option: string) => {
    const newSelection = selectedClimateControl.includes(option)
      ? selectedClimateControl.filter(item => item !== option)
      : [...selectedClimateControl, option];
    
    setSelectedClimateControl(newSelection);
    form.setValue("climateControl", newSelection);
  };

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => apiRequest("POST", "/api/auth/register", data),
    onSuccess: () => {
      toast({
        title: "Welcome to the pilot program!",
        description: "You're now a founding member. Log in to help shape the tools we build together.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Greenhouse Van Image */}
      <div className="relative bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Welcome Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <img src={uggaLogo} alt="UGGA Logo" className="h-12 w-12 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Join UGGA</h1>
                  <p className="text-ugga-primary font-medium">United Greenhouse Growers Association</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-8">
                Connect with greenhouse growers across the country and access practical tools built with growers in mind.
              </p>
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-ugga-primary rounded-full mr-3"></div>
                  <span className="text-gray-700">Network with fellow growers nationwide</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-ugga-primary rounded-full mr-3"></div>
                  <span className="text-gray-700">Access curated resources and tools</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-ugga-primary rounded-full mr-3"></div>
                  <span className="text-gray-700">Help shape the industry's future</span>
                </div>
              </div>
            </div>
            
            {/* Right: Greenhouse Van Image */}
            <div className="relative">
              <img 
                src={greenhouseVanImage} 
                alt="Greenhouse farm with delivery van showing fresh produce" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800">From greenhouse to community</p>
                <p className="text-xs text-gray-600">Supporting growers everywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* National Network Section */}
      <div className="bg-green-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Our Growing Network</h2>
            <p className="text-gray-600">Connect with greenhouse growers from coast to coast</p>
          </div>
          <div className="flex justify-center">
            <img 
              src={nationalNetworkImage} 
              alt="Map showing national network of connected greenhouse growers across the United States" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-ugga-primary to-ugga-secondary text-white">
              <CardTitle className="text-center text-xl">Create Your Account</CardTitle>
              <p className="text-center text-green-100 text-sm">Join the community today</p>
            </CardHeader>
            <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Member Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Member Type *</Label>
                <RadioGroup
                  value={memberType}
                  onValueChange={handleMemberTypeChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grower" id="grower" />
                    <Label htmlFor="grower" className="cursor-pointer">
                      Grower Member
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="cursor-pointer">
                      General Member
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Basic Information - Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  aria-describedby={form.formState.errors.name ? "name-error" : undefined}
                />
                {form.formState.errors.name && (
                  <p id="name-error" className="text-sm text-red-600" role="alert">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>

              {/* Location Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={form.watch("state")} 
                    onValueChange={(value) => form.setValue("state", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                  )}
                </div>
                {memberType === "grower" && (
                  <div className="space-y-2">
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      {...form.register("county")}
                      placeholder="Enter your county"
                    />
                    {form.formState.errors.county && (
                      <p className="text-sm text-red-600">{form.formState.errors.county.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer/Company</Label>
                  <Input
                    id="employer"
                    {...form.register("employer")}
                  />
                </div>
                {memberType === "general" && (
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      {...form.register("jobTitle")}
                    />
                  </div>
                )}
              </div>

              {/* Grower-Specific Fields */}
              {memberType === "grower" && (
                <>
                  {/* Greenhouse Role */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Greenhouse Role *</Label>
                    <RadioGroup
                      value={form.watch("greenhouseRole")}
                      onValueChange={(value) => form.setValue("greenhouseRole", value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="owner" id="owner" />
                        <Label htmlFor="owner" className="cursor-pointer">
                          I own / manage this greenhouse
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="worker" id="worker" />
                        <Label htmlFor="worker" className="cursor-pointer">
                          I work at this greenhouse
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Greenhouse Size */}
                  <div className="space-y-2">
                    <Label htmlFor="ghSize">Greenhouse Size</Label>
                    <Select 
                      value={form.watch("ghSize")} 
                      onValueChange={(value) => form.setValue("ghSize", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select greenhouse size" />
                      </SelectTrigger>
                      <SelectContent>
                        {GREENHOUSE_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Farm Type */}
                  <div className="space-y-2">
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select 
                      value={form.watch("farmType")} 
                      onValueChange={(value) => form.setValue("farmType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FARM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.watch("farmType") === "Other" && (
                      <div className="space-y-2">
                        <Label htmlFor="otherFarmType">Specify Other Farm Type *</Label>
                        <Input
                          id="otherFarmType"
                          {...form.register("otherFarmType")}
                          placeholder="Enter other farm type"
                        />
                        {form.formState.errors.otherFarmType && (
                          <p className="text-sm text-red-600">{form.formState.errors.otherFarmType.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Crop Types */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Crop Types Grown (select up to 8)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {CROP_TYPES.map((crop) => (
                        <div key={crop} className="flex items-center space-x-2">
                          <Checkbox
                            id={crop}
                            checked={selectedCrops.includes(crop)}
                            onCheckedChange={() => handleCropToggle(crop)}
                            disabled={!selectedCrops.includes(crop) && selectedCrops.length >= 8}
                          />
                          <Label htmlFor={crop} className="cursor-pointer text-sm">
                            {crop}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedCrops.includes("Other") && (
                      <div className="space-y-2">
                        <Label htmlFor="otherCrop">Specify Other Crop Type *</Label>
                        <Input
                          id="otherCrop"
                          {...form.register("otherCrop")}
                          placeholder="Enter other crop type"
                        />
                        {form.formState.errors.otherCrop && (
                          <p className="text-sm text-red-600">{form.formState.errors.otherCrop.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Production Method */}
                  <div className="space-y-2">
                    <Label htmlFor="productionMethod">Production Method</Label>
                    <Select 
                      value={form.watch("productionMethod")} 
                      onValueChange={(value) => form.setValue("productionMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select production method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTION_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Climate Control Type - Multi-select */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Climate Control Type (select at least one) *</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {CLIMATE_CONTROL_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-start space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={selectedClimateControl.includes(option.value)}
                            onCheckedChange={() => handleClimateControlToggle(option.value)}
                            className="mt-1"
                          />
                          <Label htmlFor={option.value} className="cursor-pointer text-sm flex-1">
                            {option.label} <span aria-hidden="true" className="text-sm text-gray-500 italic">{option.blurb}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.climateControl && (
                      <p className="text-sm text-red-600">{form.formState.errors.climateControl.message}</p>
                    )}
                  </div>

                  {/* Supplemental Lighting */}
                  <div className="space-y-2">
                    <Label htmlFor="suppLighting">Supplemental Lighting</Label>
                    <Select 
                      value={form.watch("suppLighting")} 
                      onValueChange={(value) => form.setValue("suppLighting", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lighting option" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIGHTING_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Account Credentials */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...form.register("username")}
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...form.register("password", {
                        onChange: (e) => setPasswordLength(e.target.value.length)
                      })}
                      className="pr-20"
                    />
                    <div className="absolute right-0 top-0 h-full flex items-center">
                      <span className={`text-sm px-2 ${passwordLength >= 12 ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordLength} / 12
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Password must be at least 12 characters long
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-ugga-primary hover:text-ugga-secondary font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}
