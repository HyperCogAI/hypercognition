// Performance optimization utilities and monitoring
import React, { lazy, ComponentType } from 'react'

export interface PerformanceMetrics {
  componentLoadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
}

class PerformanceOptimizer {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private observers: IntersectionObserver[] = []

  /**
   * Enhanced lazy loading with preloading capabilities
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: {
      preload?: boolean
      chunkName?: string
      retryDelay?: number
      maxRetries?: number
    } = {}
  ) {
    const { preload = false, retryDelay = 1000, maxRetries = 3 } = options

    // Enhanced import with retry logic
    const enhancedImport = async (): Promise<{ default: T }> => {
      let lastError: Error
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const startTime = performance.now()
          const module = await importFn()
          const loadTime = performance.now() - startTime
          
          // Track load time
          this.trackComponentLoad(options.chunkName || 'unknown', loadTime)
          
          return module
        } catch (error) {
          lastError = error as Error
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          }
        }
      }
      
      throw lastError!
    }

    const LazyComponent = lazy(enhancedImport)

    // Preload if requested
    if (preload) {
      this.preloadComponent(enhancedImport)
    }

    return LazyComponent
  }

  /**
   * Preload component for better UX
   */
  async preloadComponent(importFn: () => Promise<any>) {
    try {
      await importFn()
    } catch (error) {
      console.warn('Failed to preload component:', error)
    }
  }

  /**
   * Set up intersection observer for lazy loading
   */
  setupIntersectionObserver(
    elements: Element[],
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })

    elements.forEach(el => observer.observe(el))
    this.observers.push(observer)

    return observer
  }

  /**
   * Track component performance metrics
   */
  trackComponentLoad(componentName: string, loadTime: number) {
    const existing = this.metrics.get(componentName) || {
      componentLoadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0
    }

    this.metrics.set(componentName, {
      ...existing,
      componentLoadTime: loadTime
    })
  }

  /**
   * Track render performance
   */
  trackRenderTime(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      componentLoadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0
    }

    this.metrics.set(componentName, {
      ...existing,
      renderTime
    })
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName)
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  /**
   * Memory usage tracking
   */
  trackMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      return memInfo.usedJSHeapSize / memInfo.totalJSHeapSize
    }
    return 0
  }

  /**
   * Bundle size optimization recommendations
   */
  analyzeBundleSize(): {
    recommendations: string[]
    totalSize: number
    criticalComponents: string[]
  } {
    const recommendations: string[] = []
    const criticalComponents: string[] = []
    
    // Analyze component load times
    for (const [name, metrics] of this.metrics) {
      if (metrics.componentLoadTime > 500) {
        recommendations.push(`Consider code splitting for ${name} (${metrics.componentLoadTime}ms load time)`)
        criticalComponents.push(name)
      }
      
      if (metrics.renderTime > 100) {
        recommendations.push(`Optimize rendering for ${name} (${metrics.renderTime}ms render time)`)
      }
    }

    return {
      recommendations,
      totalSize: 0, // Would be calculated from actual bundle analysis
      criticalComponents
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

export const performanceOptimizer = new PerformanceOptimizer()

/**
 * Performance monitoring hook for React components
 */
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const startTime = performance.now()
    
    // Track render time after component mounts
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime
      performanceOptimizer.trackRenderTime(componentName, renderTime)
    })

    return React.createElement(Component, props)
  }
}

/**
 * Image lazy loading utility
 */
export const createLazyImage = (src: string, placeholder?: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve(img)
    img.onerror = reject
    
    // Use placeholder while loading
    if (placeholder) {
      img.src = placeholder
    }
    
    // Load actual image
    requestIdleCallback(() => {
      img.src = src
    })
  })
}