// Centralized error handling utilities
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/environment'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  additionalData?: Record<string, any>
}

export class AppError extends Error {
  public readonly code: string
  public readonly context: ErrorContext
  public readonly isUserFacing: boolean
  public readonly severity: 'low' | 'medium' | 'high' | 'critical'

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context: ErrorContext = {},
    isUserFacing: boolean = true,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
    this.isUserFacing = isUserFacing
    this.severity = severity
  }
}

export const createError = {
  network: (message: string, context?: ErrorContext) => 
    new AppError(message, 'NETWORK_ERROR', context, true, 'medium'),
  
  validation: (message: string, context?: ErrorContext) => 
    new AppError(message, 'VALIDATION_ERROR', context, true, 'low'),
  
  auth: (message: string, context?: ErrorContext) => 
    new AppError(message, 'AUTH_ERROR', context, true, 'high'),
  
  database: (message: string, context?: ErrorContext) => 
    new AppError(message, 'DATABASE_ERROR', context, false, 'high'),
  
  external: (message: string, context?: ErrorContext) => 
    new AppError(message, 'EXTERNAL_API_ERROR', context, true, 'medium'),
  
  trading: (message: string, context?: ErrorContext) => 
    new AppError(message, 'TRADING_ERROR', context, true, 'high'),
  
  permission: (message: string, context?: ErrorContext) => 
    new AppError(message, 'PERMISSION_ERROR', context, true, 'medium')
}

export const handleError = (error: unknown, context: ErrorContext = {}) => {
  let appError: AppError

  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Error) {
    appError = new AppError(
      error.message,
      'UNKNOWN_ERROR',
      context,
      true,
      'medium'
    )
  } else {
    appError = new AppError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      context,
      true,
      'medium'
    )
  }

  // Log error
  logger.error('App Error:', {
    message: appError.message,
    code: appError.code,
    context: appError.context,
    severity: appError.severity,
    stack: appError.stack
  })

  // Show user-facing errors in toast
  if (appError.isUserFacing) {
    const toastConfig = {
      title: getErrorTitle(appError.code),
      description: appError.message,
      variant: getToastVariant(appError.severity)
    }

    toast(toastConfig)
  }

  // Report critical errors to monitoring service
  if (appError.severity === 'critical') {
    // In a real app, this would send to an error monitoring service
    console.error('CRITICAL ERROR:', appError)
  }

  return appError
}

const getErrorTitle = (code: string): string => {
  const titles: Record<string, string> = {
    NETWORK_ERROR: 'Connection Problem',
    VALIDATION_ERROR: 'Invalid Input',
    AUTH_ERROR: 'Authentication Required',
    DATABASE_ERROR: 'Data Access Error',
    EXTERNAL_API_ERROR: 'Service Unavailable',
    TRADING_ERROR: 'Trading Error',
    PERMISSION_ERROR: 'Access Denied',
    UNKNOWN_ERROR: 'Unexpected Error'
  }
  return titles[code] || 'Error'
}

const getToastVariant = (severity: string): "default" | "destructive" => {
  return severity === 'high' || severity === 'critical' ? 'destructive' : 'default'
}

// Async error wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T | null> => {
  try {
    return await operation()
  } catch (error) {
    handleError(error, context)
    return null
  }
}

// React hook for error handling
import { useState, useCallback } from 'react'

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([])

  const captureError = useCallback((error: unknown, context: ErrorContext = {}) => {
    const appError = handleError(error, context)
    setErrors(prev => [...prev.slice(-9), appError]) // Keep last 10 errors
    return appError
  }, [])

  const clearErrors = useCallback(() => setErrors([]), [])

  const hasErrors = errors.length > 0
  const lastError = errors[errors.length - 1]

  return {
    captureError,
    clearErrors,
    errors,
    hasErrors,
    lastError
  }
}

// Error boundary hook
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => setError(null), [])

  const captureError = useCallback((error: Error) => {
    setError(error)
    handleError(error, { component: 'ErrorBoundary' })
  }, [])

  return { error, resetError, captureError }
}