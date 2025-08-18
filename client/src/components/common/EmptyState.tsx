import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  body: string;
  icon?: React.ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
  ctaVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  title,
  body,
  icon,
  ctaText = "Suggest a Resource",
  onCtaClick,
  ctaVariant = "default",
  className,
  children
}: EmptyStateProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="py-16 text-center">
        <div className="max-w-md mx-auto">
          {icon && (
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              {icon}
            </div>
          )}
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {body}
          </p>
          
          {/* CTA Slot */}
          {(onCtaClick || children) && (
            <div className="space-y-3">
              {onCtaClick && (
                <Button 
                  variant={ctaVariant}
                  onClick={onCtaClick}
                  className={ctaVariant === "default" ? "text-white" : ""}
                  style={ctaVariant === "default" ? { backgroundColor: 'var(--color-clay)' } : {}}
                >
                  {ctaText}
                </Button>
              )}
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}