import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CopyTradeExecution {
  id: string;
  original_order_id: string;
  copy_order_id: string;
  trader_id: string;
  follower_id: string;
  amount: number;
  price: number;
  executed_at: string;
  status: 'success' | 'failed' | 'pending';
}

interface CopyTradingStats {
  totalCopyTrades: number;
  successfulTrades: number;
  totalVolume: number;
  averageLatency: number;
}

export const useCopyTradingEngine = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recentExecutions, setRecentExecutions] = useState<CopyTradeExecution[]>([]);
  const [stats, setStats] = useState<CopyTradingStats>({
    totalCopyTrades: 0,
    successfulTrades: 0,
    totalVolume: 0,
    averageLatency: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Monitor for new orders that should trigger copy trades
  useEffect(() => {
    if (!isMonitoring) return;

    const channel = supabase
      .channel('copy-trading-monitor')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.filled'
        },
        async (payload) => {
          const order = payload.new;
          console.log('Order filled, checking for copy trades:', order);
          
          // Only process orders that aren't already copy trades
          if (order.order_source !== 'copy_trade') {
            await triggerCopyTrade(order.id, order.user_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMonitoring]);

  const triggerCopyTrade = async (originalOrderId: string, traderId: string) => {
    try {
      console.log('Triggering copy trade for order:', originalOrderId);
      
      const { data, error } = await supabase.functions.invoke('copy-trading-engine', {
        body: {
          originalOrderId,
          traderId
        }
      });

      if (error) {
        console.error('Error triggering copy trade:', error);
        toast({
          title: "Copy Trade Error",
          description: "Failed to process copy trades",
          variant: "destructive"
        });
        return;
      }

      if (data.copyTradesExecuted > 0) {
        toast({
          title: "Copy Trades Executed",
          description: `${data.copyTradesExecuted} copy trades executed successfully`,
          variant: "default"
        });
        
        // Refresh recent executions
        await fetchRecentExecutions();
        await fetchStats();
      }

    } catch (error) {
      console.error('Error in triggerCopyTrade:', error);
    }
  };

  const fetchRecentExecutions = useCallback(async () => {
    try {
      // Fetch recent copy trade orders
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          parent_order_id,
          user_id,
          agent_id,
          amount,
          price,
          created_at,
          status,
          agents(name, symbol)
        `)
        .eq('order_source', 'copy_trade')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recent executions:', error);
        return;
      }

      // Transform data for display
      const executions: CopyTradeExecution[] = data.map(order => ({
        id: order.id,
        original_order_id: order.parent_order_id || '',
        copy_order_id: order.id,
        trader_id: '', // We'd need to join with original order to get this
        follower_id: order.user_id,
        amount: order.amount,
        price: order.price || 0,
        executed_at: order.created_at,
        status: order.status === 'filled' ? 'success' : 'pending'
      }));

      setRecentExecutions(executions);
    } catch (error) {
      console.error('Error fetching recent executions:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      // Get copy trading statistics
      const { data, error } = await supabase
        .from('orders')
        .select('amount, price, status, created_at')
        .eq('order_source', 'copy_trade');

      if (error) {
        console.error('Error fetching copy trading stats:', error);
        return;
      }

      const totalCopyTrades = data.length;
      const successfulTrades = data.filter(order => order.status === 'filled').length;
      const totalVolume = data.reduce((sum, order) => sum + (order.amount * (order.price || 0)), 0);

      setStats({
        totalCopyTrades,
        successfulTrades,
        totalVolume,
        averageLatency: 0.5 // Simulated latency in seconds
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    setLoading(true);
    try {
      await fetchRecentExecutions();
      await fetchStats();
      setIsMonitoring(true);
      toast({
        title: "Copy Trading Engine Started",
        description: "Now monitoring for copy trading opportunities",
        variant: "default"
      });
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to start copy trading engine",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchRecentExecutions, fetchStats, toast]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    toast({
      title: "Copy Trading Engine Stopped",
      description: "No longer monitoring for copy trades",
      variant: "default"
    });
  }, [toast]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRecentExecutions(), fetchStats()]);
    } finally {
      setLoading(false);
    }
  }, [fetchRecentExecutions, fetchStats]);

  return {
    isMonitoring,
    recentExecutions,
    stats,
    loading,
    startMonitoring,
    stopMonitoring,
    refreshData,
    triggerCopyTrade
  };
};