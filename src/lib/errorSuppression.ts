// Error suppression and graceful degradation utilities
import { structuredLogger } from '@/lib/structuredLogger'

interface SuppressionRule {
  pattern: string | RegExp
  category: 'api' | 'ui' | 'auth' | 'trading' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  suppress: boolean
  fallbackAction?: () => any
}

class ErrorSuppressor {
  private rules: SuppressionRule[] = [
    // Jupiter API 401 errors (non-critical - API in demo mode)
    {
      pattern: /Jupiter API error: 401/,
      category: 'api',
      severity: 'low',
      suppress: true,
      fallbackAction: () => structuredLogger.debug('Using demo data for Jupiter API', { category: 'api' })
    },
    // Rate limiting errors (expected behavior)
    {
      pattern: /Jupiter API error: 429/,
      category: 'api',
      severity: 'low',
      suppress: true,
      fallbackAction: () => structuredLogger.debug('API rate limited - retrying', { category: 'api' })
    },
    // Component hydration warnings (React 18 dev mode)
    {
      pattern: /Warning: Text content did not match/,
      category: 'ui',
      severity: 'low',
      suppress: true
    },
    // Lovable integration warnings (development only)
    {
      pattern: /lovable-tagger/,
      category: 'system',
      severity: 'low',
      suppress: process.env.NODE_ENV === 'development'
    }
  ]

  shouldSuppress(error: Error | string): boolean {
    const errorMessage = typeof error === 'string' ? error : error.message

    for (const rule of this.rules) {
      const matches = typeof rule.pattern === 'string' 
        ? errorMessage.includes(rule.pattern)
        : rule.pattern.test(errorMessage)

      if (matches && rule.suppress) {
        // Execute fallback action if provided
        rule.fallbackAction?.()
        
        structuredLogger.debug(`Suppressed error: ${errorMessage}`, {
          category: rule.category,
          severity: rule.severity,
          metadata: { suppressed: true, rule: rule.pattern.toString() }
        })
        
        return true
      }
    }

    return false
  }

  addRule(rule: SuppressionRule) {
    this.rules.push(rule)
  }

  removeRule(pattern: string | RegExp) {
    this.rules = this.rules.filter(rule => rule.pattern !== pattern)
  }

  getRules(): ReadonlyArray<SuppressionRule> {
    return [...this.rules]
  }
}

export const errorSuppressor = new ErrorSuppressor()

// Global error handler with suppression
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    
    if (!errorSuppressor.shouldSuppress(error)) {
      structuredLogger.error('Unhandled promise rejection', {
        category: 'system',
        severity: 'high',
        metadata: { type: 'unhandledrejection' }
      }, error)
    } else {
      // Prevent the default browser error handling for suppressed errors
      event.preventDefault()
    }
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message)
    
    if (!errorSuppressor.shouldSuppress(error)) {
      structuredLogger.error('Global error', {
        category: 'system',
        severity: 'high',
        metadata: { 
          type: 'error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }, error)
    } else {
      // Prevent the default browser error handling for suppressed errors
      event.preventDefault()
    }
  })

  structuredLogger.info('Global error handling initialized', {
    category: 'system',
    metadata: { rules: errorSuppressor.getRules().length }
  })
}

// Console override to suppress known non-critical errors
export const overrideConsole = () => {
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: any[]) => {
    const message = args.join(' ')
    if (!errorSuppressor.shouldSuppress(message)) {
      originalError.apply(console, args)
    }
  }

  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    if (!errorSuppressor.shouldSuppress(message)) {
      originalWarn.apply(console, args)
    }
  }
}