import { useEffect, memo } from 'react';

interface AccessibilityProviderProps {
  children: React.ReactNode;
  enableReporting?: boolean;
}

const AccessibilityProvider = memo(function AccessibilityProvider({ 
  children, 
  enableReporting = process.env.NODE_ENV === 'development' 
}: AccessibilityProviderProps) {
  useEffect(() => {
    // Accessibility improvements without axe-core for now
    if (enableReporting && process.env.NODE_ENV === 'development') {
      console.log('🔍 Accessibility Provider initialized - manual WCAG checks enabled');
      
      // Check for common accessibility issues
      setTimeout(() => {
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
          console.warn(`⚠️ Found ${images.length} images without alt text`);
        }
        
        const buttons = document.querySelectorAll('button:not([aria-label]):not([title]):empty');
        if (buttons.length > 0) {
          console.warn(`⚠️ Found ${buttons.length} buttons without accessible labels`);
        }
      }, 2000);
    }
  }, [enableReporting]);

  return <>{children}</>;
});

// Accessibility utilities
export const a11yUtils = {
  // Skip navigation link
  addSkipLink: () => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ugga-primary focus:text-white focus:rounded-md focus:shadow-lg';
    skipLink.setAttribute('data-skip-link', 'true');
    
    // Insert at the beginning of body
    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  // Announce screen reader messages
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Focus management for modals
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Check color contrast
  checkContrast: (backgroundColor: string, textColor: string): { ratio: number; passes: boolean } => {
    // Simplified contrast checker - would use full WCAG algorithm in production
    const getLuminance = (color: string) => {
      // Simple approximation - real implementation would parse hex/rgb properly
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(textColor);
    const ratio = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                  (Math.min(bgLuminance, textLuminance) + 0.05);
    
    return {
      ratio,
      passes: ratio >= 4.5 // WCAG AA standard
    };
  }
};

// Hook for accessibility features
export const useAccessibility = () => {
  useEffect(() => {
    // Add skip navigation link
    if (!document.querySelector('[data-skip-link]')) {
      a11yUtils.addSkipLink();
    }

    // Add main content landmark if not present
    const mainContent = document.querySelector('#main-content');
    if (!mainContent) {
      const main = document.querySelector('main') || document.querySelector('[role="main"]');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    }

    // Ensure all images have alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach((img) => {
      img.setAttribute('alt', 'Image'); // Fallback alt text
      console.warn('Image without alt text detected:', img);
    });

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (level > lastLevel + 1) {
        console.warn('Heading hierarchy skip detected:', heading);
      }
      lastLevel = level;
    });
  }, []);

  return a11yUtils;
};

export default AccessibilityProvider;