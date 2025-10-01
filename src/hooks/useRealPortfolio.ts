import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Holding {
  id: string;
  user_id: string;
  agent_id: string;
  quantity: number;
  average_buy_price: number;
  total_invested: number;
  realized_pnl: number;
  created_at: string;
  updated_at: string;
  agent: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    avatar_url: string;
    change_24h: number;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  agent_id: string;
  order_id: string | null;
  type: string;
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  status: string;
  created_at: string;
  agent: {
    name: string;
    symbol: string;
  };
}

export const useRealPortfolio = () => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = async () => {
    if (!user) {
      setHoldings([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch holdings with agent data
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agent:agents (
            id,
            name,
            symbol,
            price,
            avatar_url,
            change_24h
          )
        `)
        .eq('user_id', user.id)
        .order('total_invested', { ascending: false });

      if (holdingsError) throw holdingsError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          agent:agents (
            name,
            symbol
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      setHoldings((holdingsData as any) || []);
      setTransactions((transactionsData as any) || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const holdingsChannel = supabase
      .channel('portfolio-holdings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_holdings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Holdings updated');
          fetchPortfolioData();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('portfolio-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('New transaction');
          fetchPortfolioData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(holdingsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user]);

  // Calculate portfolio metrics
  const portfolioValue = holdings.reduce((sum, holding) => {
    const currentValue = holding.quantity * parseFloat(holding.agent.price.toString());
    return sum + currentValue;
  }, 0);

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.total_invested, 0);
  const totalPnL = portfolioValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return {
    holdings,
    transactions,
    loading,
    portfolioValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    refreshPortfolio: fetchPortfolioData,
  };
};
