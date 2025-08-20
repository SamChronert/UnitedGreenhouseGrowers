import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resource } from '@/hooks/useResources';
import { trackSearch } from '@/lib/analytics';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resources?: Resource[];
  resourceType?: string;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

// Type-specific synonyms for better search experience
const TYPE_SYNONYMS: Record<string, string[]> = {
  universities: ['schools', 'colleges', 'education', 'research', 'academic'],
  grants: ['funding', 'money', 'financial', 'support', 'awards'],
  organizations: ['groups', 'associations', 'societies', 'companies'],
  tools: ['software', 'equipment', 'technology', 'instruments'],
  templates: ['forms', 'documents', 'samples', 'examples'],
  learning: ['education', 'training', 'courses', 'tutorials'],
};

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search resources...',
  resources = [],
  resourceType,
  onSuggestionSelect,
  className
}: SearchBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Debounce input value (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  // Generate suggestions based on current resources and synonyms
  const suggestions = useMemo(() => {
    if (!debouncedValue.trim() || debouncedValue.length < 2) return [];
    
    const query = debouncedValue.toLowerCase();
    const suggestionSet = new Set<string>();
    
    // Add matching resource titles and summaries
    resources.forEach(resource => {
      const title = resource.title.toLowerCase();
      const summary = resource.summary?.toLowerCase() || '';
      
      // Fuzzy matching - check if query is contained in title or summary
      if (title.includes(query)) {
        suggestionSet.add(resource.title);
      } else if (summary.includes(query)) {
        suggestionSet.add(resource.title);
      }
      
      // Add partial matches from title words
      const titleWords = resource.title.split(/\s+/);
      titleWords.forEach(word => {
        if (word.toLowerCase().startsWith(query) && word.length > query.length) {
          suggestionSet.add(word);
        }
      });
    });
    
    // Add synonyms for the current resource type
    if (resourceType && TYPE_SYNONYMS[resourceType]) {
      TYPE_SYNONYMS[resourceType].forEach(synonym => {
        if (synonym.toLowerCase().includes(query)) {
          suggestionSet.add(synonym);
        }
      });
    }
    
    // Convert to array and limit to top 5
    return Array.from(suggestionSet).slice(0, 5);
  }, [debouncedValue, resources, resourceType]);
  
  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(newValue.length >= 2);
    setHighlightedIndex(-1);
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSuggestionSelect?.(suggestion);
    
    // Track search analytics
    trackSearch(suggestion, resources.length, resourceType);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        } else if (value.trim()) {
          trackSearch(value, resources.length, resourceType);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  // Clear search
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };
  
  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen && suggestions.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => value.length >= 2 && setIsOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-10"
              role="combobox"
              aria-expanded={isOpen && suggestions.length > 0}
              aria-controls={isOpen ? 'search-suggestions' : undefined}
              aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
            />
            {value && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandList id="search-suggestions">
              <CommandEmpty>No suggestions found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <CommandItem
                      key={suggestion}
                      id={`suggestion-${index}`}
                      value={suggestion}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className={cn(
                        'cursor-pointer',
                        isHighlighted && 'bg-accent'
                      )}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      <HighlightedText text={suggestion} query={debouncedValue} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Component to highlight matching text in suggestions
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 font-medium">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}