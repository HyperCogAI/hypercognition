import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface StakingProgram {
  id: string;
  name: string;
  token_symbol: string;
  apy: number;
  min_stake_amount: number;
  max_stake_amount?: number;
  lock_period_days: number;
  total_staked: number;
  rewards_pool: number;
  is_active: boolean;
}

export interface UserStake {
  id: string;
  program_id: string;
  amount: number;
  rewards_earned: number;
  staked_at: string;
  unlock_at?: string;
  last_reward_claim?: string;
  is_active: boolean;
  program?: StakingProgram;
}

export const useStaking = () => {
  const [programs, setPrograms] = useState<StakingProgram[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('staking_programs')
        .select('*')
        .eq('is_active', true)
        .order('apy', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching staking programs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch staking programs",
        variant: "destructive",
      });
    }
  };

  const fetchUserStakes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stakes')
        .select(`
          *,
          program:staking_programs(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setUserStakes(data || []);
    } catch (error) {
      console.error('Error fetching user stakes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your stakes",
        variant: "destructive",
      });
    }
  };

  const stakeTokens = async (programId: string, amount: number) => {
    if (!user) return;

    try {
      const program = programs.find(p => p.id === programId);
      if (!program) throw new Error('Program not found');

      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + program.lock_period_days);

      const { error } = await supabase
        .from('user_stakes')
        .insert({
          user_id: user.id,
          program_id: programId,
          amount,
          unlock_at: program.lock_period_days > 0 ? unlockDate.toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully staked ${amount} ${program.token_symbol}`,
      });

      await fetchUserStakes();
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast({
        title: "Error",
        description: "Failed to stake tokens",
        variant: "destructive",
      });
    }
  };

  const unstakeTokens = async (stakeId: string) => {
    try {
      const { error } = await supabase
        .from('user_stakes')
        .update({ is_active: false })
        .eq('id', stakeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tokens unstaked successfully",
      });

      await fetchUserStakes();
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast({
        title: "Error",
        description: "Failed to unstake tokens",
        variant: "destructive",
      });
    }
  };

  const claimRewards = async (stakeId: string) => {
    try {
      const { error } = await supabase
        .from('user_stakes')
        .update({
          last_reward_claim: new Date().toISOString(),
          rewards_earned: 0
        })
        .eq('id', stakeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      });

      await fetchUserStakes();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Error",
        description: "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  const calculateRewards = (stake: UserStake): number => {
    if (!stake.program) return 0;
    
    const stakingDays = Math.floor(
      (Date.now() - new Date(stake.staked_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const annualReward = (stake.amount * stake.program.apy) / 100;
    const dailyReward = annualReward / 365;
    
    return dailyReward * stakingDays;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPrograms();
      if (user) {
        await fetchUserStakes();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    programs,
    userStakes,
    loading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    calculateRewards,
    refetch: () => {
      fetchPrograms();
      if (user) fetchUserStakes();
    }
  };
};