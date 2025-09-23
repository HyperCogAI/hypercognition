import React from 'react'
import { CyberButton } from '@/components/ui/cyber-button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ProgressiveLoadingState {
  phase: 'initial' | 'skeleton' | 'partial' | 'complete'
  progress: number
}

export function useProgressiveLoading(duration: number = 3000) {
  const [state, setState] = React.useState<ProgressiveLoadingState>({
    phase: 'initial',
    progress: 0
  })

  React.useEffect(() => {
    const phases = [
      { phase: 'skeleton' as const, delay: 200 },
      { phase: 'partial' as const, delay: 1500 },
      { phase: 'complete' as const, delay: duration }
    ]

    phases.forEach(({ phase, delay }) => {
      setTimeout(() => {
        setState({ phase, progress: delay / duration * 100 })
      }, delay)
    })
  }, [duration])

  return state
}

interface SmartSkeletonProps {
  variant: 'card' | 'chart' | 'table' | 'agent' | 'text' | 'button'
  className?: string
  animated?: boolean
}

export function SmartSkeleton({ variant, className = '', animated = true }: SmartSkeletonProps) {
  const baseClass = animated ? 'animate-shimmer' : ''

  const variants = {
    card: (
      <div className={`p-4 border rounded-lg space-y-3 ${baseClass} ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ),
    
    chart: (
      <div className={`p-4 border rounded-lg space-y-4 ${baseClass} ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-12 rounded" />
            ))}
          </div>
        </div>
        <div className="h-48 flex items-end space-x-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 bg-primary/20" 
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${i * 50}ms`
              }} 
            />
          ))}
        </div>
      </div>
    ),
    
    table: (
      <div className={`border rounded-lg overflow-hidden ${baseClass} ${className}`}>
        {/* Header */}
        <div className="p-4 border-b bg-muted/50">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton 
                  key={j} 
                  className="h-4 w-20" 
                  style={{ animationDelay: `${(i * 4 + j) * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    
    agent: (
      <div className={`p-4 border rounded-lg space-y-4 ${baseClass} ${className}`}>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="ml-auto">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Skeleton className="h-8 flex-1 rounded" />
          <Skeleton className="h-8 flex-1 rounded" />
        </div>
      </div>
    ),
    
    text: (
      <div className={`space-y-2 ${baseClass} ${className}`}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ),
    
    button: (
      <Skeleton className={`h-10 w-24 rounded ${baseClass} ${className}`} />
    )
  }

  return variants[variant]
}

interface LoadingStateManagerProps {
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  isLoading?: boolean
  isError?: boolean
  minimumLoadingTime?: number
}

export function LoadingStateManager({
  children,
  loadingComponent,
  errorComponent,
  isLoading = false,
  isError = false,
  minimumLoadingTime = 1000
}: LoadingStateManagerProps) {
  const [showContent, setShowContent] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, minimumLoadingTime)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, isError, minimumLoadingTime])

  if (isError && errorComponent) {
    return <>{errorComponent}</>
  }

  if (isLoading || !showContent) {
    return loadingComponent ? <>{loadingComponent}</> : <SmartSkeleton variant="card" />
  }

  return <>{children}</>
}

interface InlineLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
  className?: string
}

export function InlineLoading({ isLoading, children, skeleton, className = '' }: InlineLoadingProps) {
  if (isLoading) {
    return skeleton ? <>{skeleton}</> : <Skeleton className={`h-4 w-20 ${className}`} />
  }
  
  return <>{children}</>
}

// Enhanced button with loading state
interface LoadingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'neon' | 'analytics'
  size?: 'default' | 'sm' | 'lg' | 'xl'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText = 'Loading...',
  variant = 'default',
  size = 'default',
  onClick,
  disabled,
  className = ''
}: LoadingButtonProps) {
  return (
    <CyberButton
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${isLoading ? 'animate-pulse-glow' : ''} ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </CyberButton>
  )
}

// Status indicators with loading states
interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'idle'
  message?: string
  className?: string
}

export function StatusIndicator({ status, message, className = '' }: StatusIndicatorProps) {
  const statusConfig = {
    loading: { color: 'bg-blue-500', text: 'Processing...', animate: 'animate-pulse' },
    success: { color: 'bg-green-500', text: 'Success', animate: '' },
    error: { color: 'bg-red-500', text: 'Error', animate: '' },
    warning: { color: 'bg-yellow-500', text: 'Warning', animate: '' },
    idle: { color: 'bg-gray-500', text: 'Idle', animate: '' }
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${config.color} ${config.animate}`} />
      <span className="text-sm text-muted-foreground">
        {message || config.text}
      </span>
    </div>
  )
}