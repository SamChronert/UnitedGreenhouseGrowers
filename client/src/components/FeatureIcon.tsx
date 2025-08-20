import {
  Home,
  FolderOpen,
  MessageCircle,
  Store,
  ClipboardList,
  ShoppingBag,
  MapPin,
  UserCircle
} from "lucide-react";
import { IconName } from "@/lib/features";

interface FeatureIconProps {
  iconName: IconName;
  className?: string;
}

export default function FeatureIcon({ iconName, className = "h-5 w-5" }: FeatureIconProps) {
  const icons = {
    Home,
    FolderOpen,
    MessageCircle,
    Store,
    ClipboardList,
    ShoppingBag,
    MapPin,
    UserCircle
  };

  const IconComponent = icons[iconName];
  
  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} />;
}
