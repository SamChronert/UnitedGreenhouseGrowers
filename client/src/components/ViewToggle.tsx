import React from 'react';
import { useParamState } from '@/hooks/useQueryParams';
import { ToggleGroup, ToggleOption } from '@/features/resources/components/ToggleGroup';
import { Grid3X3, List, Map } from 'lucide-react';

export interface ViewToggleProps {
  /** Available view options */
  options: string[];
  /** Optional className for styling */
  className?: string;
  /** ARIA label for the toggle group */
  ariaLabel?: string;
}

// Icon mapping for common view types
const VIEW_ICONS: Record<string, React.ReactNode> = {
  grid: <Grid3X3 className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  map: <Map className="h-4 w-4" />
};

/**
 * A reusable view toggle component that manages view state via URL parameters.
 * Works seamlessly with Wouter and provides consistent state management across tabs.
 * 
 * @example
 * ```tsx
 * <ViewToggle 
 *   options={['grid', 'list']} 
 *   ariaLabel="Change view mode"
 * />
 * ```
 */
export function ViewToggle({ 
  options, 
  className,
  ariaLabel = "Change view mode" 
}: ViewToggleProps) {
  const [currentView, setCurrentView] = useParamState('view', options[0]);

  // Convert string options to ToggleOption objects
  const toggleOptions: ToggleOption[] = options.map(option => ({
    value: option,
    label: option.charAt(0).toUpperCase() + option.slice(1),
    icon: VIEW_ICONS[option.toLowerCase()]
  }));

  return (
    <ToggleGroup
      value={currentView}
      onValueChange={setCurrentView}
      options={toggleOptions}
      className={className}
      ariaLabel={ariaLabel}
      size="sm"
    />
  );
}