import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";

interface Tab {
  id: string;
  label: string;
  slug: string;
}

const TABS: Tab[] = [
  { id: 'tools-templates', label: 'Tools & Templates', slug: 'tools-templates' },
  { id: 'universities', label: 'Universities', slug: 'universities' },
  { id: 'organizations', label: 'Organizations', slug: 'organizations' },
  { id: 'learning', label: 'Learning', slug: 'learning' },
  { id: 'grants', label: 'Grants', slug: 'grants' },
  { id: 'blogs-bulletins', label: 'Blogs & Bulletins', slug: 'blogs-bulletins' },
  { id: 'industry-news', label: 'Industry News', slug: 'industry-news' },
  { id: 'tax-incentives', label: 'Tax Incentives', slug: 'tax-incentives' }
];

interface TabsBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAnalyticsEvent: (eventName: string, payload: any) => void;
}

export default function TabsBar({ activeTab, onTabChange, onAnalyticsEvent }: TabsBarProps) {
  const [location, setLocation] = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Find current tab index
  const currentTabIndex = TABS.findIndex(tab => tab.id === activeTab);

  // Handle tab selection
  const handleTabSelect = useCallback((tab: Tab, index: number) => {
    // Update URL
    const params = new URLSearchParams(location.split('?')[1] || '');
    params.set('tab', tab.slug);
    const newURL = `/dashboard/resources?${params.toString()}`;
    setLocation(newURL, { replace: true });
    
    // Fire analytics event
    onAnalyticsEvent('tab_view', {
      tab_id: tab.id,
      tab_label: tab.label
    });
    
    // Update state
    onTabChange(tab.id);
    setFocusedIndex(index);
  }, [location, setLocation, onTabChange, onAnalyticsEvent]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : TABS.length - 1;
        setFocusedIndex(prevIndex);
        if (tabsRef.current) {
          const prevTab = tabsRef.current.children[prevIndex] as HTMLButtonElement;
          prevTab?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = index < TABS.length - 1 ? index + 1 : 0;
        setFocusedIndex(nextIndex);
        if (tabsRef.current) {
          const nextTab = tabsRef.current.children[nextIndex] as HTMLButtonElement;
          nextTab?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabSelect(TABS[index], index);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        if (tabsRef.current) {
          const firstTab = tabsRef.current.children[0] as HTMLButtonElement;
          firstTab?.focus();
        }
        break;
      case 'End':
        event.preventDefault();
        const lastIndex = TABS.length - 1;
        setFocusedIndex(lastIndex);
        if (tabsRef.current) {
          const lastTab = tabsRef.current.children[lastIndex] as HTMLButtonElement;
          lastTab?.focus();
        }
        break;
    }
  }, [handleTabSelect]);

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav aria-label="Resource type navigation">
        <div 
          ref={tabsRef}
          className="flex flex-wrap gap-x-8 gap-y-4 sm:overflow-x-auto sm:flex-nowrap scrollbar-hide"
          role="tablist"
        >
          <div className="flex flex-wrap gap-x-8 gap-y-4 sm:flex-nowrap sm:space-x-8 sm:min-w-max px-1">
            {TABS.map((tab, index) => {
              const isActive = tab.id === activeTab;
              const tabIndex = isActive ? 0 : -1;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "relative whitespace-nowrap pb-4 px-4 py-3 transition-all duration-200 ease-in-out cursor-pointer",
                    "focus:outline-none focus:ring-3 focus:ring-blue-600 focus:ring-offset-2 focus:bg-white",
                    "rounded-t-lg border-b-4",
                    isActive
                      ? "border-blue-600 text-blue-700 bg-blue-50 font-bold text-base shadow-sm"
                      : "border-transparent text-gray-600 font-medium text-sm hover:text-gray-900 hover:border-gray-400 hover:bg-gray-100 hover:shadow-sm"
                  )}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  tabIndex={tabIndex}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export { TABS };
export type { Tab };