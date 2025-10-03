// Enhanced Error Boundary and Monitoring System
// Provides comprehensive error handling and recovery mechanisms

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  userAgent: string;
  url: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recovered: boolean;
  stackTrace?: string;
  componentStack?: string;
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: Error) => boolean;
  action: (error: Error, context: string) => Promise<boolean>;
  priority: number;
}

export class ErrorBoundaryService {
  private static errorReports: ErrorReport[] = [];
  private static recoveryStrategies: RecoveryStrategy[] = [];
  private static maxReports = 100;
  private static isMonitoring = false;

  // Initialize error monitoring
  static initialize(): void {
    if (this.isMonitoring) return;

    try {
      // Setup global error handlers
      window.addEventListener('error', this.handleGlobalError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      
      // Setup recovery strategies
      this.setupRecoveryStrategies();
      
      this.isMonitoring = true;
      console.log('Error boundary service initialized');
      
    } catch (error) {
      console.error('Failed to initialize error boundary service:', error);
    }
  }

  // Setup automated recovery strategies
  private static setupRecoveryStrategies(): void {
    this.recoveryStrategies = [
      {
        name: 'VAPI Connection Recovery',
        condition: (error) => error.message.includes('VAPI') || error.message.includes('connection'),
        action: async (error, context) => {
          try {
            console.log('Attempting VAPI connection recovery...');
            // Trigger VAPI reconnection
            const event = new CustomEvent('dental-ai-reconnect');
            window.dispatchEvent(event);
            return true;
          } catch (recoveryError) {
            console.error('VAPI recovery failed:', recoveryError);
            return false;
          }
        },
        priority: 1
      },
      {
        name: 'Component Reinitialization',
        condition: (error) => error.message.includes('component') || error.message.includes('render'),
        action: async (error, context) => {
          try {
            console.log('Attempting component reinitialization...');
            // Trigger component refresh
            const event = new CustomEvent('dental-ai-refresh', { detail: { context } });
            window.dispatchEvent(event);
            return true;
          } catch (recoveryError) {
            console.error('Component recovery failed:', recoveryError);
            return false;
          }
        },
        priority: 2
      },
      {
        name: 'Service Restart',
        condition: (error) => error.message.includes('service') || error.message.includes('initialize'),
        action: async (error, context) => {
          try {
            console.log('Attempting service restart...');
            // Reinitialize services
            const { DentalService } = await import('./dentalService');
            return DentalService.initialize();
          } catch (recoveryError) {
            console.error('Service restart failed:', recoveryError);
            return false;
          }
        },
        priority: 3
      },
      {
        name: 'Fallback Mode',
        condition: () => true, // Always applicable as last resort
        action: async (error, context) => {
          try {
            console.log('Activating fallback mode...');
            // Switch to basic functionality
            const event = new CustomEvent('dental-ai-fallback', { 
              detail: { error: error.message, context } 
            });
            window.dispatchEvent(event);
            return true;
          } catch (recoveryError) {
            console.error('Fallback activation failed:', recoveryError);
            return false;
          }
        },
        priority: 10
      }
    ];
  }

  // Handle global JavaScript errors
  private static handleGlobalError = (event: ErrorEvent): void => {
    try {
      const error = event.error || new Error(event.message);
      const context = `Global Error at ${event.filename}:${event.lineno}:${event.colno}`;
      
      this.reportError(error, context, 'high');
      
    } catch (handlingError) {
      console.error('Error in global error handler:', handlingError);
    }
  };

  // Handle unhandled promise rejections
  private static handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    try {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      const context = 'Unhandled Promise Rejection';
      
      this.reportError(error, context, 'high');
      
      // Prevent default browser behavior
      event.preventDefault();
      
    } catch (handlingError) {
      console.error('Error in rejection handler:', handlingError);
    }
  };

  // Report and handle errors with recovery attempts
  static async reportError(
    error: Error, 
    context: string, 
    severity: ErrorReport['severity'] = 'medium',
    userId?: string
  ): Promise<boolean> {
    try {
      // Create error report
      const report: ErrorReport = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        error,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId,
        severity,
        recovered: false,
        stackTrace: error.stack,
        componentStack: this.getComponentStack()
      };

      // Add to reports (with size limit)
      this.errorReports.push(report);
      if (this.errorReports.length > this.maxReports) {
        this.errorReports = this.errorReports.slice(-this.maxReports);
      }

      // Log error with appropriate level
      const logMethod = severity === 'critical' ? console.error : 
                       severity === 'high' ? console.error :
                       severity === 'medium' ? console.warn : console.log;
      
      logMethod(`[${severity.toUpperCase()}] ${context}:`, error);

      // Attempt recovery
      const recovered = await this.attemptRecovery(error, context);
      report.recovered = recovered;

      // Send to monitoring service (if available)
      this.sendToMonitoringService(report);

      return recovered;
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      return false;
    }
  }

  // Attempt automated error recovery
  private static async attemptRecovery(error: Error, context: string): Promise<boolean> {
    try {
      // Sort strategies by priority
      const sortedStrategies = this.recoveryStrategies.sort((a, b) => a.priority - b.priority);
      
      for (const strategy of sortedStrategies) {
        if (strategy.condition(error)) {
          console.log(`Attempting recovery strategy: ${strategy.name}`);
          
          try {
            const success = await strategy.action(error, context);
            if (success) {
              console.log(`Recovery successful with strategy: ${strategy.name}`);
              return true;
            }
          } catch (strategyError) {
            console.warn(`Recovery strategy ${strategy.name} failed:`, strategyError);
          }
        }
      }
      
      console.warn('All recovery strategies failed');
      return false;
      
    } catch (recoveryError) {
      console.error('Error in recovery process:', recoveryError);
      return false;
    }
  }

  // Get React component stack (if available)
  private static getComponentStack(): string | undefined {
    try {
      // Try to get React DevTools component stack
      if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (hook.getFiberRoots) {
          return 'React component stack available';
        }
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Send error reports to monitoring service
  private static sendToMonitoringService(report: ErrorReport): void {
    try {
      // Only send high and critical errors to external monitoring
      if (report.severity === 'high' || report.severity === 'critical') {
        // Integration point for external monitoring (Sentry, LogRocket, etc.)
        if (typeof window !== 'undefined' && (window as any).errorMonitoring) {
          (window as any).errorMonitoring.captureException(report);
        }
      }
      
      // Always log locally for debugging
      console.log('Error report created:', {
        id: report.id,
        severity: report.severity,
        context: report.context,
        recovered: report.recovered
      });
      
    } catch (monitoringError) {
      console.warn('Failed to send to monitoring service:', monitoringError);
    }
  }

  // Get error statistics and health metrics
  static getErrorStatistics(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    errorsLast24Hours: number;
    recoveryRate: number;
    mostCommonErrors: Array<{ context: string; count: number }>;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  } {
    try {
      const now = Date.now();
      const last24Hours = this.errorReports.filter(report => 
        now - report.timestamp.getTime() < 24 * 60 * 60 * 1000
      );

      const errorsBySeverity = this.errorReports.reduce((acc, report) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recoveredErrors = this.errorReports.filter(report => report.recovered);
      const recoveryRate = this.errorReports.length > 0 ? 
        (recoveredErrors.length / this.errorReports.length) * 100 : 100;

      const errorCounts = this.errorReports.reduce((acc, report) => {
        acc[report.context] = (acc[report.context] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonErrors = Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([context, count]) => ({ context, count }));

      // Determine system health
      const criticalErrors = last24Hours.filter(r => r.severity === 'critical').length;
      const highErrors = last24Hours.filter(r => r.severity === 'high').length;
      
      let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (criticalErrors > 0 || highErrors > 5) {
        systemHealth = 'critical';
      } else if (highErrors > 2 || last24Hours.length > 10) {
        systemHealth = 'degraded';
      }

      return {
        totalErrors: this.errorReports.length,
        errorsBySeverity,
        errorsLast24Hours: last24Hours.length,
        recoveryRate: Math.round(recoveryRate),
        mostCommonErrors,
        systemHealth
      };
      
    } catch (error) {
      console.error('Error generating statistics:', error);
      return {
        totalErrors: 0,
        errorsBySeverity: {},
        errorsLast24Hours: 0,
        recoveryRate: 0,
        mostCommonErrors: [],
        systemHealth: 'critical'
      };
    }
  }

  // Manual error recovery trigger
  static async triggerRecovery(errorId?: string): Promise<boolean> {
    try {
      if (errorId) {
        const report = this.errorReports.find(r => r.id === errorId);
        if (report && !report.recovered) {
          return await this.attemptRecovery(report.error, report.context);
        }
      } else {
        // Attempt recovery for all unrecovered errors
        const unrecoveredErrors = this.errorReports.filter(r => !r.recovered);
        let recoveryCount = 0;
        
        for (const report of unrecoveredErrors) {
          const recovered = await this.attemptRecovery(report.error, report.context);
          if (recovered) {
            report.recovered = true;
            recoveryCount++;
          }
        }
        
        console.log(`Recovery attempted for ${unrecoveredErrors.length} errors, ${recoveryCount} successful`);
        return recoveryCount > 0;
      }
      
      return false;
      
    } catch (error) {
      console.error('Manual recovery trigger failed:', error);
      return false;
    }
  }

  // Clear error reports
  static clearReports(): void {
    try {
      const clearedCount = this.errorReports.length;
      this.errorReports = [];
      console.log(`Cleared ${clearedCount} error reports`);
    } catch (error) {
      console.error('Failed to clear error reports:', error);
    }
  }

  // Get recent errors for debugging
  static getRecentErrors(count: number = 10): ErrorReport[] {
    try {
      return this.errorReports
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, count);
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  // Cleanup method
  static cleanup(): void {
    try {
      window.removeEventListener('error', this.handleGlobalError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      
      this.errorReports = [];
      this.recoveryStrategies = [];
      this.isMonitoring = false;
      
      console.log('Error boundary service cleaned up');
      
    } catch (error) {
      console.error('Error boundary cleanup failed:', error);
    }
  }
}

// Auto-initialize error boundary
if (typeof window !== 'undefined') {
  ErrorBoundaryService.initialize();
}