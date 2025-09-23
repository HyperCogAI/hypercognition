// Bundle optimization utilities
import { cache, CACHE_KEYS, CACHE_TTL, CACHE_TAGS } from './cache'

// Dynamic imports for feature modules
export const loadFeatureModule = async (feature: string) => {
  const modules = {
    'social-trading': () => import('@/components/social/SocialTradingDashboard'),
    'advanced-analytics': () => import('@/components/analytics/AdvancedAnalyticsDashboard'),
    'portfolio-optimizer': () => import('@/components/portfolio/PortfolioOptimizer'),
    'risk-management': () => import('@/components/portfolio/RiskManagementDashboard'),
    'technical-analysis': () => import('@/components/analytics/TechnicalAnalysisDashboard'),
    
    'defi-dashboard': () => import('@/components/defi/DeFiDashboard'),
    'compliance-dashboard': () => import('@/components/compliance/ComplianceDashboard'),
    'institutional-features': () => import('@/components/institutional/InstitutionalDashboard'),
    'staking-dashboard': () => import('@/components/staking/StakingDashboard'),
    'ai-assistant': () => import('@/components/ai/AITradingAssistant'),
    'voice-interface': () => import('@/components/ai/VoiceInterface'),
    'multi-exchange': () => import('@/components/trading/MultiExchangeDashboard'),
    'real-time-market': () => import('@/components/trading/RealTimeMarketDashboard'),
  } as const

  const moduleLoader = modules[feature as keyof typeof modules]
  if (!moduleLoader) {
    throw new Error(`Feature module '${feature}' not found`)
  }

  // Cache the module to avoid re-loading
  const cacheKey = CACHE_KEYS.EXCHANGE_STATUS(feature)
  const cachedModule = cache.get(cacheKey)
  
  if (cachedModule) {
    return cachedModule
  }

  try {
    const module = await moduleLoader()
    cache.set(cacheKey, module, { 
      ttl: CACHE_TTL.EXCHANGE_INFO,
      tags: [CACHE_TAGS.EXCHANGE]
    })
    return module
  } catch (error) {
    console.error(`Failed to load feature module '${feature}':`, error)
    throw error
  }
}

// Preload critical modules
export const preloadCriticalModules = () => {
  const criticalModules = [
    'portfolio-optimizer',
    'ai-assistant'
  ]

  criticalModules.forEach(module => {
    // Preload in the background
    loadFeatureModule(module).catch(error => {
      console.warn(`Failed to preload critical module '${module}':`, error)
    })
  })
}

// Code splitting boundaries
export const ROUTE_CHUNKS = {
  // Core app (always loaded)
  CORE: ['home', 'auth', 'marketplace'],
  
  // Trading features
  TRADING: ['advanced-trading', 'real-time-market', 'multi-exchange', 'order-management'],
  
  // Portfolio & Analytics
  PORTFOLIO: ['portfolio', 'analytics', 'advanced-analytics', 'risk-management'],
  
  // Social & Community
  SOCIAL: ['social-trading', 'communities', 'agent-comparison'],
  
  // DeFi & Blockchain
  DEFI: ['defi', 'staking', 'solana-dashboard'],
  
  // Administrative
  ADMIN: ['admin', 'institutional', 'compliance', 'customer-support'],
  
  // Tools & Utilities
  TOOLS: ['logo-generator', 'ai-assistant', 'technical-analysis'],
  
  // Legal & Support
  SUPPORT: ['privacy', 'terms', 'cookies', 'contact', 'referrals']
} as const

// Bundle size monitoring
export const getBundleMetrics = () => {
  const performance = window.performance
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  return {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    totalBytes: navigation.transferSize || 0,
    resourceCount: performance.getEntriesByType('resource').length,
    cacheStats: cache.getStats()
  }
}

// Resource prefetching
export const prefetchRoute = (route: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  document.head.appendChild(link)
}

// Memory management
export const cleanupUnusedModules = () => {
  // Clear cache entries older than 30 minutes
  cache.invalidate('.*')
  
  // Force garbage collection if available
  if ('gc' in window && typeof window.gc === 'function') {
    window.gc()
  }
}

// Performance monitoring
export const trackPerformance = (metric: string, value: number, tags: string[] = []) => {
  const perfEntry = {
    name: metric,
    value,
    timestamp: Date.now(),
    tags
  }
  
  // Store in cache for analytics
  cache.set(`perf_${metric}_${Date.now()}`, perfEntry, {
    ttl: CACHE_TTL.ANALYTICS,
    tags: [CACHE_TAGS.ANALYTICS, ...tags]
  })
  
  // Log to console in development
  if (import.meta.env.MODE === 'development') {
    console.log(`Performance: ${metric} = ${value}ms`, tags)
  }
}

// Lazy loading observer
export const createLazyLoadObserver = (callback: (entry: IntersectionObserverEntry) => void) => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    },
    {
      rootMargin: '50px',
      threshold: 0.1
    }
  )
}

// Image optimization
export const optimizeImage = (src: string, width?: number, quality = 80) => {
  if (!src) return src
  
  // Add optimization parameters for supported services
  const url = new URL(src, window.location.origin)
  
  if (width) {
    url.searchParams.set('w', width.toString())
  }
  url.searchParams.set('q', quality.toString())
  url.searchParams.set('auto', 'format,compress')
  
  return url.toString()
}