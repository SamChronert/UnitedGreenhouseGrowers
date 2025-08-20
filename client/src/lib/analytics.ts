interface AnalyticsEvent {
  eventType: 'tab_view' | 'search_submit' | 'filter_change' | 'resource_open' | 'outbound_click' | 'template_download';
  tab?: string;
  resourceId?: string;
  payload?: Record<string, any>;
}

interface QueuedEvent extends AnalyticsEvent {
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private eventQueue: QueuedEvent[] = [];
  private sessionId: string;
  private maxQueueSize = 20;
  private flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private isEnabled = true;
  
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.setupUnloadHandler();
    this.checkDNTHeader();
  }
  
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('ugga_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('ugga_session_id', sessionId);
    }
    return sessionId;
  }

  private checkDNTHeader(): void {
    // Respect Do Not Track header
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') {
      this.isEnabled = false;
    }
  }
  
  private setupUnloadHandler(): void {
    // Use sendBeacon on page unload for reliable delivery
    window.addEventListener('beforeunload', () => {
      if (this.eventQueue.length > 0) {
        this.sendBeacon();
      }
    });

    // Also flush on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.eventQueue.length > 0) {
        this.sendBeacon();
      }
    });
  }
  
  private sendBeacon(): void {
    if (!this.isEnabled || this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      navigator.sendBeacon(
        '/api/analytics',
        JSON.stringify(events)
      );
    } catch (error) {
      console.warn('Analytics beacon failed:', error);
    }
  }

  private async flushEvents(): Promise<void> {
    if (!this.isEnabled || this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events),
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Analytics request failed:', response.status);
        // Don't re-queue events to avoid infinite loops
      }
    } catch (error) {
      console.warn('Analytics request error:', error);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  public track(eventType: AnalyticsEvent['eventType'], data: Omit<AnalyticsEvent, 'eventType'> = {}): void {
    if (!this.isEnabled) return;

    // Sanitize payload to remove any PII
    const sanitizedPayload = this.sanitizePayload(data.payload || {});

    const event: QueuedEvent = {
      eventType,
      tab: data.tab,
      resourceId: data.resourceId,
      payload: sanitizedPayload,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);

    // Flush if queue is full or schedule flush
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flushEvents();
    } else {
      this.scheduleFlush();
    }
  }

  private sanitizePayload(payload: Record<string, any>): Record<string, any> {
    const sanitized = { ...payload };
    
    // Remove potential PII fields
    const piiFields = ['email', 'name', 'phone', 'address', 'ip', 'user_id'];
    piiFields.forEach(field => {
      delete sanitized[field];
    });

    // Limit string lengths to prevent abuse
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
        sanitized[key] = sanitized[key].substring(0, 200) + '...';
      }
    });

    return sanitized;
  }

  // Public API methods
  public trackTabView(tab: string, additionalData: Record<string, any> = {}): void {
    this.track('tab_view', {
      tab,
      payload: additionalData,
    });
  }

  public trackSearchSubmit(query: string, tab?: string, filters?: Record<string, any>): void {
    this.track('search_submit', {
      tab,
      payload: {
        queryLength: query.length, // Track query length, not content
        hasFilters: Boolean(filters && Object.keys(filters).length > 0),
        filterCount: filters ? Object.keys(filters).length : 0,
      },
    });
  }

  public trackFilterChange(tab: string, filterType: string, filterValue: string): void {
    this.track('filter_change', {
      tab,
      payload: {
        filterType,
        hasValue: Boolean(filterValue),
      },
    });
  }

  public trackResourceOpen(resourceId: string, tab: string, position?: number, fromSearch?: boolean): void {
    this.track('resource_open', {
      tab,
      resourceId,
      payload: {
        position,
        fromSearch,
      },
    });
  }

  public trackOutboundClick(url: string, tab?: string, resourceId?: string): void {
    // Extract domain for tracking, not full URL for privacy
    const domain = new URL(url).hostname;
    
    this.track('outbound_click', {
      tab,
      resourceId,
      payload: {
        domain,
      },
    });
  }

  public trackTemplateDownload(templateId: string, templateType: string, tab?: string): void {
    this.track('template_download', {
      tab,
      resourceId: templateId,
      payload: {
        templateType,
      },
    });
  }

  // Method to disable analytics (for opt-out)
  public disable(): void {
    this.isEnabled = false;
    this.eventQueue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }

  public enable(): void {
    this.isEnabled = true;
  }

  // Legacy method for backward compatibility
  trackEvent(eventType: string, data: Record<string, any> = {}) {
    // Convert old format to new format
    this.track(eventType as any, { payload: data });
  }
  
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions for easier usage
export const trackEvent = (eventType: AnalyticsEvent['eventType'], data?: Omit<AnalyticsEvent, 'eventType'>) => {
  analytics.track(eventType, data);
};

export const trackTabView = (tab: string, additionalData?: Record<string, any>) => {
  analytics.trackTabView(tab, additionalData);
};

export const trackSearchSubmit = (query: string, tab?: string, filters?: Record<string, any>) => {
  analytics.trackSearchSubmit(query, tab, filters);
};

export const trackFilterChange = (tab: string, filterType: string, filterValue: string) => {
  analytics.trackFilterChange(tab, filterType, filterValue);
};

export const trackResourceOpen = (resourceId: string, tab: string, position?: number, fromSearch?: boolean) => {
  analytics.trackResourceOpen(resourceId, tab, position, fromSearch);
};

export const trackOutboundClick = (url: string, tab?: string, resourceId?: string) => {
  analytics.trackOutboundClick(url, tab, resourceId);
};

export const trackTemplateDownload = (templateId: string, templateType: string, tab?: string) => {
  analytics.trackTemplateDownload(templateId, templateType, tab);
};

// Legacy functions for backward compatibility
export const trackResourceClick = (resourceId: string, resourceType: string, resourceTitle: string) => {
  analytics.trackResourceOpen(resourceId, resourceType, undefined, false);
};

export const trackSearch = (query: string, resultCount: number, resourceType?: string) => {
  analytics.trackSearchSubmit(query, resourceType);
};

export const trackFilter = (filterType: string, filterValue: string, resourceType?: string) => {
  analytics.trackFilterChange(resourceType || '', filterType, filterValue);
};