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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import uggaLogo from "@assets/2_1750100657577.png";
import greenhouseVanImage from "@assets/ProduceVanGreenhouse_1755900251902.png";
import nationalNetworkImage from "@assets/NationalNetwork_1755900255831.png";

const registerSchema = z.object({
  // Basic fields for all members
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters"),
  phone: z.string().optional(),
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedClimateControl, setSelectedClimateControl] = useState<string[]>([]);

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

  const watchedMemberType = form.watch("memberType");

  // Define wizard steps
  const steps = [
    { id: 'welcome', title: 'Welcome to UGGA!' },
    { id: 'memberType', title: 'Choose Membership Type' },
    { id: 'basicInfo', title: 'Account Information' },
    { id: 'password', title: 'Secure Your Account' },
    ...(watchedMemberType === 'grower' ? [{ id: 'growerInfo', title: 'Your Growing Operation' }] : []),
    { id: 'confirmation', title: 'Welcome to the Community!' }
  ];

  const totalSteps = steps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Handle member type change
  const handleMemberTypeChange = (type: "grower" | "general") => {
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
      setCurrentStep(totalSteps - 1); // Go to confirmation step
      toast({
        title: "Welcome to UGGA!",
        description: "Your account has been created and you're now signed in.",
      });
      // Update auth state to reflect that user is now logged in
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
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

  const renderStepContent = () => {
    switch (steps[currentStep]?.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <img 
                src={greenhouseVanImage} 
                alt="Greenhouse farm with delivery van showing fresh produce" 
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to UGGA!</h2>
                <p className="text-gray-700">From greenhouse to community - supporting growers everywhere</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Connect with greenhouse growers across the country and access practical tools built with growers in mind.
              </p>
            </div>
          </div>
        );

      case 'memberType':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Membership Type</h2>
              <p className="text-gray-600">Select the option that best describes you</p>
            </div>
            <RadioGroup
              value={watchedMemberType}
              onValueChange={handleMemberTypeChange}
              className="space-y-4"
            >
              <Card 
                className={`cursor-pointer transition-all ${watchedMemberType === 'grower' ? 'ring-2 ring-ugga-primary' : 'hover:shadow-md'}`}
                onClick={() => handleMemberTypeChange('grower')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="grower" id="grower" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="grower" className="cursor-pointer text-lg font-medium">
                        Grower Member
                      </Label>
                      <p className="text-gray-600 mt-1">
                        I own, manage, or work at a greenhouse operation. I'm involved in growing crops and want to connect with other growers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all ${watchedMemberType === 'general' ? 'ring-2 ring-ugga-primary' : 'hover:shadow-md'}`}
                onClick={() => handleMemberTypeChange('general')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="general" id="general" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="general" className="cursor-pointer text-lg font-medium">
                        General Member
                      </Label>
                      <p className="text-gray-600 mt-1">
                        I'm interested in the greenhouse industry but don't directly grow crops. This includes researchers, suppliers, advisors, and enthusiasts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>
        );

      case 'basicInfo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account Information</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter your full name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Choose a username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="your.email@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  placeholder="(555) 123-4567 (optional)"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                  )}
                </div>
                {watchedMemberType === "grower" && (
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
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Secure Your Account</h2>
              <p className="text-gray-600">Create a strong password to protect your account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="Enter a secure password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
              <p className="text-sm text-gray-500">Password must be at least 12 characters long</p>
            </div>
          </div>
        );


      case 'growerInfo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Growing Operation</h2>
              <p className="text-gray-600">Tell us about your greenhouse operation</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Greenhouse Role *</Label>
                <RadioGroup
                  value={form.watch("greenhouseRole")}
                  onValueChange={(value) => form.setValue("greenhouseRole", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="owner" />
                    <Label htmlFor="owner">I own / manage this greenhouse</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="worker" id="worker" />
                    <Label htmlFor="worker">I work at this greenhouse</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.watch("farmType") === "Other" && (
                    <div className="mt-2">
                      <Label htmlFor="otherFarmType">Specify Other Farm Type *</Label>
                      <Input
                        id="otherFarmType"
                        {...form.register("otherFarmType")}
                        placeholder="Enter other farm type"
                        className="mt-1"
                      />
                      {form.formState.errors.otherFarmType && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.otherFarmType.message}</p>
                      )}
                    </div>
                  )}
                </div>
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
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Climate Control Type - Complete list */}
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
                        <span className="font-medium">{option.label}</span>
                        <span className="block text-gray-500 italic text-xs mt-1">{option.blurb}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.climateControl && (
                  <p className="text-sm text-red-600">{form.formState.errors.climateControl.message}</p>
                )}
              </div>

              {/* Professional Information */}
              <div className="space-y-2">
                <Label htmlFor="employer">Employer/Company</Label>
                <Input
                  id="employer"
                  {...form.register("employer")}
                  placeholder="Enter your employer or company name"
                />
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to the Community!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your account has been created successfully. You're now part of the growing UGGA network.
              </p>
            </div>
            <div className="relative">
              <img 
                src={nationalNetworkImage} 
                alt="National network of connected greenhouse growers across the United States" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="w-full"
              >
                Go to Your Dashboard
              </Button>
              <p className="text-sm text-gray-600">
                Ready to explore the platform and connect with other growers!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width Header with dark green background */}
      <div className="bg-ugga-primary w-full">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          {/* Logo with light background */}
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <img src={uggaLogo} alt="UGGA Logo" className="h-12 w-12" />
            </div>
          </div>
          
          {/* Title with white text */}
          <div>
            <h1 className="text-2xl font-bold text-white">Join UGGA</h1>
            <p className="text-white font-medium">United Greenhouse Growers Association</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {steps[currentStep]?.title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-ugga-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
          
          {/* Navigation */}
          <div className="px-8 pb-8">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === steps.findIndex(s => s.id === 'confirmation') ? null : (
                <Button
                  onClick={currentStep === totalSteps - 2 ? form.handleSubmit(onSubmit) : nextStep}
                  disabled={registerMutation.isPending}
                  className="flex items-center"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : currentStep === totalSteps - 2 ? (
                    "Create Account"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-ugga-primary hover:text-ugga-secondary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
