import React, { lazy, Suspense, ComponentType } from 'react'
import { performanceOptimizer } from './performanceOptimizer'
import { DashboardSkeleton } from '@/components/ui/loading-skeletons'

// Enhanced lazy loading with performance tracking and retry logic
const createEnhancedLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  chunkName: string,
  preload: boolean = false
) => {
  return performanceOptimizer.createLazyComponent(importFn, {
    chunkName,
    preload,
    retryDelay: 1000,
    maxRetries: 3
  })
}

// Enhanced wrapper with fallback loading
export const withSuspense = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => {
    const defaultFallback = React.createElement(DashboardSkeleton)
    
    return React.createElement(
      Suspense,
      { fallback: fallback || defaultFallback },
      React.createElement(Component, props)
    )
  }
  
  return WrappedComponent
}

// Performance-optimized lazy loading for large components
export const LazyTradingDashboard = createEnhancedLazy(
  () => import('@/components/trading/AdvancedTradingDashboard').then(m => ({ default: m.AdvancedTradingDashboard })),
  'trading-dashboard'
)

export const LazyMultiExchangeDashboard = createEnhancedLazy(
  () => import('@/components/trading/MultiExchangeDashboard').then(m => ({ default: m.MultiExchangeDashboard })),
  'multi-exchange-dashboard'
)

export const LazyAnalyticsDashboard = createEnhancedLazy(
  () => import('@/components/analytics/AdvancedAnalyticsDashboard'),
  'analytics-dashboard'
)

export const LazyTechnicalAnalysis = createEnhancedLazy(
  () => import('@/components/analytics/TechnicalAnalysisDashboard').then(m => ({ default: m.TechnicalAnalysisDashboard })),
  'technical-analysis'
)

export const LazySocialTradingDashboard = createEnhancedLazy(
  () => import('@/components/social/SocialTradingDashboard').then(m => ({ default: m.SocialTradingDashboard })),
  'social-trading-dashboard'
)

export const LazyInstitutionalDashboard = createEnhancedLazy(
  () => import('@/components/institutional/InstitutionalDashboard').then(m => ({ default: m.InstitutionalDashboard })),
  'institutional-dashboard'
)

export const LazyComplianceDashboard = createEnhancedLazy(
  () => import('@/components/compliance/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })),
  'compliance-dashboard'
)

export const LazyCustomerSupportDashboard = createEnhancedLazy(
  () => import('@/components/support/CustomerSupportDashboard').then(m => ({ default: m.CustomerSupportDashboard })),
  'customer-support-dashboard'
)


export const LazyDeFiDashboard = createEnhancedLazy(
  () => import('@/components/defi/DeFiDashboard').then(m => ({ default: m.DeFiDashboard })),
  'defi-dashboard'
)

export const LazyStakingDashboard = createEnhancedLazy(
  () => import('@/components/staking/StakingDashboard').then(m => ({ default: m.StakingDashboard })),
  'staking-dashboard'
)

// Page-level lazy components
export const LazyAgentDetail = createEnhancedLazy(
  () => import('@/pages/AgentDetail').then(m => ({ default: m.AgentDetail })),
  'agent-detail'
)

export const LazyPortfolio = createEnhancedLazy(
  () => import('@/pages/Portfolio'),
  'portfolio',
  true // Preload critical page
)

export const LazyAnalytics = createEnhancedLazy(
  () => import('@/pages/Analytics'),
  'analytics'
)

export const LazyCreateAgent = createEnhancedLazy(
  () => import('@/pages/CreateAgent').then(m => ({ default: m.CreateAgent })),
  'create-agent'
)

export const LazyAgentComparison = createEnhancedLazy(
  () => import('@/pages/AgentComparison'),
  'agent-comparison'
)

export const LazyCommunities = createEnhancedLazy(
  () => import('@/pages/Communities'),
  'communities'
)

export const LazyFavorites = createEnhancedLazy(
  () => import('@/pages/Favorites'),
  'favorites'
)

// Trading component lazy loading
export const LazyAdvancedTradingDashboard = createEnhancedLazy(
  () => import('@/components/trading/AdvancedTradingDashboard').then(module => ({ default: module.AdvancedTradingDashboard })),
  'advanced-trading-dashboard'
)

export const LazyOrderBook = createEnhancedLazy(
  () => import('@/components/trading/OrderBook').then(module => ({ default: module.OrderBook })),
  'order-book'
)

export const LazyPriceChart = createEnhancedLazy(
  () => import('@/components/charts/PriceChart').then(module => ({ default: module.PriceChart })),
  'price-chart'
)

export const LazySocialPanel = createEnhancedLazy(
  () => import('@/components/social/SocialPanel').then(module => ({ default: module.SocialPanel })),
  'social-panel'
)

// Real-time components
export const LazyRealTimeMarket = createEnhancedLazy(
  () => import('@/pages/RealTimeMarket').then(m => ({ default: m.RealTimeMarketPage })),
  'real-time-market'
)

// Preload critical components
export const preloadCriticalComponents = async () => {
  const criticalComponents = [
    () => import('@/pages/Portfolio'),
    () => import('@/components/trading/AdvancedTradingDashboard'),
    () => import('@/components/analytics/AdvancedAnalyticsDashboard')
  ]

  await Promise.allSettled(
    criticalComponents.map(component => performanceOptimizer.preloadComponent(component))
  )
}

// Initialize preloading on app start
if (typeof window !== 'undefined') {
  // Preload after initial render
  const ric = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(() => cb(), 1))
  ric(() => {
    preloadCriticalComponents()
  })
}