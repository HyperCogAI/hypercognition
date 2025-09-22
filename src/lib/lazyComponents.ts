import { lazy } from 'react'

// Lazy load heavy components for better initial load performance
export const LazyAgentDetail = lazy(() => import('@/pages/AgentDetail').then(m => ({ default: m.AgentDetail })))
export const LazyPortfolio = lazy(() => import('@/pages/Portfolio'))
export const LazyAnalytics = lazy(() => import('@/pages/Analytics').then(m => ({ default: m.Analytics })))
export const LazyCreateAgent = lazy(() => import('@/pages/CreateAgent').then(m => ({ default: m.CreateAgent })))
export const LazyAgentComparison = lazy(() => import('@/pages/AgentComparison'))
export const LazyCommunities = lazy(() => import('@/pages/Communities'))
export const LazyFavorites = lazy(() => import('@/pages/Favorites'))

// Lazy load heavy trading components
export const LazyAdvancedTradingDashboard = lazy(() => import('@/components/trading/AdvancedTradingDashboard').then(module => ({ default: module.AdvancedTradingDashboard })))
export const LazyOrderBook = lazy(() => import('@/components/trading/OrderBook').then(module => ({ default: module.OrderBook })))
export const LazyPriceChart = lazy(() => import('@/components/charts/PriceChart').then(module => ({ default: module.PriceChart })))
export const LazySocialPanel = lazy(() => import('@/components/social/SocialPanel').then(module => ({ default: module.SocialPanel })))