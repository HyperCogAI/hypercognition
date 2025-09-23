import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Holding {
  id: string;
  user_id: string;
  agent_id: string;
  total_amount: number;
  average_buy_price: number;
  total_invested: number;
  unrealized_pnl: number;
  realized_pnl: number;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    change_24h: number;
    avatar_url?: string;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  agent_id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total_value: number;
  fees: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transaction_hash?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    avatar_url?: string;
  };
}

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  change24h: number;
  change24hPercent: number;
  holdingsCount: number;
  bestPerformer?: Holding;
  worstPerformer?: Holding;
}

export const usePortfolioSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch holdings with agent data
  const fetchHoldings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agent:agents (
            id,
            name,
            symbol,
            price,
            change_24h,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('total_invested', { ascending: false });

      if (error) throw error;
      
      // Transform to match interface
      const transformedHoldings = (data || []).map((h: any) => ({
        ...h,
        average_buy_price: h.average_cost || 0,
        last_transaction_at: h.last_updated,
        created_at: new Date().toISOString(),
        updated_at: h.last_updated || new Date().toISOString()
      }));
      
      setHoldings(transformedHoldings);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  }, [user?.id]);

  // Fetch transactions with agent data
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          agent:agents (
            id,
            name,
            symbol,
            price,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform to match interface
      const transformedTransactions = (data || []).map((t: any) => ({
        ...t,
        type: t.type as 'buy' | 'sell',
        price: t.price_per_token || 0,
        fees: t.gas_fee || 0,
        status: t.status as 'pending' | 'completed' | 'failed' | 'cancelled',
        updated_at: t.created_at
      }));
      
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [user?.id]);

  // Calculate portfolio statistics
  const calculateStats = useCallback(() => {
    if (holdings.length === 0) {
      setStats({
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalRealizedPnL: 0,
        totalUnrealizedPnL: 0,
        change24h: 0,
        change24hPercent: 0,
        holdingsCount: 0
      });
      return;
    }

    const totalValue = holdings.reduce((sum, h) => sum + (h.total_amount * (h.agent?.price || 0)), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0);
    const totalRealizedPnL = holdings.reduce((sum, h) => sum + h.realized_pnl, 0);
    const totalUnrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealized_pnl, 0);
    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

    // Calculate 24h change
    const change24h = holdings.reduce((sum, h) => {
      const currentValue = h.total_amount * (h.agent?.price || 0);
      const change24hPercent = h.agent?.change_24h || 0;
      return sum + (currentValue * change24hPercent / 100);
    }, 0);

    const change24hPercent = totalValue > 0 ? (change24h / totalValue) * 100 : 0;

    // Find best and worst performers
    const performanceMap = holdings.map(h => ({
      ...h,
      performance: h.unrealized_pnl / h.total_invested * 100
    }));

    const bestPerformer = performanceMap.reduce((best, current) => 
      current.performance > best.performance ? current : best, performanceMap[0]);

    const worstPerformer = performanceMap.reduce((worst, current) => 
      current.performance < worst.performance ? current : worst, performanceMap[0]);

    setStats({
      totalValue,
      totalInvested,
      totalPnL,
      totalRealizedPnL,
      totalUnrealizedPnL,
      change24h,
      change24hPercent,
      holdingsCount: holdings.length,
      bestPerformer: bestPerformer,
      worstPerformer: worstPerformer
    });
  }, [holdings]);

  // Execute a buy transaction
  const executeBuy = useCallback(async (agentId: string, amount: number, price: number) => {
    if (!user?.id) return null;

    try {
      const totalValue = amount * price;
      const fees = totalValue * 0.001; // 0.1% fee

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          agent_id: agentId,
          type: 'buy',
          amount,
          price_per_token: price,
          total_value: totalValue,
          gas_fee: fees,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update or create holding
      const { data: existingHolding } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', agentId)
        .single();

      if (existingHolding) {
        // Update existing holding
        const newTotalAmount = existingHolding.total_amount + amount;
        const newTotalInvested = existingHolding.total_invested + totalValue;
        const newAverageBuyPrice = newTotalInvested / newTotalAmount;

        await supabase
          .from('user_holdings')
          .update({
            total_amount: newTotalAmount,
            average_cost: newAverageBuyPrice,
            total_invested: newTotalInvested,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingHolding.id);
      } else {
        // Create new holding
        await supabase
          .from('user_holdings')
          .insert([{
            user_id: user.id,
            agent_id: agentId,
            total_amount: amount,
            average_cost: price,
            total_invested: totalValue,
            last_updated: new Date().toISOString()
          }]);
      }

      // Refresh data
      await Promise.all([fetchHoldings(), fetchTransactions()]);

      toast({
        title: "Purchase Successful",
        description: `Bought ${amount} tokens at $${price.toFixed(4)} each`,
      });

      return data;
    } catch (error) {
      console.error('Error executing buy:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to execute buy order",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, fetchHoldings, fetchTransactions, toast]);

  // Execute a sell transaction
  const executeSell = useCallback(async (agentId: string, amount: number, price: number) => {
    if (!user?.id) return null;

    try {
      // Check if user has enough holdings
      const { data: holding } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', agentId)
        .single();

      if (!holding || holding.total_amount < amount) {
        throw new Error('Insufficient holdings');
      }

      const totalValue = amount * price;
      const fees = totalValue * 0.001; // 0.1% fee
      const netValue = totalValue - fees;

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          agent_id: agentId,
          type: 'sell',
          amount,
          price_per_token: price,
          total_value: totalValue,
          gas_fee: fees,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update holding
      const newTotalAmount = holding.total_amount - amount;
      const soldCostBasis = amount * (holding.average_cost || 0);
      const realizedPnL = netValue - soldCostBasis;

      if (newTotalAmount > 0) {
        await supabase
          .from('user_holdings')
          .update({
            total_amount: newTotalAmount,
            total_invested: holding.total_invested - soldCostBasis,
            realized_pnl: holding.realized_pnl + realizedPnL,
            last_updated: new Date().toISOString()
          })
          .eq('id', holding.id);
      } else {
        // Remove holding if no tokens left
        await supabase
          .from('user_holdings')
          .delete()
          .eq('id', holding.id);
      }

      // Refresh data
      await Promise.all([fetchHoldings(), fetchTransactions()]);

      toast({
        title: "Sale Successful",
        description: `Sold ${amount} tokens at $${price.toFixed(4)} each`,
      });

      return data;
    } catch (error) {
      console.error('Error executing sell:', error);
      toast({
        title: "Sale Failed",
        description: error instanceof Error ? error.message : "Failed to execute sell order",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, fetchHoldings, fetchTransactions, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('portfolio-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_holdings',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHoldings();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchHoldings, fetchTransactions]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      Promise.all([fetchHoldings(), fetchTransactions()])
        .finally(() => setIsLoading(false));
    }
  }, [user?.id, fetchHoldings, fetchTransactions]);

  // Calculate stats when holdings change
  useEffect(() => {
    calculateStats();
  }, [holdings, calculateStats]);

  return {
    holdings,
    transactions,
    stats,
    isLoading,
    executeBuy,
    executeSell,
    refetch: () => Promise.all([fetchHoldings(), fetchTransactions()])
  };
};