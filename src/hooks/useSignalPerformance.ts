import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SignalPerformance {
  id: string;
  signal_id: string;
  ticker: string;
  contract_address?: string;
  chain?: string;
  price_at_signal: number;
  price_1h?: number;
  price_4h?: number;
  price_24h?: number;
  price_7d?: number;
  return_1h?: number;
  return_4h?: number;
  return_24h?: number;
  return_7d?: number;
  peak_price?: number;
  peak_return?: number;
  peak_reached_at?: string;
  outcome: 'bullish' | 'bearish' | 'neutral' | 'pending';
  performance_score?: number;
  data_source: string;
  last_updated_at: string;
  created_at: string;
}

export interface PerformanceStats {
  totalTracked: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  pendingCount: number;
  avgReturn24h: number;
  avgPeakReturn: number;
  successRate: number;
}

export function useSignalPerformance(signalId?: string) {
  // Fetch specific signal performance
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['signal-performance', signalId],
    queryFn: async () => {
      if (!signalId) return null;
      
      const { data, error } = await supabase
        .from('signal_performance_tracking')
        .select('*')
        .eq('signal_id', signalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as SignalPerformance | null;
    },
    enabled: !!signalId,
  });

  // Fetch aggregate stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['signal-performance-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_performance_tracking')
        .select('*');

      if (error) throw error;

      const performances = data as SignalPerformance[];
      
      const bullishCount = performances.filter(p => p.outcome === 'bullish').length;
      const bearishCount = performances.filter(p => p.outcome === 'bearish').length;
      const neutralCount = performances.filter(p => p.outcome === 'neutral').length;
      const pendingCount = performances.filter(p => p.outcome === 'pending').length;
      
      const completedSignals = performances.filter(p => p.outcome !== 'pending');
      const avgReturn24h = completedSignals.reduce((sum, p) => sum + (p.return_24h || 0), 0) / (completedSignals.length || 1);
      const avgPeakReturn = performances.reduce((sum, p) => sum + (p.peak_return || 0), 0) / (performances.length || 1);
      const successRate = completedSignals.length > 0 
        ? (bullishCount / completedSignals.length) * 100 
        : 0;

      return {
        totalTracked: performances.length,
        bullishCount,
        bearishCount,
        neutralCount,
        pendingCount,
        avgReturn24h,
        avgPeakReturn,
        successRate,
      } as PerformanceStats;
    },
  });

  return {
    performance,
    stats,
    isLoading: performanceLoading || statsLoading,
  };
}
