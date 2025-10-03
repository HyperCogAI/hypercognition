import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UserReferral {
  id: string;
  user_id: string;
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralConversion {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'credited';
  reward_amount: number;
  created_at: string;
  credited_at?: string;
  metadata: any;
}

export interface ReferralReward {
  id: string;
  user_id: string;
  conversion_id?: string;
  reward_type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  paid_at?: string;
  metadata: any;
}

export interface LeaderboardEntry {
  user_id: string;
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  rank: number;
}

export const useReferrals = () => {
  const [userReferral, setUserReferral] = useState<UserReferral | null>(null);
  const [conversions, setConversions] = useState<ReferralConversion[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUserReferral = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // User doesn't have a referral code yet, it will be created automatically
        if (error.code === 'PGRST116') {
          return;
        }
        throw error;
      }

      setUserReferral(data);
    } catch (error) {
      console.error('Error fetching user referral:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral data",
        variant: "destructive",
      });
    }
  };

  const fetchConversions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_conversions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversions((data || []).map(d => ({
        ...d,
        status: d.status as 'pending' | 'completed' | 'credited'
      })));
    } catch (error) {
      console.error('Error fetching conversions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral conversions",
        variant: "destructive",
      });
    }
  };

  const fetchRewards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards((data || []).map(d => ({
        ...d,
        status: d.status as 'pending' | 'paid' | 'cancelled'
      })));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rewards",
        variant: "destructive",
      });
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_referral_leaderboard', { limit_count: 10 });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const applyReferralCode = async (referralCode: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use a referral code",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .rpc('process_referral_conversion', {
          p_referred_user_id: user.id,
          p_referral_code: referralCode
        });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; reward_amount?: number; conversion_id?: string };

      if (result.success) {
        toast({
          title: "Success",
          description: `Referral code applied! You've earned $${result.reward_amount}`,
        });
        await refetch();
        return { success: true, data: result };
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to apply referral code",
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply referral code",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const claimReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('referral_rewards')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', rewardId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward claimed successfully",
      });

      await fetchRewards();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    await Promise.all([
      fetchUserReferral(),
      fetchConversions(),
      fetchRewards(),
      fetchLeaderboard()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    refetch();
  }, [user]);

  return {
    userReferral,
    conversions,
    rewards,
    leaderboard,
    loading,
    applyReferralCode,
    claimReward,
    refetch
  };
};
