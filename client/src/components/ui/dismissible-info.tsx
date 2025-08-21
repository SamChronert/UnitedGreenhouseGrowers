import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface DismissibleInfoProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "info" | "success" | "warning";
  showDontShowAgain?: boolean;
}

export function DismissibleInfo({
  id,
  title,
  children,
  className,
  variant = "info",
  showDontShowAgain = true
}: DismissibleInfoProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const storageKey = `dismissible-info-${id}`;
  const sessionKey = `${storageKey}-session`;

  useEffect(() => {
    // Check if permanently dismissed (localStorage)
    const permanentlyDismissed = localStorage.getItem(storageKey) === "true";
    
    // Check if dismissed for this session (sessionStorage)
    const sessionDismissed = sessionStorage.getItem(sessionKey) === "true";
    
    if (permanentlyDismissed || sessionDismissed) {
      setIsDismissed(true);
    } else {
      // Show with animation after a brief delay
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [storageKey, sessionKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsDismissed(true);
      
      if (dontShowAgain) {
        localStorage.setItem(storageKey, "true");
      } else {
        sessionStorage.setItem(sessionKey, "true");
      }
    }, 200);
  };

  if (isDismissed) {
    return null;
  }

  const variantStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900"
  };

  const iconColor = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-amber-600"
  };

  return (
    <Card 
      className={cn(
        "mb-6 border transition-all duration-200 ease-in-out",
        variantStyles[variant],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor[variant])} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-semibold mb-2">{title}</h3>
            )}
            <div className="text-sm leading-relaxed">
              {children}
            </div>
            
            {showDontShowAgain && (
              <div className="flex items-center gap-2 mt-3">
                <Checkbox
                  id={`${id}-dont-show`}
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                  className="text-xs"
                />
                <label 
                  htmlFor={`${id}-dont-show`}
                  className="text-xs cursor-pointer select-none"
                >
                  Don't show again this session
                </label>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 hover:bg-white/50 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DismissibleInfo;