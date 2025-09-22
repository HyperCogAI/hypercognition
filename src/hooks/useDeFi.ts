import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface DeFiPool {
  id: string;
  name: string;
  type: string;
  base_token: string;
  quote_token: string;
  apy: number;
  tvl: number;
  rewards_token: string;
  pool_address?: string;
  is_active: boolean;
}

export interface UserDeFiPosition {
  id: string;
  pool_id: string;
  amount_deposited: number;
  rewards_earned: number;
  last_claim_at?: string;
  pool?: DeFiPool;
}

export const useDeFi = () => {
  const [pools, setPools] = useState<DeFiPool[]>([]);
  const [userPositions, setUserPositions] = useState<UserDeFiPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPools = async () => {
    try {
      const { data, error } = await supabase
        .from('defi_pools')
        .select('*')
        .eq('is_active', true)
        .order('tvl', { ascending: false });

      if (error) throw error;
      setPools(data || []);
    } catch (error) {
      console.error('Error fetching DeFi pools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch DeFi pools",
        variant: "destructive",
      });
    }
  };

  const fetchUserPositions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_defi_positions')
        .select(`
          *,
          pool:defi_pools(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPositions(data || []);
    } catch (error) {
      console.error('Error fetching user positions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your DeFi positions",
        variant: "destructive",
      });
    }
  };

  const depositToPool = async (poolId: string, amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_defi_positions')
        .upsert({
          user_id: user.id,
          pool_id: poolId,
          amount_deposited: amount
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully deposited to DeFi pool",
      });

      await fetchUserPositions();
    } catch (error) {
      console.error('Error depositing to pool:', error);
      toast({
        title: "Error",
        description: "Failed to deposit to pool",
        variant: "destructive",
      });
    }
  };

  const claimRewards = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('user_defi_positions')
        .update({
          last_claim_at: new Date().toISOString(),
          rewards_earned: 0
        })
        .eq('id', positionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rewards claimed successfully",
      });

      await fetchUserPositions();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Error",
        description: "Failed to claim rewards",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPools();
      if (user) {
        await fetchUserPositions();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    pools,
    userPositions,
    loading,
    depositToPool,
    claimRewards,
    refetch: () => {
      fetchPools();
      if (user) fetchUserPositions();
    }
  };
};