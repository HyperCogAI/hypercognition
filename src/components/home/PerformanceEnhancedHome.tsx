import { memo, useCallback, useMemo } from 'react'
import { OptimizedHomeLayout } from './OptimizedHomeLayout'
import { MobileStats, MobileFeatures, MobileCTA, MobileMetrics } from './MobileOptimizedSections'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { performanceOptimizer } from '@/lib/performanceOptimizer'

// Memoized components to prevent unnecessary re-renders
const MemoizedMobileStats = memo(MobileStats)
const MemoizedMobileFeatures = memo(MobileFeatures)
const MemoizedMobileCTA = memo(MobileCTA)
const MemoizedMobileMetrics = memo(MobileMetrics)

interface PerformanceEnhancedHomeProps {
  className?: string
}

export const PerformanceEnhancedHome = memo(function PerformanceEnhancedHome({ 
  className 
}: PerformanceEnhancedHomeProps) {
  const { isMobile, isTablet, screenSize } = useDeviceDetection()
  const { performanceData, getMetrics } = usePerformanceMonitoring('PerformanceEnhancedHome')

  // Memoize device-specific configurations
  const deviceConfig = useMemo(() => ({
    isMobile,
    isTablet,
    screenSize,
    shouldUseOptimizedLayout: isMobile || screenSize === 'sm',
    shouldPreloadImages: !isMobile && screenSize !== 'sm'
  }), [isMobile, isTablet, screenSize])

  // Preload critical resources for non-mobile devices
  const preloadCriticalResources = useCallback(() => {
    if (deviceConfig.shouldPreloadImages) {
      // Preload hero video and critical images
      performanceOptimizer.preloadComponent(() => import('@/components/sections/EnhancedHero'))
      performanceOptimizer.preloadComponent(() => import('@/components/sections/AgentMarketplace'))
    }
  }, [deviceConfig.shouldPreloadImages])

  // Initialize preloading on mount for better UX
  useMemo(() => {
    if (typeof window !== 'undefined') {
      requestIdleCallback(() => {
        preloadCriticalResources()
      })
    }
  }, [preloadCriticalResources])

  // Track component performance metrics
  useMemo(() => {
    if (performanceData && process.env.NODE_ENV === 'development') {
      console.log(`Home performance: ${performanceData.renderTime.toFixed(2)}ms`)
    }
  }, [performanceData])

  return (
    <div className={className}>
      <OptimizedHomeLayout />
      
      {/* Development performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs z-50">
          <div className="text-primary font-semibold">Performance</div>
          <div>Device: {deviceConfig.isMobile ? 'Mobile' : deviceConfig.isTablet ? 'Tablet' : 'Desktop'}</div>
          {performanceData && (
            <div>Render: {performanceData.renderTime.toFixed(2)}ms</div>
          )}
        </div>
      )}
    </div>
  )
})

export default PerformanceEnhancedHome