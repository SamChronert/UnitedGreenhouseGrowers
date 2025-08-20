import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ResourceFilters {
  state?: string;
  country?: string;
  programName?: string;
  rfpDueDate?: string;
  eligibility?: string;
  [key: string]: any;
}

export interface UseResourcesParams {
  type?: string;
  query?: string;
  filters?: ResourceFilters;
  sort?: 'relevance' | 'title' | 'newest' | 'quality';
  enabled?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  summary: string;
  data: Record<string, any>;
  tags: string[];
}

export interface ResourcesResponse {
  items: Resource[];
  nextCursor: string | null;
  total: number;
}

/**
 * Custom hook for fetching resources with React Query
 * Implements stale-while-revalidate strategy with caching
 */
export function useResources({
  type,
  query,
  filters = {},
  sort = 'relevance',
  enabled = true
}: UseResourcesParams) {
  const queryKey = ['resources', type, query, JSON.stringify(filters), sort];
  
  return useQuery<ResourcesResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (type) params.set('type', type);
      if (query?.trim()) params.set('q', query.trim());
      if (Object.keys(filters).length > 0) {
        params.set('filters', JSON.stringify(filters));
      }
      params.set('sort', sort);
      params.set('limit', '20');
      
      const url = `/api/resources?${params.toString()}`;
      return apiRequest('GET', url);
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Hook for infinite scrolling/pagination with cursor-based pagination
 */
export function useInfiniteResources({
  type,
  query,
  filters = {},
  sort = 'relevance',
  enabled = true
}: UseResourcesParams) {
  const queryKey = ['resources-infinite', type, query, JSON.stringify(filters), sort];
  
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      
      if (type) params.set('type', type);
      if (query?.trim()) params.set('q', query.trim());
      if (Object.keys(filters).length > 0) {
        params.set('filters', JSON.stringify(filters));
      }
      params.set('sort', sort);
      params.set('limit', '20');
      if (pageParam) params.set('cursor', pageParam);
      
      const url = `/api/resources?${params.toString()}`;
      return apiRequest('GET', url) as Promise<ResourcesResponse>;
    },
    enabled,
    getNextPageParam: (lastPage: ResourcesResponse) => lastPage.nextCursor,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    initialPageParam: undefined
  });
}

/**
 * Helper to flatten infinite query pages into a single array
 */
export function useResourcesList(infiniteQuery: ReturnType<typeof useInfiniteResources>) {
  return infiniteQuery.data?.pages.flatMap((page: ResourcesResponse) => page.items) || [];
}