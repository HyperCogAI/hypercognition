import { supabase } from '@/integrations/supabase/client';

export interface AgentPerformance {
  agentId: string;
  period: string;
  totalTrades: number;
  successfulTrades: number;
  totalVolume: number;
  totalProfit: number;
  avgRoi: number;
  winRate: number;
  volatility?: number;
  sentimentScore?: number;
  activeUsers: number;
  totalHolders: number;
}

export class AgentPerformanceService {
  /**
   * Get agent performance metrics
   */
  static async getAgentPerformanceMetrics(limit: number = 10): Promise<AgentPerformance[]> {
    try {
      const { data: metrics, error } = await supabase
        .from('agent_performance_metrics')
        .select(`
          *,
          agents!inner (
            id,
            symbol,
            name,
            price,
            market_cap,
            volume_24h
          )
        `)
        .eq('period', '24h')
        .order('total_volume', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return metrics?.map((m: any) => ({
        agentId: m.agent_id,
        period: m.period,
        totalTrades: m.total_trades,
        successfulTrades: m.successful_trades,
        totalVolume: m.total_volume,
        totalProfit: m.total_profit,
        avgRoi: m.avg_roi,
        winRate: m.win_rate,
        volatility: m.volatility,
        sentimentScore: m.sentiment_score,
        activeUsers: m.active_users,
        totalHolders: m.total_holders
      })) || [];
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      return [];
    }
  }

  /**
   * Get performance for a specific agent
   */
  static async getAgentPerformance(agentId: string, period: string = '24h'): Promise<AgentPerformance | null> {
    try {
      const { data, error } = await supabase
        .from('agent_performance_metrics')
        .select('*')
        .eq('agent_id', agentId)
        .eq('period', period)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        agentId: data.agent_id,
        period: data.period,
        totalTrades: data.total_trades,
        successfulTrades: data.successful_trades,
        totalVolume: data.total_volume,
        totalProfit: data.total_profit,
        avgRoi: data.avg_roi,
        winRate: data.win_rate,
        volatility: data.volatility,
        sentimentScore: data.sentiment_score,
        activeUsers: data.active_users,
        totalHolders: data.total_holders
      };
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      return null;
    }
  }
}
