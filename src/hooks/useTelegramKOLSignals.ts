import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TelegramKOLSignal {
  id: string;
  channel_id: string;
  watchlist_id: string;
  user_id: string;
  message_id: number;
  message_text: string;
  message_url: string;
  posted_at: string;
  detected_at: string;
  confidence_score: number;
  gem_type: 'token' | 'nft' | 'protocol' | 'airdrop' | 'alpha' | null;
  extracted_data: {
    extracted_tokens?: Array<{
      ticker: string;
      name?: string;
      contract?: string;
      chain?: string;
    }>;
    extracted_links?: Record<string, string>;
    key_details?: string[];
  };
  ai_reasoning: string;
  status: 'new' | 'reviewed' | 'dismissed';
  bookmarked: boolean;
  has_photo: boolean;
  has_video: boolean;
  has_document: boolean;
  forward_from_chat_title?: string;
  telegram_kol_channels?: {
    channel_username: string;
    channel_title: string;
  };
}

export function useTelegramKOLSignals(filters?: {
  watchlistId?: string;
  gemType?: string;
  minConfidence?: number;
  showDismissed?: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: signals, isLoading, error } = useQuery({
    queryKey: ['telegram-kol-signals', filters],
    queryFn: async () => {
      let query = supabase
        .from('telegram_kol_signals')
        .select(`
          *,
          telegram_kol_channels (
            channel_username,
            channel_title
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
      return data as TelegramKOLSignal[];
    },
  });

  const updateSignalStatus = useMutation({
    mutationFn: async ({ signalId, status }: { signalId: string; status: 'new' | 'reviewed' | 'dismissed' }) => {
      const { error } = await supabase
        .from('telegram_kol_signals')
        .update({ status })
        .eq('id', signalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-signals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update signal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleBookmark = useMutation({
    mutationFn: async ({ signalId, bookmarked }: { signalId: string; bookmarked: boolean }) => {
      const { error } = await supabase
        .from('telegram_kol_signals')
        .update({ bookmarked })
        .eq('id', signalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-kol-signals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update bookmark",
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
    toggleBookmark: toggleBookmark.mutate,
    isUpdating: updateSignalStatus.isPending || toggleBookmark.isPending,
  };
}
