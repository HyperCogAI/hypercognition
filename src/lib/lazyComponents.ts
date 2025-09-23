import { lazy } from 'react';

// Performance-optimized lazy loading for large components
export const LazyTradingDashboard = lazy(() => import('@/components/trading/AdvancedTradingDashboard').then(m => ({ default: m.AdvancedTradingDashboard })));
export const LazyMultiExchangeDashboard = lazy(() => import('@/components/trading/MultiExchangeDashboard').then(m => ({ default: m.MultiExchangeDashboard })));
export const LazyAnalyticsDashboard = lazy(() => import('@/components/analytics/AdvancedAnalyticsDashboard'));
export const LazyTechnicalAnalysis = lazy(() => import('@/components/analytics/TechnicalAnalysisDashboard').then(m => ({ default: m.TechnicalAnalysisDashboard })));
export const LazySocialTradingDashboard = lazy(() => import('@/components/social/SocialTradingDashboard').then(m => ({ default: m.SocialTradingDashboard })));
export const LazyInstitutionalDashboard = lazy(() => import('@/components/institutional/InstitutionalDashboard').then(m => ({ default: m.InstitutionalDashboard })));
export const LazyComplianceDashboard = lazy(() => import('@/components/compliance/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
export const LazyCustomerSupportDashboard = lazy(() => import('@/components/support/CustomerSupportDashboard').then(m => ({ default: m.CustomerSupportDashboard })));
export const LazyNFTMarketplace = lazy(() => import('@/components/nft/NFTMarketplace').then(m => ({ default: m.NFTMarketplace })));
export const LazyDeFiDashboard = lazy(() => import('@/components/defi/DeFiDashboard').then(m => ({ default: m.DeFiDashboard })));
export const LazyStakingDashboard = lazy(() => import('@/components/staking/StakingDashboard').then(m => ({ default: m.StakingDashboard })));

// Legacy lazy components (keep for compatibility)
export const LazyAgentDetail = lazy(() => import('@/pages/AgentDetail').then(m => ({ default: m.AgentDetail })));
export const LazyPortfolio = lazy(() => import('@/pages/Portfolio'));
export const LazyAnalytics = lazy(() => import('@/pages/Analytics'));
export const LazyCreateAgent = lazy(() => import('@/pages/CreateAgent').then(m => ({ default: m.CreateAgent })));
export const LazyAgentComparison = lazy(() => import('@/pages/AgentComparison'));
export const LazyCommunities = lazy(() => import('@/pages/Communities'));
export const LazyFavorites = lazy(() => import('@/pages/Favorites'));

// Trading component lazy loading
export const LazyAdvancedTradingDashboard = lazy(() => import('@/components/trading/AdvancedTradingDashboard').then(module => ({ default: module.AdvancedTradingDashboard })));
export const LazyOrderBook = lazy(() => import('@/components/trading/OrderBook').then(module => ({ default: module.OrderBook })));
export const LazyPriceChart = lazy(() => import('@/components/charts/PriceChart').then(module => ({ default: module.PriceChart })));
export const LazySocialPanel = lazy(() => import('@/components/social/SocialPanel').then(module => ({ default: module.SocialPanel })));

// Real-time components
export const LazyRealTimeMarket = lazy(() => import('@/pages/RealTimeMarket').then(m => ({ default: m.RealTimeMarketPage })));

// Additional performance utilities
export const preloadComponent = (importFn: () => Promise<any>) => {
  importFn();
};