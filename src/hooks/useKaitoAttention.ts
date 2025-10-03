import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KaitoService, KaitoAttentionScore, KaitoSyncRequest } from '@/services/KaitoService';
import { useToast } from '@/hooks/use-toast';

export const useKaitoAttention = (agentId?: string, username?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attention score for an agent
  const { data: agentScore, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['kaito-attention', 'agent', agentId],
    queryFn: () => agentId ? KaitoService.getAgentAttentionScore(agentId) : null,
    enabled: !!agentId,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    refetchInterval: 6 * 60 * 60 * 1000 // Refetch every 6 hours
  });

  // Fetch attention score by username
  const { data: usernameScore, isLoading: isLoadingUsername } = useQuery({
    queryKey: ['kaito-attention', 'username', username],
    queryFn: () => username ? KaitoService.getAttentionScoreByUsername(username) : null,
    enabled: !!username,
    staleTime: 6 * 60 * 60 * 1000,
    refetchInterval: 6 * 60 * 60 * 1000
  });

  // Fetch top agents by attention
  const { data: topAgents = [], isLoading: isLoadingTop } = useQuery({
    queryKey: ['kaito-attention', 'top'],
    queryFn: async (): Promise<KaitoAttentionScore[]> => {
      const primary = await KaitoService.getTopAgentsByAttention(50, '30d');
      if ((primary?.length || 0) >= 50) return primary || [];
      const fallback = await KaitoService.getTopAgentsByAttention(50, 'all');
      const seen = new Set((primary || []).map(a => a.twitter_username));
      const merged: KaitoAttentionScore[] = [...(primary || [])];
      for (const a of fallback || []) {
        if (merged.length >= 50) break;
        if (!seen.has(a.twitter_username)) {
          seen.add(a.twitter_username);
          merged.push(a);
        }
      }
      return merged;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: (request: KaitoSyncRequest) => KaitoService.syncAttentionScores(request),
    onSuccess: (data) => {
      toast({
        title: 'Kaito Sync Complete',
        description: `Synced ${data.stats.success} users successfully`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['kaito-attention'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Kaito Sync Failed',
        description: error.message || 'Failed to sync attention scores',
        variant: 'destructive',
      });
    }
  });

  const syncForAgent = (agentId: string) => {
    syncMutation.mutate({ agentIds: [agentId] });
  };

  const syncForUsername = (username: string) => {
    syncMutation.mutate({ usernames: [username] });
  };

  const syncForUsernameAsync = (username: string) => {
    return syncMutation.mutateAsync({ usernames: [username] });
  };

  const syncMultiple = (request: KaitoSyncRequest) => {
    syncMutation.mutate(request);
  };

  // Get the current score (prefer agent score, fallback to username)
  const currentScore = agentScore || usernameScore;
  const isLoading = isLoadingAgent || isLoadingUsername;

  // Check if refresh is needed
  const needsRefresh = KaitoService.needsRefresh(currentScore);

  return {
    score: currentScore,
    topAgents,
    isLoading,
    isLoadingTop,
    isSyncing: syncMutation.isPending,
    needsRefresh,
    syncForAgent,
    syncForUsername,
    syncForUsernameAsync,
    syncMultiple,
    formatYaps: KaitoService.formatYaps,
    getInfluenceTier: KaitoService.getInfluenceTier
  };
};
