export interface TabConfig {
  views: string[];
  filters?: string[];
  defaultView?: string;
}

export const TAB_CONFIG: Record<string, TabConfig> = {
  'tools-templates': { 
    views: ['list', 'grid'], 
    filters: ['tools', 'templates'],
    defaultView: 'list'
  },
  'universities': { 
    views: ['grid', 'map'],
    defaultView: 'map'
  },
  'organizations': { 
    views: ['list', 'grid'],
    defaultView: 'list'
  },
  'learning': { 
    views: ['list', 'grid'],
    defaultView: 'grid'
  },
  'grants': { 
    views: ['list'],
    defaultView: 'list'
  },
  'blogs-bulletins': { 
    views: ['list', 'grid'],
    defaultView: 'grid'
  },
  'industry-news': { 
    views: ['list'],
    defaultView: 'list'
  },
  'tax-incentives': {
    views: ['list'],
    defaultView: 'list'
  }
};