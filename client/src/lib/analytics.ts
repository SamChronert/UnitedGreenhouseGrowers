interface AnalyticsEvent {
  eventType: string;
  data: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private batchTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupUnloadHandler();
  }
  
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  private setupUnloadHandler() {
    // Send events on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
    
    // Send events on visibility change (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }
  
  /**
   * Track an analytics event
   */
  trackEvent(eventType: string, data: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      eventType,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
    
    this.events.push(event);
    
    // Schedule batch send if not already scheduled
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flush();
      }, 5000); // Send every 5 seconds
    }
  }
  
  /**
   * Immediately send all queued events
   */
  private flush() {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Send events to analytics endpoint (fire and forget)
    try {
      // Use sendBeacon for better reliability on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify({
          events: eventsToSend
        }));
      } else {
        // Fallback to fetch for older browsers
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: eventsToSend }),
          keepalive: true
        }).catch(() => {
          // Silently fail - analytics shouldn't break user experience
        });
      }
    } catch (error) {
      // Silently fail - analytics shouldn't break user experience
      console.debug('Analytics error:', error);
    }
  }
}

// Singleton instance
const analytics = new Analytics();

/**
 * Track an analytics event with automatic batching
 * @param eventType - Type of event (e.g. 'tab_view', 'resource_click')
 * @param data - Event data payload
 */
export function trackEvent(eventType: string, data: Record<string, any> = {}) {
  analytics.trackEvent(eventType, data);
}

// Convenience functions for common events
export const trackTabView = (tabId: string, tabLabel: string) => {
  trackEvent('tab_view', { tab_id: tabId, tab_label: tabLabel });
};

export const trackResourceClick = (resourceId: string, resourceType: string, resourceTitle: string) => {
  trackEvent('resource_click', { 
    resource_id: resourceId, 
    resource_type: resourceType, 
    resource_title: resourceTitle 
  });
};

export const trackSearch = (query: string, resultCount: number, resourceType?: string) => {
  trackEvent('search', { 
    query, 
    result_count: resultCount, 
    resource_type: resourceType 
  });
};

export const trackFilter = (filterType: string, filterValue: string, resourceType?: string) => {
  trackEvent('filter', { 
    filter_type: filterType, 
    filter_value: filterValue, 
    resource_type: resourceType 
  });
};