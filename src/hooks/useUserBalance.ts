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
      setBalance(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'USD')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No balance found, initialize it
          await initializeBalance();
        } else {
          throw error;
        }
      } else {
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
    try {
      const { data, error } = await supabase.functions.invoke('initialize-balance');

      if (error) throw error;

      if (data.success && data.balance) {
        setBalance(data.balance);
        toast({
          title: "Welcome!",
          description: "Your trading account has been initialized with $10,000",
        });
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
