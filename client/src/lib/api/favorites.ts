async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

export interface Favorite {
  user_id: string;
  resource_id: string;
  created_at: string;
  resource?: any;
}

export interface FavoriteListResponse {
  items: Favorite[];
  total: number;
}

export async function toggleFavorite(id: string, on: boolean): Promise<void> {
  if (on) {
    await apiRequest(`/api/favorites/${id}`, { method: 'POST' });
  } else {
    await apiRequest(`/api/favorites/${id}`, { method: 'DELETE' });
  }
}

export async function listFavorites(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<FavoriteListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  
  const url = `/api/favorites${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return apiRequest(url);
}

export async function isFavorited(id: string): Promise<boolean> {
  try {
    await apiRequest(`/api/favorites/${id}/check`);
    return true;
  } catch {
    return false;
  }
}