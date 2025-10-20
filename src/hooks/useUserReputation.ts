import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserReputation {
  user_id: string;
  total_votes_cast: number;
  correct_votes: number;
  accuracy_rate: number;
  signals_bookmarked: number;
  signals_shared: number;
  comments_posted: number;
  reputation_score: number;
  reputation_tier: 'newcomer' | 'contributor' | 'expert' | 'legend';
  badges: any[];
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export function useUserReputation(userId?: string) {
  const { data: reputation, isLoading } = useQuery({
    queryKey: ['user-reputation', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserReputation | null;
    },
    enabled: !!userId,
  });

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'legend':
        return {
          label: 'Legend',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          icon: '👑',
          voteWeight: 2.0,
        };
      case 'expert':
        return {
          label: 'Expert',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          icon: '⭐',
          voteWeight: 1.5,
        };
      case 'contributor':
        return {
          label: 'Contributor',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          icon: '✓',
          voteWeight: 1.2,
        };
      default:
        return {
          label: 'Newcomer',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          icon: '📝',
          voteWeight: 1.0,
        };
    }
  };

  return {
    reputation,
    tier: reputation?.reputation_tier || 'newcomer',
    tierConfig: getTierConfig(reputation?.reputation_tier || 'newcomer'),
    accuracyRate: reputation?.accuracy_rate || 0,
    reputationScore: reputation?.reputation_score || 50,
    badges: reputation?.badges || [],
    isLoading,
  };
}
