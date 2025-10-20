import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface KOLMention {
  username: string;
  yaps_all: number;
  yaps_24h?: number;
  yaps_7d?: number;
  tier: string;
  tweet_count: number;
}

export interface SignalTickerAnalysis {
  id: string;
  signal_id: string;
  ticker: string;
  analysis_timestamp: string;
  kols_mentioning: KOLMention[];
  total_kols_count: number;
  total_influence_score: number;
  average_influence_score: number;
  confidence_multiplier: number;
  final_confidence_score: number;
  top_tier_kols: number;
  mid_tier_kols: number;
  emerging_kols: number;
  metadata: Record<string, any>;
}

export const useSignalTickerAnalysis = (signalId: string, ticker?: string) => {
  const queryClient = useQueryClient();

  // Fetch existing analysis
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['signal-ticker-analysis', signalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_ticker_analysis')
        .select('*')
        .eq('signal_id', signalId)
        .order('analysis_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? {
        ...data,
        kols_mentioning: (data.kols_mentioning as any) || [],
      } as SignalTickerAnalysis : null;
    },
    enabled: !!signalId,
  });

  // Trigger new analysis
  const triggerAnalysis = useMutation({
    mutationFn: async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
      if (!ticker) {
        throw new Error('Ticker is required for analysis');
      }

      const { data, error } = await supabase.functions.invoke('analyze-signal-ticker', {
        body: {
          signal_id: signalId,
          ticker: ticker,
          force_refresh: forceRefresh,
        },
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Analysis failed');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal-ticker-analysis', signalId] });
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-signals'] });
      toast.success('Signal analysis completed');
    },
    onError: (error: Error) => {
      console.error('Analysis error:', error);
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  // Check if analysis is stale (older than 6 hours)
  const isAnalysisStale = (timestamp?: string): boolean => {
    if (!timestamp) return true;
    const analysisTime = new Date(timestamp).getTime();
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    return analysisTime < sixHoursAgo;
  };

  return {
    analysis,
    isLoading,
    error,
    triggerAnalysis: triggerAnalysis.mutate,
    isAnalyzing: triggerAnalysis.isPending,
    isStale: analysis ? isAnalysisStale(analysis.analysis_timestamp) : true,
  };
};
