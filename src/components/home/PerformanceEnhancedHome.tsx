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
    </div>
  )
})

export default PerformanceEnhancedHome