import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserBalance {
  id: string;
  user_id: string;
  currency: string;
  available_balance: number;
  locked_balance: number;
  total_balance: number;
}

export const useUserBalance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      console.log('useUserBalance: No user found');
      setBalance(null);
      setLoading(false);
      return;
    }

    console.log('useUserBalance: Fetching balance for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .maybeSingle();

      if (error) {
        console.error('useUserBalance: Error fetching balance:', error);
        throw error;
      }

      if (!data) {
        console.log('useUserBalance: No balance found, initializing...');
        // No balance found, initialize it
        await initializeBalance();
      } else {
        console.log('useUserBalance: Balance found:', data);
        setBalance(data);
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeBalance = async () => {
    console.log('useUserBalance: Calling initialize-balance edge function...');
    try {
      const { data, error } = await supabase.functions.invoke('initialize-balance');

      console.log('useUserBalance: Initialize-balance response:', { data, error });

      if (error) throw error;

      if (data?.success && data?.balance) {
        console.log('useUserBalance: Balance initialized successfully:', data.balance);
        setBalance(data.balance);
        toast({
          title: "Welcome!",
          description: "Your trading account has been initialized with $10,000",
        });
      } else {
        console.error('useUserBalance: Unexpected response from initialize-balance:', data);
      }
    } catch (error: any) {
      console.error('Error initializing balance:', error);
      toast({
        title: "Error",
        description: "Failed to initialize balance",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Subscribe to real-time balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_balances',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance updated:', payload);
          setBalance(payload.new as UserBalance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    balance,
    loading,
    refreshBalance: fetchBalance,
  };
};
