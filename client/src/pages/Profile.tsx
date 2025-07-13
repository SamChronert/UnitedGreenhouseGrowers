import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Save, Lock, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  state: z.string().min(1, "State is required"),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  farmType: z.string().optional(),
  // Member type selection
  memberType: z.enum(["grower", "general"]).default("general"),
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

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(12, "Password must be at least 12 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

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

export default function Profile() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPasswordLength, setNewPasswordLength] = useState(0);
  const [confirmPasswordLength, setConfirmPasswordLength] = useState(0);
  const [memberType, setMemberType] = useState<"grower" | "general">("general");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedClimateControl, setSelectedClimateControl] = useState<string[]>([]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      state: "",
      employer: "",
      jobTitle: "",
      farmType: "",
      memberType: "general",
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

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user?.profile) {
      const profileMemberType = user.profile.memberType || "general";
      const cropTypes = user.profile.cropTypes || [];
      const climateControl = user.profile.climateControl || [];
      
      setMemberType(profileMemberType);
      setSelectedCrops(cropTypes);
      setSelectedClimateControl(climateControl);
      
      form.reset({
        name: user.profile.name || "",
        phone: user.profile.phone || "",
        state: user.profile.state || "",
        employer: user.profile.employer || "",
        jobTitle: user.profile.jobTitle || "",
        farmType: user.profile.farmType || "",
        memberType: profileMemberType,
        county: user.profile.county || "",
        greenhouseRole: user.profile.greenhouseRole || "",
        cropTypes: cropTypes,
        otherCrop: user.profile.otherCrop || "",
        ghSize: user.profile.ghSize || "",
        productionMethod: user.profile.productionMethod || "",
        suppLighting: user.profile.suppLighting || "",
        climateControl: climateControl,
        otherFarmType: user.profile.otherFarmType || "",
      });
    }
  }, [user, form]);

  // Handle member type changes
  const handleMemberTypeChange = (value: "grower" | "general") => {
    setMemberType(value);
    form.setValue("memberType", value);
  };

  // Handle crop selection changes
  const handleCropChange = (crop: string, checked: boolean) => {
    const newCrops = checked 
      ? [...selectedCrops, crop]
      : selectedCrops.filter(c => c !== crop);
    setSelectedCrops(newCrops);
    form.setValue("cropTypes", newCrops);
  };

  // Handle climate control selection changes
  const handleClimateControlChange = (control: string, checked: boolean) => {
    const newControls = checked 
      ? [...selectedClimateControl, control]
      : selectedClimateControl.filter(c => c !== control);
    setSelectedClimateControl(newControls);
    form.setValue("climateControl", newControls);
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => apiRequest("PUT", "/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      refetch();
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) => apiRequest("PUT", "/api/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => {
      passwordForm.reset();
      setNewPasswordLength(0);
      setConfirmPasswordLength(0);
      setShowSuccessModal(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-ugga-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user.username} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <Input 
                  value={new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Input value={user.role} disabled className="bg-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    error={form.formState.errors.name?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    error={form.formState.errors.phone?.message}
                  />
                </div>
              </div>

              {/* Location and Farm Info */}
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
                </div>
              </div>

              {/* Member Type Selection */}
              <div className="space-y-4">
                <Label htmlFor="memberType">Member Type *</Label>
                <RadioGroup value={memberType} onValueChange={handleMemberTypeChange} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grower" id="grower" />
                    <Label htmlFor="grower">Grower Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general">General Member</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.memberType && (
                  <p className="text-sm text-red-600">{form.formState.errors.memberType.message}</p>
                )}
              </div>

              {/* Grower-specific fields */}
              {memberType === "grower" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="greenhouseRole">Greenhouse Role</Label>
                      <Input
                        id="greenhouseRole"
                        {...form.register("greenhouseRole")}
                        placeholder="e.g., Owner, Manager, Grower"
                      />
                      {form.formState.errors.greenhouseRole && (
                        <p className="text-sm text-red-600">{form.formState.errors.greenhouseRole.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Crop Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CROP_TYPES.map((crop) => (
                        <div key={crop} className="flex items-center space-x-2">
                          <Checkbox
                            id={crop}
                            checked={selectedCrops.includes(crop)}
                            onCheckedChange={(checked) => handleCropChange(crop, checked as boolean)}
                          />
                          <Label htmlFor={crop} className="text-sm">
                            {crop}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.cropTypes && (
                      <p className="text-sm text-red-600">{form.formState.errors.cropTypes.message}</p>
                    )}
                  </div>

                  {selectedCrops.includes("Other") && (
                    <div className="space-y-2">
                      <Label htmlFor="otherCrop">Other Crop Type *</Label>
                      <Input
                        id="otherCrop"
                        {...form.register("otherCrop")}
                        placeholder="Specify other crop type"
                      />
                      {form.formState.errors.otherCrop && (
                        <p className="text-sm text-red-600">{form.formState.errors.otherCrop.message}</p>
                      )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ghSize">Greenhouse Size</Label>
                      <Select value={form.watch("ghSize")} onValueChange={(value) => form.setValue("ghSize", value)}>
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
                      {form.formState.errors.ghSize && (
                        <p className="text-sm text-red-600">{form.formState.errors.ghSize.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productionMethod">Production Method</Label>
                      <Select value={form.watch("productionMethod")} onValueChange={(value) => form.setValue("productionMethod", value)}>
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
                      {form.formState.errors.productionMethod && (
                        <p className="text-sm text-red-600">{form.formState.errors.productionMethod.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suppLighting">Supplemental Lighting</Label>
                    <Select value={form.watch("suppLighting")} onValueChange={(value) => form.setValue("suppLighting", value)}>
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
                    {form.formState.errors.suppLighting && (
                      <p className="text-sm text-red-600">{form.formState.errors.suppLighting.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Climate Control/Greenhouse Type</Label>
                    <div className="space-y-2">
                      {CLIMATE_CONTROL_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-start space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={selectedClimateControl.includes(option.value)}
                            onCheckedChange={(checked) => handleClimateControlChange(option.value, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={option.value} className="text-sm">
                              {option.label}
                            </Label>
                            <p className="text-xs text-gray-500 italic mt-1">
                              {option.blurb}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.climateControl && (
                      <p className="text-sm text-red-600">{form.formState.errors.climateControl.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Other Farm Type Field */}
              {memberType === "grower" && form.watch("farmType") === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="otherFarmType">Other Farm Type *</Label>
                  <Input
                    id="otherFarmType"
                    {...form.register("otherFarmType")}
                    placeholder="Specify other farm type"
                  />
                  {form.formState.errors.otherFarmType && (
                    <p className="text-sm text-red-600">{form.formState.errors.otherFarmType.message}</p>
                  )}
                </div>
              )}



              {/* Professional Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer/Company</Label>
                  <Input
                    id="employer"
                    {...form.register("employer")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    {...form.register("jobTitle")}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="min-w-32"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    {...passwordForm.register("newPassword", {
                      onChange: (e) => setNewPasswordLength(e.target.value.length)
                    })}
                    className="pr-20"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
                    <span className={`text-sm px-2 ${newPasswordLength >= 12 ? 'text-green-600' : 'text-gray-500'}`}>
                      {newPasswordLength} / 12
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                )}
                <p className="text-sm text-gray-600">Password must be at least 12 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...passwordForm.register("confirmPassword", {
                      onChange: (e) => setConfirmPasswordLength(e.target.value.length)
                    })}
                    className="pr-20"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center">
                    <span className={`text-sm px-2 ${confirmPasswordLength >= 12 ? 'text-green-600' : 'text-gray-500'}`}>
                      {confirmPasswordLength} / 12
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                  className="min-w-32"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Password Updated</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">Password successfully updated.</p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setShowSuccessModal(false)} className="min-w-24">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
