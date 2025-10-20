import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KOLPerformance {
  kol_account_id: string;
  twitter_username: string;
  watchlist_id: string;
  total_signals: number;
  bullish_signals: number;
  bearish_signals: number;
  pending_signals: number;
  avg_return_24h: number;
  avg_peak_return: number;
  best_signal_return: number;
  avg_performance_score: number;
  success_rate: number;
  avg_confidence_score: number;
  avg_enhanced_confidence: number;
  yaps_30d: number;
  yaps_7d: number;
  last_signal_at: string;
  first_signal_at: string;
}

export function useKOLPerformance(watchlistId?: string) {
  const { data: kolPerformance, isLoading } = useQuery({
    queryKey: ['kol-performance', watchlistId],
    queryFn: async () => {
      let query = supabase
        .from('kol_performance_summary')
        .select('*');

      if (watchlistId) {
        query = query.eq('watchlist_id', watchlistId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as KOLPerformance[];
    },
  });

  const topPerformers = kolPerformance
    ?.filter(k => k.total_signals >= 3) // At least 3 signals
    ?.sort((a, b) => (b.success_rate || 0) - (a.success_rate || 0))
    ?.slice(0, 10) || [];

  const worstPerformers = kolPerformance
    ?.filter(k => k.total_signals >= 3)
    ?.sort((a, b) => (a.success_rate || 0) - (b.success_rate || 0))
    ?.slice(0, 10) || [];

  const stats = {
    totalKOLs: kolPerformance?.length || 0,
    avgSuccessRate: kolPerformance?.reduce((sum, k) => sum + (k.success_rate || 0), 0) / (kolPerformance?.length || 1) || 0,
    avgReturn24h: kolPerformance?.reduce((sum, k) => sum + (k.avg_return_24h || 0), 0) / (kolPerformance?.length || 1) || 0,
    totalSignalsTracked: kolPerformance?.reduce((sum, k) => sum + (k.total_signals || 0), 0) || 0,
  };

  return {
    kolPerformance: kolPerformance || [],
    topPerformers,
    worstPerformers,
    stats,
    isLoading,
  };
}
