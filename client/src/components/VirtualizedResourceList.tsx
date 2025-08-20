import { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResourceCard from './resources/ResourceCard';
import ResourceRow from './resources/ResourceRow';
import { Resource } from '@/hooks/useResources';

interface VirtualizedResourceListProps {
  resources: Resource[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => void;
  onResourceClick?: (resource: Resource) => void;
  onToggleFavorite?: (id: string, favorited: boolean) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
  favoriteIds?: Set<string>;
}

const ITEM_HEIGHT = 220; // Height for grid cards
const ROW_HEIGHT = 120; // Height for list rows

// Memoized skeleton loader component
const SkeletonCard = memo(() => (
  <Card className="animate-pulse">
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
));

// Memoized skeleton row component
const SkeletonRow = memo(() => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border animate-pulse">
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-20" />
    </div>
  </div>
));

const VirtualizedResourceList = memo(function VirtualizedResourceList({
  resources,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  onResourceClick,
  onToggleFavorite,
  viewMode = 'grid',
  className = '',
  favoriteIds = new Set()
}: VirtualizedResourceListProps) {
  // Only virtualize if we have more than 50 items
  const shouldVirtualize = resources.length > 50;
  
  if (!shouldVirtualize) {
    // Render normally for smaller lists
    return (
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'} ${className}`}>
        {resources.map((resource) => 
          viewMode === 'grid' ? (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpen={() => onResourceClick?.(resource)}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favoriteIds.has(resource.id)}
            />
          ) : (
            <ResourceRow
              key={resource.id}
              resource={resource}
              onOpen={() => onResourceClick?.(resource)}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favoriteIds.has(resource.id)}
            />
          )
        )}
      </div>
    );
  }

  // Calculate total items (resources + loading items)
  const itemCount = hasNextPage ? resources.length + 1 : resources.length;
  const loadedCount = resources.length;

  // Check if an item is loaded
  const isItemLoaded = (index: number) => !!resources[index];

  // Grid item renderer
  const GridItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const resource = resources[index];
    
    if (!resource) {
      return (
        <div style={style} className="p-3">
          <SkeletonCard />
        </div>
      );
    }

    return (
      <div style={style} className="p-3">
        <ResourceCard
          resource={resource}
          onOpen={() => onResourceClick?.(resource)}
          onToggleFavorite={onToggleFavorite}
          isFavorited={favoriteIds.has(resource.id)}
        />
      </div>
    );
  };

  // List item renderer  
  const ListItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const resource = resources[index];
    
    if (!resource) {
      return (
        <div style={style} className="px-4">
          <SkeletonRow />
        </div>
      );
    }

    return (
      <div style={style} className="px-4">
        <ResourceRow
          resource={resource}
          onOpen={() => onResourceClick?.(resource)}
          onToggleFavorite={onToggleFavorite}
          isFavorited={favoriteIds.has(resource.id)}
        />
      </div>
    );
  };

  const ItemRenderer = viewMode === 'grid' ? GridItem : ListItem;
  const itemHeight = viewMode === 'grid' ? ITEM_HEIGHT : ROW_HEIGHT;

  return (
    <div className={className}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadNextPage}
        threshold={10} // Load more when we're 10 items from the end
      >
        {({ onItemsRendered, ref }: any) => (
          <List
            ref={ref}
            height={600} // Fixed height for the virtualized list
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={onItemsRendered}
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {ItemRenderer}
          </List>
        )}
      </InfiniteLoader>
      
      {isNextPageLoading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ugga-primary mr-2"></div>
            Loading more resources...
          </div>
        </div>
      )}
    </div>
  );
});

export default VirtualizedResourceList;