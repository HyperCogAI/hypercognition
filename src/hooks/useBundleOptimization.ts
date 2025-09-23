import { useState, useEffect, useCallback } from 'react'
import { 
  loadFeatureModule, 
  getBundleMetrics, 
  trackPerformance, 
  cleanupUnusedModules,
  createLazyLoadObserver 
} from '@/lib/bundleOptimization'

export const useBundleOptimization = () => {
  const [metrics, setMetrics] = useState<any>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Load feature module dynamically
  const loadFeature = useCallback(async (feature: string) => {
    const startTime = performance.now()
    
    try {
      setIsOptimizing(true)
      const module = await loadFeatureModule(feature)
      
      const loadTime = performance.now() - startTime
      trackPerformance(`feature_load_${feature}`, loadTime, ['dynamic-import'])
      
      return module
    } catch (error) {
      console.error(`Failed to load feature ${feature}:`, error)
      throw error
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  // Get current bundle metrics
  const updateMetrics = useCallback(() => {
    const newMetrics = getBundleMetrics()
    setMetrics(newMetrics)
    return newMetrics
  }, [])

  // Cleanup unused resources
  const cleanup = useCallback(() => {
    cleanupUnusedModules()
    updateMetrics()
  }, [updateMetrics])

  // Auto-cleanup on interval
  useEffect(() => {
    const interval = setInterval(cleanup, 10 * 60 * 1000) // Every 10 minutes
    return () => clearInterval(interval)
  }, [cleanup])

  // Initial metrics load
  useEffect(() => {
    updateMetrics()
  }, [updateMetrics])

  return {
    loadFeature,
    metrics,
    updateMetrics,
    cleanup,
    isOptimizing
  }
}

export const useLazyLoading = (ref: React.RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = createLazyLoadObserver((entry) => {
      if (entry.isIntersecting && !hasLoaded) {
        setIsVisible(true)
        setHasLoaded(true)
        observer.disconnect()
      }
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref, hasLoaded])

  return { isVisible, hasLoaded }
}

export const useResourcePreloader = () => {
  const [preloadedResources, setPreloadedResources] = useState<Set<string>>(new Set())

  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' = 'script') => {
    if (preloadedResources.has(url)) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    
    switch (type) {
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
      case 'image':
        link.as = 'image'
        break
    }

    link.onload = () => {
      setPreloadedResources(prev => new Set([...prev, url]))
    }

    document.head.appendChild(link)
  }, [preloadedResources])

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.has(src)) return

    const img = new Image()
    img.onload = () => {
      setPreloadedResources(prev => new Set([...prev, src]))
    }
    img.src = src
  }, [preloadedResources])

  return {
    preloadResource,
    preloadImage,
    preloadedResources: Array.from(preloadedResources)
  }
}

export const usePerformanceMonitoring = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([])

  const recordMetric = useCallback((name: string, value: number, tags: string[] = []) => {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    }

    trackPerformance(name, value, tags)
    setPerformanceData(prev => [...prev.slice(-99), metric]) // Keep last 100 metrics
  }, [])

  const measureAsync = useCallback(async <T>(
    name: string, 
    operation: () => Promise<T>,
    tags: string[] = []
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      recordMetric(name, duration, ['async', ...tags])
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      recordMetric(`${name}_error`, duration, ['async', 'error', ...tags])
      throw error
    }
  }, [recordMetric])

  const measureSync = useCallback(<T>(
    name: string,
    operation: () => T,
    tags: string[] = []
  ): T => {
    const startTime = performance.now()
    
    try {
      const result = operation()
      const duration = performance.now() - startTime
      recordMetric(name, duration, ['sync', ...tags])
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      recordMetric(`${name}_error`, duration, ['sync', 'error', ...tags])
      throw error
    }
  }, [recordMetric])

  return {
    performanceData,
    recordMetric,
    measureAsync,
    measureSync
  }
}