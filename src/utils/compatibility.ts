// Dental Website Integration Compatibility Layer
// Ensures seamless integration with any dental practice website

export interface DentalWebsiteConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  branding: {
    clinicName: string;
    logo?: string;
    tagline?: string;
  };
  integration: {
    containerSelector: string;
    position: 'fixed' | 'relative' | 'absolute';
    zIndex: number;
  };
  features: {
    voiceWidget: boolean;
    dashboard: boolean;
    emergencyTriage: boolean;
    recallSystem: boolean;
  };
}

export class CompatibilityLayer {
  private static config: DentalWebsiteConfig | null = null;
  private static originalStyles: Map<string, string> = new Map();
  private static isIntegrated = false;

  // Initialize compatibility layer with website detection
  static initialize(customConfig?: Partial<DentalWebsiteConfig>): boolean {
    try {
      // Auto-detect existing dental website theme
      const detectedTheme = this.detectWebsiteTheme();
      
      // Merge detected theme with custom config
      this.config = {
        theme: {
          primaryColor: detectedTheme.primaryColor || '#89CFF0',
          secondaryColor: detectedTheme.secondaryColor || '#F0FFFF',
          fontFamily: detectedTheme.fontFamily || 'system-ui, -apple-system, sans-serif',
          borderRadius: detectedTheme.borderRadius || '12px',
          ...customConfig?.theme
        },
        branding: {
          clinicName: detectedTheme.clinicName || 'Elite Dental',
          logo: detectedTheme.logo,
          tagline: detectedTheme.tagline,
          ...customConfig?.branding
        },
        integration: {
          containerSelector: '#dental-ai-widget',
          position: 'fixed',
          zIndex: 9999,
          ...customConfig?.integration
        },
        features: {
          voiceWidget: true,
          dashboard: true,
          emergencyTriage: true,
          recallSystem: true,
          ...customConfig?.features
        }
      };

      this.applyCompatibilityStyles();
      this.setupEventListeners();
      this.isIntegrated = true;
      
      console.log('Dental website compatibility layer initialized:', this.config);
      return true;
      
    } catch (error) {
      console.error('Failed to initialize compatibility layer:', error);
      return false;
    }
  }

  // Auto-detect existing website theme and branding
  private static detectWebsiteTheme(): Partial<DentalWebsiteConfig['theme'] & DentalWebsiteConfig['branding']> {
    try {
      const detected: any = {};
      
      // Detect primary color from CSS variables or computed styles
      const rootStyles = getComputedStyle(document.documentElement);
      const primaryColorCandidates = [
        rootStyles.getPropertyValue('--primary-color'),
        rootStyles.getPropertyValue('--brand-color'),
        rootStyles.getPropertyValue('--main-color'),
        rootStyles.getPropertyValue('--accent-color')
      ].filter(Boolean);
      
      if (primaryColorCandidates.length > 0) {
        detected.primaryColor = primaryColorCandidates[0].trim();
      }

      // Detect font family
      const bodyFont = getComputedStyle(document.body).fontFamily;
      if (bodyFont && bodyFont !== 'serif') {
        detected.fontFamily = bodyFont;
      }

      // Detect clinic name from title, h1, or meta tags
      const titleElement = document.querySelector('title');
      const h1Element = document.querySelector('h1');
      const metaTitle = document.querySelector('meta[property="og:title"]');
      
      const clinicNameCandidates = [
        titleElement?.textContent,
        h1Element?.textContent,
        metaTitle?.getAttribute('content')
      ].filter(Boolean);
      
      if (clinicNameCandidates.length > 0) {
        detected.clinicName = clinicNameCandidates[0]?.trim();
      }

      // Detect logo
      const logoSelectors = [
        'img[alt*="logo" i]',
        '.logo img',
        '#logo img',
        'img[src*="logo" i]'
      ];
      
      for (const selector of logoSelectors) {
        const logoElement = document.querySelector(selector) as HTMLImageElement;
        if (logoElement?.src) {
          detected.logo = logoElement.src;
          break;
        }
      }

      // Detect border radius from existing elements
      const cardElements = document.querySelectorAll('.card, .btn, button, .rounded');
      if (cardElements.length > 0) {
        const borderRadius = getComputedStyle(cardElements[0]).borderRadius;
        if (borderRadius && borderRadius !== '0px') {
          detected.borderRadius = borderRadius;
        }
      }

      return detected;
      
    } catch (error) {
      console.warn('Theme detection failed:', error);
      return {};
    }
  }

  // Apply compatibility styles to match existing website
  private static applyCompatibilityStyles(): void {
    try {
      if (!this.config) return;

      // Create or update CSS custom properties
      const styleId = 'dental-ai-compatibility-styles';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      const css = `
        :root {
          --dental-ai-primary: ${this.config.theme.primaryColor};
          --dental-ai-secondary: ${this.config.theme.secondaryColor};
          --dental-ai-font: ${this.config.theme.fontFamily};
          --dental-ai-radius: ${this.config.theme.borderRadius};
        }
        
        .dental-ai-widget {
          font-family: var(--dental-ai-font);
          --tw-gradient-from: var(--dental-ai-primary);
          --tw-gradient-to: var(--dental-ai-secondary);
        }
        
        .dental-ai-widget .bg-primary {
          background-color: var(--dental-ai-primary);
        }
        
        .dental-ai-widget .text-primary {
          color: var(--dental-ai-primary);
        }
        
        .dental-ai-widget .border-primary {
          border-color: var(--dental-ai-primary);
        }
        
        .dental-ai-widget .rounded-custom {
          border-radius: var(--dental-ai-radius);
        }
        
        /* Ensure compatibility with existing CSS frameworks */
        .dental-ai-widget * {
          box-sizing: border-box;
        }
        
        /* Prevent conflicts with existing styles */
        .dental-ai-widget {
          all: initial;
          font-family: var(--dental-ai-font);
        }
        
        /* Responsive compatibility */
        @media (max-width: 768px) {
          .dental-ai-widget {
            font-size: 14px;
          }
        }
        
        /* High contrast mode compatibility */
        @media (prefers-contrast: high) {
          .dental-ai-widget {
            --dental-ai-primary: #000000;
            --dental-ai-secondary: #ffffff;
          }
        }
        
        /* Reduced motion compatibility */
        @media (prefers-reduced-motion: reduce) {
          .dental-ai-widget * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;

      styleElement.textContent = css;
      
    } catch (error) {
      console.error('Failed to apply compatibility styles:', error);
    }
  }

  // Setup event listeners for seamless integration
  private static setupEventListeners(): void {
    try {
      // Listen for theme changes in the parent website
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
            this.updateThemeFromParent();
          }
        });
      });

      // Observe document and body for theme changes
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      // Listen for window resize to maintain responsive behavior
      window.addEventListener('resize', this.handleResize);
      
      // Listen for focus changes to maintain accessibility
      document.addEventListener('focusin', this.handleFocusChange);
      
    } catch (error) {
      console.error('Failed to setup event listeners:', error);
    }
  }

  // Update theme when parent website changes
  private static updateThemeFromParent(): void {
    try {
      if (!this.isIntegrated) return;
      
      const newTheme = this.detectWebsiteTheme();
      if (this.config && newTheme) {
        // Update config with new theme
        this.config.theme = { ...this.config.theme, ...newTheme };
        this.applyCompatibilityStyles();
        
        console.log('Theme updated from parent website');
      }
    } catch (error) {
      console.warn('Failed to update theme from parent:', error);
    }
  }

  // Handle responsive behavior
  private static handleResize = (): void => {
    try {
      // Trigger re-layout of dental AI components
      const event = new CustomEvent('dental-ai-resize', {
        detail: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Resize handling error:', error);
    }
  };

  // Handle focus changes for accessibility
  private static handleFocusChange = (e: FocusEvent): void => {
    try {
      const target = e.target as HTMLElement;
      if (target?.closest('.dental-ai-widget')) {
        // Ensure proper focus management within widget
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.warn('Focus handling error:', error);
    }
  };

  // Generate integration code for dental websites
  static generateIntegrationCode(config?: Partial<DentalWebsiteConfig>): string {
    const finalConfig = { ...this.config, ...config };
    
    return `
<!-- Elite Dental AI Integration -->
<div id="dental-ai-widget" class="dental-ai-widget"></div>

<script>
  // Configuration
  window.dentalAIConfig = ${JSON.stringify(finalConfig, null, 2)};
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDentalAI);
  } else {
    initializeDentalAI();
  }
  
  function initializeDentalAI() {
    // Load Elite Dental AI
    const script = document.createElement('script');
    script.src = 'https://cdn.elitedental.ai/widget.js';
    script.onload = () => {
      if (window.EliteDentalAI) {
        window.EliteDentalAI.init(window.dentalAIConfig);
      }
    };
    document.head.appendChild(script);
  }
</script>

<style>
  /* Compatibility styles */
  #dental-ai-widget {
    position: ${finalConfig?.integration?.position || 'fixed'};
    z-index: ${finalConfig?.integration?.zIndex || 9999};
    font-family: ${finalConfig?.theme?.fontFamily || 'system-ui, sans-serif'};
  }
</style>
    `.trim();
  }

  // Cleanup method for proper removal
  static cleanup(): void {
    try {
      // Remove event listeners
      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('focusin', this.handleFocusChange);
      
      // Remove compatibility styles
      const styleElement = document.getElementById('dental-ai-compatibility-styles');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Reset state
      this.config = null;
      this.isIntegrated = false;
      this.originalStyles.clear();
      
      console.log('Compatibility layer cleaned up');
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Get current configuration
  static getConfig(): DentalWebsiteConfig | null {
    return this.config;
  }

  // Check if properly integrated
  static isIntegrated(): boolean {
    return this.isIntegrated && this.config !== null;
  }
}

// Auto-initialize compatibility layer
if (typeof window !== 'undefined') {
  CompatibilityLayer.initialize();
}