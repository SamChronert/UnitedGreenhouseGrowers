import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ToggleGroupProps {
  /** Current selected value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Available toggle options */
  options: ToggleOption[];
  /** Optional className for styling */
  className?: string;
  /** ARIA label for the toggle group */
  ariaLabel?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Keyboard event handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * A reusable toggle group component that works like radio buttons.
 * Provides keyboard navigation and proper accessibility support.
 * 
 * @example
 * ```tsx
 * <ToggleGroup
 *   value={viewMode}
 *   onValueChange={setViewMode}
 *   options={[
 *     { value: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> },
 *     { value: 'list', label: 'List', icon: <List className="h-4 w-4" /> }
 *   ]}
 *   ariaLabel="View mode"
 * />
 * ```
 */
export function ToggleGroup({
  value,
  onValueChange,
  options,
  className,
  ariaLabel,
  size = 'md',
  onKeyDown
}: ToggleGroupProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };

  const buttonSizeClasses = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-9 px-4 text-base'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        sizeClasses[size],
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            buttonSizeClasses[size],
            value === option.value
              ? 'bg-background text-foreground shadow'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
          )}
          onClick={() => onValueChange(option.value)}
          onKeyDown={(e) => {
            // Handle keyboard navigation within the toggle group
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              const prevIndex = index > 0 ? index - 1 : options.length - 1;
              onValueChange(options[prevIndex].value);
              // Focus management handled by parent
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              const nextIndex = index < options.length - 1 ? index + 1 : 0;
              onValueChange(options[nextIndex].value);
              // Focus management handled by parent
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onValueChange(option.value);
            }
          }}
        >
          {option.icon && (
            <span className={cn(
              'mr-2 flex items-center',
              size === 'sm' && 'mr-1'
            )}>
              {option.icon}
            </span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}