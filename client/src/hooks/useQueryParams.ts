import { useLocation } from 'wouter';
import { useCallback, useMemo } from 'react';

/**
 * A robust hook for managing query parameters that works reliably with Wouter.
 * Reads params from window.location.search directly (not Wouter's location)
 * and uses Wouter's setLocation to update the URL while preserving existing params.
 */
export function useQueryParams() {
  const [location, setLocation] = useLocation();

  // Get current query parameters from window.location.search
  const params = useMemo(() => {
    return new URLSearchParams(window.location.search);
  }, [window.location.search]);

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

  return {
    getParam,
    setParam,
    removeParam,
    getAllParams,
    params: params // Raw URLSearchParams object for advanced use
  };
}