import { memo, useCallback, useMemo } from 'react'
import { OptimizedHomeLayout } from './OptimizedHomeLayout'
import { MobileStats, MobileFeatures, MobileCTA, MobileMetrics } from './MobileOptimizedSections'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { performanceOptimizer } from '@/lib/performanceOptimizer'
import { useViewportUnitsFix } from '@/hooks/useViewportUnitsFix'

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
  
  // Fix viewport height inconsistencies in mobile browsers (especially WebViews like Metamask)
  useViewportUnitsFix()

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
      const ric = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(() => cb(), 1))
      ric(() => {
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