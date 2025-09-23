import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  errorInfo?: {
    componentStack?: string
  }
  variant?: 'page' | 'component' | 'inline'
  showDetails?: boolean
}

export function ErrorFallback({ 
  error, 
  resetError, 
  errorInfo,
  variant = 'component',
  showDetails = false 
}: ErrorFallbackProps) {
  const [showFullError, setShowFullError] = React.useState(false)

  const goHome = () => {
    window.location.href = '/'
  }

  const reloadPage = () => {
    window.location.reload()
  }

  const getErrorMessage = () => {
    if (!error) return 'An unexpected error occurred'
    
    // User-friendly error messages
    const friendlyMessages: Record<string, string> = {
      'NetworkError': 'Connection problem. Please check your internet and try again.',
      'ChunkLoadError': 'Failed to load application resources. Please refresh the page.',
      'TypeError': 'Application error. Please try refreshing the page.',
      'ReferenceError': 'Application error. Please try refreshing the page.',
      'SyntaxError': 'Application error. Please try refreshing the page.'
    }

    const errorType = error.constructor.name
    return friendlyMessages[errorType] || error.message || 'An unexpected error occurred'
  }

  const getErrorSeverity = () => {
    if (!error) return 'medium'
    
    const criticalErrors = ['ChunkLoadError', 'NetworkError']
    const warningErrors = ['TypeError', 'ReferenceError']
    
    if (criticalErrors.includes(error.constructor.name)) return 'high'
    if (warningErrors.includes(error.constructor.name)) return 'medium'
    return 'low'
  }

  const severity = getErrorSeverity()
  const errorMessage = getErrorMessage()

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-sm text-destructive">{errorMessage}</span>
        {resetError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetError}
            className="ml-auto h-auto p-1 text-destructive hover:text-destructive"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <div className="flex justify-center mt-2">
              <Badge variant={severity === 'high' ? 'destructive' : severity === 'medium' ? 'secondary' : 'outline'}>
                {severity === 'high' ? 'Critical Error' : severity === 'medium' ? 'Application Error' : 'Minor Error'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              {errorMessage}
            </p>

            {showDetails && error && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullError(!showFullError)}
                  className="w-full"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  {showFullError ? 'Hide' : 'Show'} Technical Details
                </Button>
                
                {showFullError && (
                  <div className="p-3 bg-muted rounded-lg text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {error.stack.split('\n').slice(0, 5).join('\n')}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {errorInfo.componentStack.split('\n').slice(0, 3).join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {resetError && (
                <Button onClick={resetError} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button onClick={reloadPage} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button onClick={goHome} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default component variant
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Component Error</h3>
            <p className="text-sm text-muted-foreground">
              {errorMessage}
            </p>
          </div>

          <div className="flex justify-center">
            <Badge variant={severity === 'high' ? 'destructive' : 'secondary'}>
              {severity === 'high' ? 'Critical' : 'Recoverable'}
            </Badge>
          </div>

          {(resetError || showDetails) && (
            <div className="flex gap-2 justify-center">
              {resetError && (
                <Button onClick={resetError} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
              {showDetails && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFullError(!showFullError)}
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Details
                </Button>
              )}
            </div>
          )}

          {showFullError && error && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-left">
              <div className="text-xs font-mono space-y-1">
                <div><strong>Error:</strong> {error.name}</div>
                <div><strong>Message:</strong> {error.message}</div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs max-h-20 overflow-y-auto">
                      {error.stack.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for error reporting
export const useErrorReporting = () => {
  const reportError = React.useCallback((error: Error, errorInfo?: any) => {
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // This would integrate with services like Sentry, LogRocket, etc.
      console.error('Error reported:', { error, errorInfo })
      
      // Store locally for debugging
      try {
        const errorData = {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          errorInfo
        }
        
        const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]')
        existingErrors.unshift(errorData)
        
        // Keep only last 10 errors
        localStorage.setItem('error_reports', JSON.stringify(existingErrors.slice(0, 10)))
      } catch {
        // Silently fail if localStorage is not available
      }
    } else {
      console.error('Development Error:', error, errorInfo)
    }
  }, [])

  return { reportError }
}
