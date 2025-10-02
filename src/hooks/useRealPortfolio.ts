import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioService, PortfolioHolding } from '@/services/PortfolioService';
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
      setLoading(false);
      return;
    }

    try {
      // Fetch holdings from new portfolio service
      const holdingsData = await portfolioService.getHoldings(user.id);
      
      // Map to legacy format for compatibility
      const mappedHoldings: Holding[] = holdingsData.map(h => ({
        id: h.id,
        user_id: h.user_id,
        agent_id: h.asset_id,
        quantity: h.quantity,
        average_buy_price: h.average_buy_price,
        total_invested: h.total_invested,
        realized_pnl: h.realized_pnl,
        created_at: h.created_at,
        updated_at: h.updated_at,
        agent: {
          id: h.asset_id,
          name: h.asset_name,
          symbol: h.asset_symbol,
          price: h.current_value / h.quantity,
          avatar_url: '/placeholder.svg',
          change_24h: 0
        }
      }));

      setHoldings(mappedHoldings);
      
      // Fetch transactions
      const transactionsData = await portfolioService.getTransactions(user.id, 50);
      const mappedTransactions: Transaction[] = transactionsData.map(t => ({
        id: t.id,
        user_id: t.user_id,
        agent_id: t.asset_id,
        order_id: null,
        type: t.transaction_type,
        quantity: t.quantity,
        price: t.price,
        total_amount: t.total_amount,
        fees: t.fees,
        status: 'completed',
        created_at: t.created_at,
        agent: {
          name: t.asset_name,
          symbol: t.asset_symbol
        }
      }));

      setTransactions(mappedTransactions);
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
      .channel('portfolio-holdings-new')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_holdings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchPortfolioData();
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('portfolio-transactions-new')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
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
