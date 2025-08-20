import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load heavy components
export const LazyAdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
export const LazyUniversityMap = lazy(() => import('./UniversityMap'));
export const LazyVirtualizedList = lazy(() => import('./VirtualizedResourceList'));

// Loading fallback components
const AnalyticsLoadingSkeleton = () => (
  <div className="min-h-screen py-8 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded mb-4" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const MapLoadingSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-ugga-primary mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ListLoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Higher-order component for lazy loading with suspense
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>, 
  LoadingComponent: ComponentType = () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-ugga-primary" />
    </div>
  )
) {
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Export wrapped components with appropriate loading states
export const AdminAnalyticsWithLoading = withLazyLoading(LazyAdminAnalytics, AnalyticsLoadingSkeleton);
export const UniversityMapWithLoading = withLazyLoading(LazyUniversityMap, MapLoadingSkeleton);  
export const VirtualizedListWithLoading = withLazyLoading(LazyVirtualizedList, ListLoadingSkeleton);