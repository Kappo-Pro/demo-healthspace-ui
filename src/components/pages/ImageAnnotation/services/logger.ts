/**
 * Secure logging service for ImageAnnotation component
 * Provides structured logging with security considerations
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  component?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  maxLogSize: number;
  sensitiveFields: string[];
}

class SecureLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      maxLogSize: 1000,
      sensitiveFields: ['password', 'token', 'credentials', 'email', 'ssn', 'phone'],
      ...config
    };
    
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.config.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: unknown = {};
    for (const [key, value] of Object.entries(data)) {
      if (this.config.sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context, component } = entry;
    const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
    const componentStr = component ? ` | Component: ${component}` : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${componentStr}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, component?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      context: context ? this.sanitizeData(context) : undefined,
      component
    };

    // Add to in-memory log storage
    this.logs.push(entry);
    
    // Limit log size to prevent memory leaks
    if (this.logs.length > this.config.maxLogSize) {
      this.logs.shift();
    }

    // Console logging (development only)
    if (this.config.enableConsole) {
      const formattedMessage = this.formatLogEntry(entry);
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          break;
        case LogLevel.DEBUG:
          break;
      }
    }

    // Remote logging (production only)
    if (this.config.enableRemote && level === LogLevel.ERROR) {
      this.sendToRemoteService(entry);
    }
  }

  private async sendToRemoteService(entry: LogEntry): Promise<void> {
    try {
      // In a real implementation, this would send to a logging service
      // Example: Sentry, LogRocket, DataDog, etc.
      
      // For now, we'll just store it locally or send to a mock endpoint
      if (process.env.REACT_APP_LOGGING_ENDPOINT) {
        await fetch(process.env.REACT_APP_LOGGING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        });
      }
    } catch (error) {
      // Silently fail - don't log errors about logging
      // This prevents infinite loops and ensures the app doesn't break
    }
  }

  // Public logging methods
  public error(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.ERROR, message, context, component);
  }

  public warn(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.WARN, message, context, component);
  }

  public info(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.INFO, message, context, component);
  }

  public debug(message: string, context?: Record<string, unknown>, component?: string): void {
    this.log(LogLevel.DEBUG, message, context, component);
  }

  // Specialized methods for annotation operations
  public logToolSelection(tool: string, userId?: string): void {
    this.info('Tool selected', { tool, userId }, 'Toolbar');
  }

  public logCanvasOperation(operation: string, details?: Record<string, unknown>): void {
    this.debug('Canvas operation', { operation, ...details }, 'Canvas');
  }

  public logValidationError(field: string, error: string, value?: unknown): void {
    this.warn('Validation error', { field, error, value: this.sanitizeData(value) }, 'Validation');
  }

  public logPerformanceMetric(metric: string, value: number, unit: string): void {
    this.info('Performance metric', { metric, value, unit }, 'Performance');
  }

  public logUserAction(action: string, details?: Record<string, unknown>): void {
    this.info('User action', { action, ...details }, 'UserInteraction');
  }

  public logSecurityEvent(event: string, details?: Record<string, unknown>): void {
    this.error('Security event', { event, ...details }, 'Security');
  }

  // Utility methods
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogSummary(): Record<LogLevel, number> {
    const summary: Record<LogLevel, number> = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0
    };

    this.logs.forEach(log => {
      summary[log.level]++;
    });

    return summary;
  }

  public exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      logs: this.logs
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Create singleton instance
export const logger = new SecureLogger();

// Export for testing purposes
export { SecureLogger };

// React hook for component-level logging
export function useLogger(componentName: string) {
  const componentLogger = {
    error: (message: string, context?: Record<string, unknown>) => 
      logger.error(message, context, componentName),
    warn: (message: string, context?: Record<string, unknown>) => 
      logger.warn(message, context, componentName),
    info: (message: string, context?: Record<string, unknown>) => 
      logger.info(message, context, componentName),
    debug: (message: string, context?: Record<string, unknown>) => 
      logger.debug(message, context, componentName),
    logUserAction: (action: string, details?: Record<string, unknown>) =>
      logger.logUserAction(action, { ...details, component: componentName }),
    logValidationError: (field: string, error: string, value?: unknown) =>
      logger.logValidationError(field, error, value),
    logCanvasOperation: (operation: string, details?: Record<string, unknown>) =>
      logger.logCanvasOperation(operation, details)
  };

  return componentLogger;
}