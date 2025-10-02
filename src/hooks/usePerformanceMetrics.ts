import { useQuery } from '@tanstack/react-query';
import { AnalyticsService, AgentPerformanceMetrics } from '@/services/AnalyticsService';

export const usePerformanceMetrics = (
  agentId?: string,
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
) => {
  // Get agent performance metrics
  const { 
    data: agentMetrics = [], 
    isLoading: isLoadingAgentMetrics 
  } = useQuery({
    queryKey: ['agent-performance-metrics', agentId, period],
    queryFn: () => agentId 
      ? AnalyticsService.getAgentPerformanceMetrics(agentId, period)
      : Promise.resolve([]),
    enabled: !!agentId,
  });

  // Get analytics events
  const { 
    data: events = [], 
    isLoading: isLoadingEvents 
  } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => AnalyticsService.getAnalyticsEvents(),
  });

  // Calculate derived metrics
  const latestMetrics = agentMetrics[0];
  
  const performanceScore = latestMetrics 
    ? calculatePerformanceScore(latestMetrics)
    : 0;

  const riskLevel = latestMetrics
    ? calculateRiskLevel(latestMetrics)
    : 'unknown';

  return {
    agentMetrics,
    events,
    latestMetrics,
    performanceScore,
    riskLevel,
    isLoading: isLoadingAgentMetrics || isLoadingEvents,
  };
};

// Calculate performance score (0-100)
function calculatePerformanceScore(metrics: AgentPerformanceMetrics): number {
  const winRateScore = metrics.win_rate * 40; // Max 40 points
  const roiScore = Math.min(metrics.avg_roi * 2, 30); // Max 30 points
  const volumeScore = Math.min(metrics.total_volume / 100000 * 20, 20); // Max 20 points
  const consistencyScore = (metrics.successful_trades / Math.max(metrics.total_trades, 1)) * 10; // Max 10 points

  return Math.round(winRateScore + roiScore + volumeScore + consistencyScore);
}

// Calculate risk level based on volatility and other factors
function calculateRiskLevel(metrics: AgentPerformanceMetrics): 'low' | 'medium' | 'high' | 'unknown' {
  if (!metrics.volatility) return 'unknown';

  if (metrics.volatility < 0.2) return 'low';
  if (metrics.volatility < 0.5) return 'medium';
  return 'high';
}