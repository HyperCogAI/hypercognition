import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TwitterKOLSignal {
  id: string;
  kol_account_id: string;
  watchlist_id: string;
  user_id: string;
  tweet_id: string;
  tweet_text: string;
  tweet_url: string;
  posted_at: string;
  detected_at: string;
  confidence_score: number;
  gem_type: 'token' | 'nft' | 'protocol' | 'airdrop' | 'alpha' | null;
  extracted_data: {
    tokens?: Array<{
      ticker: string;
      name?: string;
      contract?: string;
      chain?: string;
    }>;
    links?: Record<string, string>;
    details?: string[];
  };
  ai_analysis: string;
  status: 'new' | 'reviewed' | 'dismissed';
  user_action: 'alerted' | 'bookmarked' | 'ignored' | null;
  twitter_kol_accounts?: {
    twitter_username: string;
  };
}

export function useTwitterKOLSignals(filters?: {
  watchlistId?: string;
  gemType?: string;
  minConfidence?: number;
  showDismissed?: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['twitter-kol-signals', filters],
    queryFn: async () => {
      let query = supabase
        .from('twitter_kol_signals')
        .select(`
          *,
          twitter_kol_accounts (
            twitter_username
          )
        `)
        .order('detected_at', { ascending: false });

      if (filters?.watchlistId) {
        query = query.eq('watchlist_id', filters.watchlistId);
      }

      if (filters?.gemType && filters.gemType !== 'all') {
        query = query.eq('gem_type', filters.gemType as 'token' | 'nft' | 'protocol' | 'airdrop' | 'alpha');
      }

      if (filters?.minConfidence) {
        query = query.gte('confidence_score', filters.minConfidence);
      }

      if (!filters?.showDismissed) {
        query = query.neq('status', 'dismissed');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TwitterKOLSignal[];
    },
  });

  const updateSignalStatus = useMutation({
    mutationFn: async ({ signalId, status }: { signalId: string; status: 'new' | 'reviewed' | 'dismissed' }) => {
      const { error } = await supabase
        .from('twitter_kol_signals')
        .update({ status })
        .eq('id', signalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-signals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update signal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSignalAction = useMutation({
    mutationFn: async ({ signalId, action }: { signalId: string; action: 'alerted' | 'bookmarked' | 'ignored' }) => {
      const { error } = await supabase
        .from('twitter_kol_signals')
        .update({ user_action: action })
        .eq('id', signalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twitter-kol-signals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update action",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    signals,
    isLoading,
    error,
    updateSignalStatus: updateSignalStatus.mutate,
    updateSignalAction: updateSignalAction.mutate,
    isUpdating: updateSignalStatus.isPending || updateSignalAction.isPending,
  };
}
