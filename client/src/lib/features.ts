export type IconName = 
  | "Home"
  | "FolderOpen"
  | "MessageCircle"
  | "Store"
  | "ClipboardList"
  | "ShoppingBag"
  | "MapPin"
  | "UserCircle";

export interface Feature {
  id: string;
  label: string;
  path: string;
  iconName: IconName;
  description?: string;
  inDevelopment?: boolean;
  requiresAuth?: boolean;
}

// Feature registry that drives both dashboard and demo navigation
export const features: Feature[] = [
  {
    id: "home",
    label: "Home",
    path: "/dashboard",
    iconName: "Home",
    description: "Dashboard overview and tools",
    inDevelopment: false,
    requiresAuth: false // Available in demo
  },
  {
    id: "resources",
    label: "Resource Library",
    path: "/dashboard/resources",
    iconName: "FolderOpen",
    description: "Browse curated grower resources",
    inDevelopment: true,
    requiresAuth: false // Available in demo
  },
  {
    id: "forum",
    label: "Member Forum",
    path: "/dashboard/forum",
    iconName: "MessageCircle",
    description: "Connect with fellow growers",
    inDevelopment: false,
    requiresAuth: false // Available in demo
  },
  {
    id: "saleshub",
    label: "Sales Hub",
    path: "/dashboard/saleshub",
    iconName: "Store",
    description: "Find buyers and distributors",
    inDevelopment: true,
    requiresAuth: false // Available in demo
  },
  {
    id: "assessment",
    label: "Farm Assessment",
    path: "/dashboard/assessment",
    iconName: "ClipboardList",
    description: "Assess your farm operation",
    inDevelopment: true,
    requiresAuth: false // Available in demo
  },
  {
    id: "producthub",
    label: "Product Hub",
    path: "/dashboard/producthub",
    iconName: "ShoppingBag",
    description: "Browse vetted products and services",
    inDevelopment: true,
    requiresAuth: false // Available in demo
  },
  {
    id: "find-grower",
    label: "Find a Grower",
    path: "/dashboard/find-grower",
    iconName: "MapPin",
    description: "Connect with growers by location",
    inDevelopment: true,
    requiresAuth: false // Available in demo
  },
  {
    id: "profile",
    label: "Profile",
    path: "/dashboard/profile",
    iconName: "UserCircle",
    description: "Manage your profile and preferences",
    inDevelopment: false,
    requiresAuth: true // Not available in demo
  }
];

// Get features available for demo mode (non-auth required)
export function getDemoFeatures(): Feature[] {
  return features.filter(feature => !feature.requiresAuth).map(feature => ({
    ...feature,
    path: feature.path.replace('/dashboard', '/demo')
  }));
}

// Get all features for authenticated users
export function getAuthenticatedFeatures(): Feature[] {
  return features;
}

// Get feature by ID
export function getFeatureById(id: string): Feature | undefined {
  return features.find(feature => feature.id === id);
}

// Get feature by path
export function getFeatureByPath(path: string): Feature | undefined {
  return features.find(feature => feature.path === path);
}
