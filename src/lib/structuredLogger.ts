// Structured logging system for better error tracking and debugging
import { logger } from '@/lib/environment'

export interface LogContext {
  userId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
  timestamp?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  category?: 'api' | 'ui' | 'auth' | 'trading' | 'system'
}

export interface StructuredLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  context: LogContext
  stack?: string
}

class StructuredLogger {
  private logHistory: StructuredLogEntry[] = []
  private maxHistorySize = 100

  private createLogEntry(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context: LogContext = {}
  ): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        severity: context.severity || 'medium'
      }
    }

    // Add to history
    this.logHistory.push(entry)
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }

    return entry
  }

  debug(message: string, context: LogContext = {}) {
    const entry = this.createLogEntry('debug', message, { ...context, category: context.category || 'system' })
    logger.debug(`[${entry.context.category?.toUpperCase()}] ${message}`, entry.context)
  }

  info(message: string, context: LogContext = {}) {
    const entry = this.createLogEntry('info', message, { ...context, category: context.category || 'system' })
    logger.info(`[${entry.context.category?.toUpperCase()}] ${message}`, entry.context)
  }

  warn(message: string, context: LogContext = {}) {
    const entry = this.createLogEntry('warn', message, { ...context, category: context.category || 'system', severity: 'medium' })
    logger.warn(`[${entry.context.category?.toUpperCase()}] ${message}`, entry.context)
  }

  error(message: string, context: LogContext = {}, error?: Error) {
    const entry = this.createLogEntry('error', message, { 
      ...context, 
      category: context.category || 'system',
      severity: context.severity || 'high'
    })
    
    if (error) {
      entry.stack = error.stack
    }

    logger.error(`[${entry.context.category?.toUpperCase()}] ${message}`, entry.context, error)
  }

  // API-specific logging
  apiRequest(endpoint: string, method: string, context: LogContext = {}) {
    this.debug(`API Request: ${method} ${endpoint}`, {
      ...context,
      category: 'api',
      action: 'request',
      metadata: { endpoint, method }
    })
  }

  apiResponse(endpoint: string, status: number, context: LogContext = {}) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this[level](`API Response: ${status} for ${endpoint}`, {
      ...context,
      category: 'api',
      action: 'response',
      metadata: { endpoint, status }
    })
  }

  apiError(endpoint: string, error: Error, context: LogContext = {}) {
    this.error(`API Error for ${endpoint}: ${error.message}`, {
      ...context,
      category: 'api',
      action: 'error',
      severity: 'high',
      metadata: { endpoint }
    }, error)
  }

  // Component-specific logging
  componentMount(componentName: string, context: LogContext = {}) {
    this.debug(`Component mounted: ${componentName}`, {
      ...context,
      category: 'ui',
      component: componentName,
      action: 'mount'
    })
  }

  componentError(componentName: string, error: Error, context: LogContext = {}) {
    this.error(`Component error in ${componentName}: ${error.message}`, {
      ...context,
      category: 'ui',
      component: componentName,
      action: 'error',
      severity: 'high'
    }, error)
  }

  // Trading-specific logging
  tradingAction(action: string, context: LogContext = {}) {
    this.info(`Trading action: ${action}`, {
      ...context,
      category: 'trading',
      action,
      severity: 'medium'
    })
  }

  tradingError(action: string, error: Error, context: LogContext = {}) {
    this.error(`Trading error during ${action}: ${error.message}`, {
      ...context,
      category: 'trading',
      action,
      severity: 'critical'
    }, error)
  }

  // Performance logging
  performance(metric: string, value: number, unit: string = 'ms', context: LogContext = {}) {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      category: 'system',
      action: 'performance',
      metadata: { metric, value, unit }
    })
  }

  // Get log history for debugging
  getHistory(level?: 'debug' | 'info' | 'warn' | 'error', category?: string): StructuredLogEntry[] {
    return this.logHistory.filter(entry => {
      const levelMatch = !level || entry.level === level
      const categoryMatch = !category || entry.context.category === category
      return levelMatch && categoryMatch
    })
  }

  // Clear log history
  clearHistory() {
    this.logHistory = []
  }

  // Export logs for support
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2)
  }
}

export const structuredLogger = new StructuredLogger()

// Convenience functions for common use cases
export const logApiCall = (endpoint: string, method: string, context?: LogContext) => 
  structuredLogger.apiRequest(endpoint, method, context)

export const logApiResponse = (endpoint: string, status: number, context?: LogContext) => 
  structuredLogger.apiResponse(endpoint, status, context)

export const logApiError = (endpoint: string, error: Error, context?: LogContext) => 
  structuredLogger.apiError(endpoint, error, context)

export const logComponentMount = (componentName: string, context?: LogContext) => 
  structuredLogger.componentMount(componentName, context)

export const logComponentError = (componentName: string, error: Error, context?: LogContext) => 
  structuredLogger.componentError(componentName, error, context)

export const logTradingAction = (action: string, context?: LogContext) => 
  structuredLogger.tradingAction(action, context)

export const logTradingError = (action: string, error: Error, context?: LogContext) => 
  structuredLogger.tradingError(action, error, context)

export const logPerformance = (metric: string, value: number, unit?: string, context?: LogContext) => 
  structuredLogger.performance(metric, value, unit, context)