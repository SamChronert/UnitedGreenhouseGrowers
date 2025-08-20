import { useLocation } from 'wouter';
import { useCallback, useMemo, useState, useEffect } from 'react';

/**
 * A robust hook for managing query parameters that works reliably with Wouter.
 * Reads params from window.location.search and reacts to URL changes properly.
 * 
 * @example
 * ```tsx
 * const { getParam, setParam, removeParam, setParams } = useQueryParams();
 * 
 * // Get a parameter value
 * const filter = getParam('filter') || 'all';
 * 
 * // Set a single parameter
 * setParam('filter', 'active');
 * 
 * // Set multiple parameters at once
 * setParams({ filter: 'active', sort: 'date' });
 * 
 * // Remove a parameter
 * removeParam('filter');
 * ```
 */
export function useQueryParams() {
  const [location, setLocation] = useLocation();
  
  // Track current search params in state to ensure reactivity
  const [searchParams, setSearchParams] = useState(() => window.location.search);
  
  // Update searchParams when location changes (including browser back/forward)
  useEffect(() => {
    setSearchParams(window.location.search);
  }, [location]);
  
  // Create URLSearchParams object from current search params
  const params = useMemo(() => {
    return new URLSearchParams(searchParams);
  }, [searchParams]);

  // Get a specific parameter value
  const getParam = useCallback((key: string): string | null => {
    return params.get(key);
  }, [params]);

  // Set a parameter while preserving existing ones
  const setParam = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(key, value);
    
    // Get the base path without query params
    const basePath = location.split('?')[0];
    const newSearch = newParams.toString();
    
    // Update the URL with Wouter
    setLocation(`${basePath}?${newSearch}`);
  }, [location, setLocation]);

  // Remove a parameter
  const removeParam = useCallback((key: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(key);
    
    const basePath = location.split('?')[0];
    const newSearch = newParams.toString();
    
    // Update the URL, omit '?' if no params remain
    setLocation(newSearch ? `${basePath}?${newSearch}` : basePath);
  }, [location, setLocation]);

  // Get all parameters as an object
  const getAllParams = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [params]);

  // Set multiple parameters at once
  const setParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      newParams.set(key, value);
    });
    
    const basePath = location.split('?')[0];
    const newSearch = newParams.toString();
    
    // Update the URL with Wouter
    setLocation(`${basePath}?${newSearch}`);
  }, [location, setLocation]);

  // Get raw URLSearchParams object (alias for the params property)
  const getParams = useCallback(() => {
    return params;
  }, [params]);

  return {
    getParam,
    setParam,
    removeParam,
    setParams,
    getAllParams,
    getParams,
    params: params // Raw URLSearchParams object for advanced use
  };
}

/**
 * A hook that syncs a query parameter with React state.
 * Useful for connecting URL parameters directly to component state.
 * 
 * @param key - The query parameter key
 * @param defaultValue - Default value when parameter is not present
 * @returns A tuple [currentValue, setValue] similar to useState
 * 
 * @example
 * ```tsx
 * const [filter, setFilter] = useParamState('filter', 'all');
 * const [sortBy, setSortBy] = useParamState('sort', 'name');
 * 
 * // Use like regular state - changes automatically sync to URL
 * <select value={filter} onChange={(e) => setFilter(e.target.value)}>
 *   <option value="all">All</option>
 *   <option value="active">Active</option>
 * </select>
 * ```
 */
export function useParamState(key: string, defaultValue: string) {
  const { getParam, setParam } = useQueryParams();
  const current = getParam(key) || defaultValue;
  
  const setValue = useCallback((value: string) => {
    setParam(key, value);
  }, [key, setParam]);
  
  return [current, setValue] as const;
}