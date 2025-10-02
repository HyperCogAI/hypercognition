// Re-export from modular services for backward compatibility
export { ChainMetricsService, type ChainMetrics } from './ChainMetricsService';
export { TokenMetricsService, type TokenMetrics } from './TokenMetricsService';
export { LiquidityPoolService, type LiquidityPool } from './LiquidityPoolService';
export { AgentPerformanceService, type AgentPerformance } from './AgentPerformanceService';

/**
 * Legacy unified service - delegates to modular services
 * @deprecated Use individual services instead for better tree-shaking
 */
export class RealTimeChainAnalytics {
  static getSolanaMetrics = ChainMetricsService.getSolanaMetrics;
  static getEVMMetrics = ChainMetricsService.getEVMMetrics;
  static getCrossChainAnalytics = ChainMetricsService.getCrossChainAnalytics;
  static getTopTokensByVolume = TokenMetricsService.getTopTokensByVolume;
  static getLiquidityPools = LiquidityPoolService.getLiquidityPools;
  static getAgentPerformanceMetrics = AgentPerformanceService.getAgentPerformanceMetrics;
}

// Re-export individual services
import { ChainMetricsService } from './ChainMetricsService';
import { TokenMetricsService } from './TokenMetricsService';
import { LiquidityPoolService } from './LiquidityPoolService';
import { AgentPerformanceService } from './AgentPerformanceService';

