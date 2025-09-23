import { useState, useRef, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
  threshold?: number
  disabled?: boolean
}

export const MobilePullToRefresh = ({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  disabled = false
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const lastTouchY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container) return
    
    // Only start pull-to-refresh if we're at the top
    if (container.scrollTop > 0) return
    
    touchStartY.current = e.touches[0].clientY
    lastTouchY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || touchStartY.current === 0) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY.current
    
    // Only allow pulling down
    if (deltaY > 0) {
      e.preventDefault()
      const distance = Math.min(deltaY * 0.5, threshold * 1.5) // Dampen the pull
      setPullDistance(distance)
      setCanRefresh(distance >= threshold)
    }
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) return
    
    if (canRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setCanRefresh(false)
    touchStartY.current = 0
  }

  useEffect(() => {
    if (isRefreshing) {
      setPullDistance(threshold)
    } else if (!canRefresh) {
      setPullDistance(0)
    }
  }, [isRefreshing, canRefresh, threshold])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isRefreshing || (!canRefresh && pullDistance === 0) ? 'transform 0.3s ease' : 'none'
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-50"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          transform: `translateY(-${Math.max(pullDistance, 0)}px)`
        }}
      >
        {pullDistance > 0 && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <RefreshCw
              className={cn(
                "h-5 w-5 transition-transform",
                isRefreshing && "animate-spin",
                canRefresh && !isRefreshing && "text-primary"
              )}
              style={{
                transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)`
              }}
            />
            <span className="text-xs font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : canRefresh 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        )}
      </div>
      
      {children}
    </div>
  )
}