async function apiRequest(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}

export interface ResourceFilters {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  type?: string[];
  topics?: string[];
  crop?: string[];
  system_type?: string[];
  region?: string[];
  audience?: string[];
  cost?: string[];
  status?: string[];
  eligibility_geo?: string[];
  format?: string[];
  has_location?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  tags: string[];
  // Extended fields (for future schema)
  summary?: string;
  type?: string;
  topics?: string[];
  crop?: string[];
  system_type?: string[];
  region?: string;
  audience?: string;
  cost?: string;
  status?: string;
  eligibility_geo?: string;
  format?: string;
  ugga_verified?: boolean;
  last_verified_at?: string | Date;
  quality_score?: number;
  version?: string;
  data?: Record<string, any>;
  lat?: number;
  long?: number;
  has_location?: boolean;
}

export interface ResourceListResponse {
  items: Resource[];
  total: number;
}

export async function listResources(params: ResourceFilters): Promise<ResourceListResponse> {
  const searchParams = new URLSearchParams();

  // Add pagination params
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.sort) searchParams.set('sort', params.sort);

  // Add search query
  if (params.q?.trim()) searchParams.set('q', params.q.trim());

  // Add array filters (simplified for current schema)
  if (params.type?.length) {
    params.type.forEach(value => searchParams.append('tags', value));
  }
  if (params.topics?.length) {
    params.topics.forEach(value => searchParams.append('tags', value));
  }
  if (params.crop?.length) {
    params.crop.forEach(value => searchParams.append('tags', value));
  }
  if (params.system_type?.length) {
    params.system_type.forEach(value => searchParams.append('tags', value));
  }

  const url = `/api/resources?${searchParams.toString()}`;
  return apiRequest(url);
}