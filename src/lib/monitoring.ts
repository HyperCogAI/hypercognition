// Error tracking and monitoring system
interface ErrorContext {
  userId?: string
  userAgent?: string
  url?: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  extra?: Record<string, any>
}

interface ErrorReport {
  id: string
  message: string
  stack?: string
  context: ErrorContext
  fingerprint: string
}

class ErrorTracker {
  private errors: ErrorReport[] = []
  private maxErrors = 500
  private listeners: ((error: ErrorReport) => void)[] = []
  
  constructor() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        severity: 'high',
        tags: ['javascript'],
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        severity: 'high',
        tags: ['promise-rejection']
      })
    })
  }
  
  captureError(error: Error | string, context: Partial<ErrorContext> = {}) {
    const errorMessage = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'object' ? error.stack : undefined
    
    const report: ErrorReport = {
      id: this.generateId(),
      message: errorMessage,
      stack,
      context: {
        timestamp: new Date(),
        severity: 'medium',
        userId: this.getCurrentUserId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      fingerprint: this.generateFingerprint(errorMessage, stack)
    }
    
    this.errors.unshift(report)
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(report))
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', report)
    }
    
    return report.id
  }
  
  addListener(listener: (error: ErrorReport) => void) {
    this.listeners.push(listener)
  }
  
  removeListener(listener: (error: ErrorReport) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
  
  getErrors(filters?: {
    severity?: string
    userId?: string
    since?: Date
    tags?: string[]
  }): ErrorReport[] {
    let filtered = this.errors
    
    if (filters) {
      if (filters.severity) {
        filtered = filtered.filter(error => error.context.severity === filters.severity)
      }
      if (filters.userId) {
        filtered = filtered.filter(error => error.context.userId === filters.userId)
      }
      if (filters.since) {
        filtered = filtered.filter(error => error.context.timestamp >= filters.since!)
      }
      if (filters.tags) {
        filtered = filtered.filter(error => 
          filters.tags!.some(tag => error.context.tags?.includes(tag))
        )
      }
    }
    
    return filtered
  }
  
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private generateFingerprint(message: string, stack?: string): string {
    const content = `${message}${stack || ''}`
    return btoa(content).slice(0, 16)
  }
  
  private getCurrentUserId(): string | undefined {
    // This would integrate with your auth system
    try {
      const authState = localStorage.getItem('auth_user')
      return authState ? JSON.parse(authState).id : undefined
    } catch {
      return undefined
    }
  }
}

export const errorTracker = new ErrorTracker()

// Performance monitoring
interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000
  
  constructor() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, {
          type: 'navigation'
        })
        
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, {
          type: 'navigation'
        })
        
        this.recordMetric('first_paint', performance.getEntriesByName('first-paint')[0]?.startTime || 0, {
          type: 'paint'
        })
        
        this.recordMetric('first_contentful_paint', performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0, {
          type: 'paint'
        })
      }, 0)
    })
  }
  
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags
    }
    
    this.metrics.unshift(metric)
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics)
    }
    
    console.log(`Performance metric: ${name} = ${value}ms`, tags)
  }
  
  startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const end = performance.now()
      this.recordMetric(name, end - start, { type: 'timer' })
    }
  }
  
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name)
    }
    return this.metrics
  }
  
  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0
    return metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Health checks
class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map()
  
  addCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn)
  }
  
  async runCheck(name: string): Promise<boolean> {
    const checkFn = this.checks.get(name)
    if (!checkFn) {
      throw new Error(`Health check '${name}' not found`)
    }
    
    try {
      return await checkFn()
    } catch (error) {
      errorTracker.captureError(error as Error, {
        severity: 'medium',
        tags: ['health-check'],
        extra: { checkName: name }
      })
      return false
    }
  }
  
  async runAllChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [name] of this.checks) {
      results[name] = await this.runCheck(name)
    }
    
    return results
  }
}

export const healthChecker = new HealthChecker()

// Default health checks
healthChecker.addCheck('database', async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client')
    const { error } = await supabase.from('agents').select('id').limit(1)
    return !error
  } catch {
    return false
  }
})

healthChecker.addCheck('local_storage', async () => {
  try {
    const testKey = 'health_check_test'
    localStorage.setItem(testKey, 'test')
    const value = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    return value === 'test'
  } catch {
    return false
  }
})

// Monitoring hooks
export const useErrorTracking = () => {
  const captureError = (error: Error | string, context?: Partial<ErrorContext>) => {
    return errorTracker.captureError(error, context)
  }
  
  const captureException = (error: Error, context?: Partial<ErrorContext>) => {
    return errorTracker.captureError(error, {
      severity: 'high',
      ...context
    })
  }
  
  return { captureError, captureException }
}

export const usePerformanceTracking = () => {
  const recordMetric = (name: string, value: number, tags?: Record<string, string>) => {
    performanceMonitor.recordMetric(name, value, tags)
  }
  
  const startTimer = (name: string) => {
    return performanceMonitor.startTimer(name)
  }
  
  return { recordMetric, startTimer }
}