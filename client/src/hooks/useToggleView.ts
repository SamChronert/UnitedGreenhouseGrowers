import { useState, useCallback, useEffect } from 'react';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface UseToggleViewOptions {
  /** Unique key for this toggle instance (for session storage) */
  storageKey: string;
  /** Default value when no stored value exists */
  defaultValue: string;
  /** Available toggle options */
  options: ToggleOption[];
}

/**
 * A shared hook for managing toggle view state with session persistence
 * and keyboard navigation support.
 * 
 * @example
 * ```tsx
 * const { currentValue, handleChange, handleKeyDown } = useToggleView({
 *   storageKey: 'university-view',
 *   defaultValue: 'grid',
 *   options: [
 *     { value: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> },
 *     { value: 'map', label: 'Map', icon: <Map className="h-4 w-4" /> }
 *   ]
 * });
 * ```
 */
export function useToggleView({
  storageKey,
  defaultValue,
  options
}: UseToggleViewOptions) {
  // Initialize state from sessionStorage or default
  const [currentValue, setCurrentValue] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(storageKey);
      if (stored && options.some(opt => opt.value === stored)) {
        return stored;
      }
    }
    return defaultValue;
  });

  // Update sessionStorage when value changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, currentValue);
    }
  }, [storageKey, currentValue]);

  // Handle value change
  const handleChange = useCallback((value: string) => {
    if (options.some(opt => opt.value === value)) {
      setCurrentValue(value);
    }
  }, [options]);

  // Handle keyboard navigation (arrow keys to navigate, Enter/Space to select)
  const handleKeyDown = useCallback((event: React.KeyboardEvent, onSelect?: (value: string) => void) => {
    const currentIndex = options.findIndex(opt => opt.value === currentValue);
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        setCurrentValue(options[prevIndex].value);
        break;
        
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        setCurrentValue(options[nextIndex].value);
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(currentValue);
        break;
    }
  }, [currentValue, options]);

  return {
    currentValue,
    handleChange,
    handleKeyDown,
    options
  };
}