import { useEffect, useRef, useState } from 'react'
import { performanceOptimizer, PerformanceMetrics } from '@/lib/performanceOptimizer'

interface PerformanceData {
  renderTime: number
  componentName: string
  timestamp: number
}

export const usePerformanceMonitoring = (componentName: string) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const renderStartTime = useRef<number>(performance.now())

  useEffect(() => {
    const startTime = renderStartTime.current
    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Track render time
    performanceOptimizer.trackRenderTime(componentName, renderTime)

    setPerformanceData({
      renderTime,
      componentName,
      timestamp: Date.now()
    })

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }
  }, [componentName])

  return {
    performanceData,
    getMetrics: () => performanceOptimizer.getMetrics(componentName),
    getAllMetrics: () => performanceOptimizer.getAllMetrics()
  }
}

export const useMemoryMonitoring = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0)

  useEffect(() => {
    const updateMemoryUsage = () => {
      const usage = performanceOptimizer.trackMemoryUsage()
      setMemoryUsage(usage)
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return { memoryUsage }
}

export const useLoadingPerformance = () => {
  const [loadingTimes, setLoadingTimes] = useState<Map<string, number>>(new Map())

  const trackLoadingTime = (key: string, startTime: number) => {
    const endTime = performance.now()
    const loadTime = endTime - startTime

    setLoadingTimes(prev => new Map(prev.set(key, loadTime)))

    // Track in performance optimizer
    performanceOptimizer.trackComponentLoad(key, loadTime)

    return loadTime
  }

  return {
    loadingTimes,
    trackLoadingTime,
    startTiming: () => performance.now()
  }
}