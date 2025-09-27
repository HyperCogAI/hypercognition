// Centralized API error handling and recovery system
import { toast } from "@/hooks/use-toast"

export interface ApiError {
  message: string
  status?: number
  code?: string
  endpoint?: string
  timestamp: Date
  retryable: boolean
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

class ApiErrorHandler {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }

  private errorHistory: ApiError[] = []
  private maxHistorySize = 50

  /**
   * Handle API errors with automatic retry logic and user notifications
   */
  async handleApiError(
    error: any,
    endpoint: string,
    retryFn?: () => Promise<any>,
    config?: Partial<RetryConfig>
  ): Promise<any> {
    const apiError = this.createApiError(error, endpoint)
    this.logError(apiError)

    // Check if error is retryable
    if (apiError.retryable && retryFn) {
      return this.retryWithBackoff(retryFn, config)
    }

    // Show user-friendly error message
    this.showUserError(apiError)
    throw apiError
  }

  /**
   * Create standardized API error from various error types
   */
  private createApiError(error: any, endpoint: string): ApiError {
    let message = 'An unexpected error occurred'
    let status: number | undefined
    let code: string | undefined
    let retryable = false

    if (error instanceof Response) {
      status = error.status
      message = this.getStatusMessage(status)
      retryable = this.isRetryableStatus(status)
    } else if (error instanceof Error) {
      message = error.message
      // Network errors are usually retryable
      retryable = error.name === 'TypeError' || error.message.includes('fetch')
    } else if (typeof error === 'string') {
      message = error
    } else if (error?.message) {
      message = error.message
      status = error.status
      code = error.code
    }

    return {
      message,
      status,
      code,
      endpoint,
      timestamp: new Date(),
      retryable
    }
  }

  /**
   * Retry function with exponential backoff
   */
  private async retryWithBackoff(
    fn: () => Promise<any>,
    config?: Partial<RetryConfig>
  ): Promise<any> {
    const retryConfig = { ...this.defaultRetryConfig, ...config }
    let lastError: any

    for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (attempt === retryConfig.maxRetries) {
          break
        }

        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        )

        console.warn(`API retry attempt ${attempt}/${retryConfig.maxRetries} failed, retrying in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Determine if HTTP status is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504  // Gateway Timeout
    ].includes(status)
  }

  /**
   * Get user-friendly message for HTTP status codes
   */
  private getStatusMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You don\'t have permission for this action.',
      404: 'Resource not found.',
      408: 'Request timed out. Please try again.',
      429: 'Too many requests. Please wait a moment.',
      500: 'Server error. We\'re working to fix this.',
      502: 'Service temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Request timed out. Please try again.'
    }

    return messages[status] || `Unexpected error (${status})`
  }

  /**
   * Show appropriate user notification
   */
  private showUserError(error: ApiError) {
    const isNetworkError = !error.status
    const isServerError = error.status && error.status >= 500

    if (isNetworkError) {
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      })
    } else if (isServerError) {
      toast({
        title: "Service Temporarily Unavailable",
        description: "We're experiencing technical difficulties. Please try again in a few minutes.",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  /**
   * Log error to history and external services
   */
  private logError(error: ApiError) {
    // Add to local history
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop()
    }

    // Log to console
    console.error('API Error:', {
      endpoint: error.endpoint,
      status: error.status,
      message: error.message,
      timestamp: error.timestamp
    })

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error)
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   */
  private async sendToMonitoring(error: ApiError) {
    try {
      // This would integrate with services like Sentry, DataDog, etc.
      // For now, we'll just store it locally
      const errorData = {
        ...error,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: error.timestamp.toISOString()
      }
      
      localStorage.setItem('api_errors', JSON.stringify([
        ...this.getStoredErrors().slice(0, 19), // Keep last 20 errors
        errorData
      ]))
    } catch {
      // Silently fail if we can't store the error
    }
  }

  /**
   * Get recent error history
   */
  getErrorHistory(): ApiError[] {
    return [...this.errorHistory]
  }

  /**
   * Get stored errors from localStorage
   */
  private getStoredErrors(): any[] {
    try {
      return JSON.parse(localStorage.getItem('api_errors') || '[]')
    } catch {
      return []
    }
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = []
    localStorage.removeItem('api_errors')
  }

  /**
   * Check if endpoint is experiencing issues
   */
  isEndpointHealthy(endpoint: string): boolean {
    const recentErrors = this.errorHistory
      .filter(error => error.endpoint === endpoint)
      .filter(error => Date.now() - error.timestamp.getTime() < 300000) // Last 5 minutes

    return recentErrors.length < 3 // Healthy if less than 3 errors in 5 minutes
  }
}

export const apiErrorHandler = new ApiErrorHandler()

/**
 * Enhanced fetch wrapper with automatic error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  const fetchFn = async () => {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw response
    }
    
    return response.json()
  }

  try {
    return await fetchFn()
  } catch (error) {
    return await apiErrorHandler.handleApiError(error, url, fetchFn, retryConfig)
  }
}