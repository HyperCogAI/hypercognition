import React from 'react'
import { EnhancedCard } from '@/components/ui/enhanced-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AnimatedSkeletonProps {
  className?: string
  lines?: number
  showImage?: boolean
  showButton?: boolean
  variant?: 'card' | 'list' | 'grid'
}

export function AnimatedSkeleton({ 
  className, 
  lines = 3, 
  showImage = false, 
  showButton = false,
  variant = 'card'
}: AnimatedSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(lines)].map((_, i) => (
          <div key={i} className={cn("flex gap-3 animate-fade-in", `animate-stagger-${Math.min(i + 1, 6)}`)}>
            <Skeleton className="h-12 w-12 rounded-lg skeleton-shimmer" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-3 w-1/2 skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {[...Array(6)].map((_, i) => (
          <EnhancedCard key={i} className={cn("animate-scale-in", `animate-stagger-${Math.min(i + 1, 6)}`)}>
            <div className="space-y-4">
              {showImage && <Skeleton className="h-32 w-full rounded skeleton-shimmer" />}
              <Skeleton className="h-6 w-3/4 skeleton-shimmer" />
              <Skeleton className="h-4 w-full skeleton-shimmer" />
              <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
              {showButton && (
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20 skeleton-shimmer" />
                  <Skeleton className="h-8 w-16 skeleton-shimmer" />
                </div>
              )}
            </div>
          </EnhancedCard>
        ))}
      </div>
    )
  }

  return (
    <EnhancedCard className={cn("animate-scale-in", className)}>
      <div className="space-y-4">
        {showImage && <Skeleton className="h-48 w-full rounded skeleton-shimmer" />}
        {[...Array(lines)].map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "skeleton-shimmer animate-fade-in",
              i === 0 ? "h-6 w-3/4" : "h-4",
              i === lines - 1 ? "w-1/2" : "w-full",
              `animate-stagger-${Math.min(i + 1, 6)}`
            )} 
          />
        ))}
        {showButton && (
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-24 skeleton-shimmer animate-fade-in animate-stagger-4" />
            <Skeleton className="h-10 w-20 skeleton-shimmer animate-fade-in animate-stagger-5" />
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

interface StaggeredContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggeredContainer({ 
  children, 
  className, 
  staggerDelay = 100 
}: StaggeredContainerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div 
          className="animate-stagger-in"
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

interface FadeInViewProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function FadeInView({ 
  children, 
  className, 
  delay = 0,
  direction = 'up'
}: FadeInViewProps) {
  const animationClass = {
    up: 'animate-fade-up',
    down: 'animate-slide-up',
    left: 'animate-slide-in-right',
    right: 'animate-slide-in-right'
  }[direction]

  return (
    <div 
      className={cn(animationClass, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export { AnimatedSkeleton as LoadingSkeleton }