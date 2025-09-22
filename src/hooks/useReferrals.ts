import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralCode {
  id: string;
  code: string;
  uses_count: number;
  max_uses?: number;
  reward_percentage: number;
  is_active: boolean;
  expires_at?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  reward_amount: number;
  reward_claimed: boolean;
  created_at: string;
  claimed_at?: string;
}

export const useReferrals = () => {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReferralCodes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferralCodes(data || []);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral codes",
        variant: "destructive",
      });
    }
  };

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Calculate total earnings
      const total = data?.reduce((sum, referral) => {
        return sum + (referral.reward_claimed ? referral.reward_amount : 0);
      }, 0) || 0;
      setTotalEarnings(total);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referrals",
        variant: "destructive",
      });
    }
  };

  const generateReferralCode = async (maxUses?: number, rewardPercentage: number = 5) => {
    if (!user) return;

    try {
      const code = `REF${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code,
          max_uses: maxUses,
          reward_percentage: rewardPercentage
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral code generated successfully",
      });

      await fetchReferralCodes();
      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive",
      });
    }
  };

  const deactivateReferralCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral code deactivated",
      });

      await fetchReferralCodes();
    } catch (error) {
      console.error('Error deactivating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate referral code",
        variant: "destructive",
      });
    }
  };

  const claimReward = async (referralId: string) => {
    try {
      const { error } = await supabase
        .from('referrals')
        .update({
          reward_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq('id', referralId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Referral reward claimed successfully",
      });

      await fetchReferrals();
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  const validateReferralCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      // Check if code is still valid
      if (data.max_uses && data.uses_count >= data.max_uses) {
        return { valid: false, reason: 'Code has reached maximum uses' };
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, reason: 'Code has expired' };
      }

      return { valid: true, code: data };
    } catch (error) {
      return { valid: false, reason: 'Invalid referral code' };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([
        fetchReferralCodes(),
        fetchReferrals()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    referralCodes,
    referrals,
    totalEarnings,
    loading,
    generateReferralCode,
    deactivateReferralCode,
    claimReward,
    validateReferralCode,
    refetch: () => {
      if (user) {
        fetchReferralCodes();
        fetchReferrals();
      }
    }
  };
};