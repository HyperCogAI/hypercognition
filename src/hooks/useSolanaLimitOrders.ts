import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SolanaLimitOrder {
  id: string;
  user_id: string;
  pool_id: string;
  order_type: 'buy' | 'sell';
  token_in: string;
  token_out: string;
  mint_in: string;
  mint_out: string;
  amount_in: number;
  limit_price: number;
  amount_out: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired' | 'partial';
  filled_amount: number;
  filled_at?: string;
  expires_at?: string;
  slippage_tolerance: number;
  created_at: string;
  updated_at: string;
}

export interface SolanaOrderBookData {
  bid_price: number;
  ask_price: number;
  bid_volume: number;
  ask_volume: number;
  spread: number;
}

export const useSolanaLimitOrders = () => {
  const [orders, setOrders] = useState<SolanaLimitOrder[]>([]);
  const [orderBook, setOrderBook] = useState<SolanaOrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('solana_limit_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as SolanaLimitOrder[]);
    } catch (error) {
      console.error('Error fetching Solana limit orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch limit orders",
        variant: "destructive",
      });
    }
  };

  const fetchOrderBook = async (poolId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_solana_order_book_summary', { p_pool_id: poolId });

      if (error) throw error;
      if (data && data.length > 0) {
        setOrderBook(data[0]);
      }
    } catch (error) {
      console.error('Error fetching Solana order book:', error);
    }
  };

  const createLimitOrder = async (orderData: {
    pool_id: string;
    order_type: 'buy' | 'sell';
    token_in: string;
    token_out: string;
    mint_in: string;
    mint_out: string;
    amount_in: number;
    limit_price: number;
    amount_out: number;
    slippage_tolerance?: number;
    expires_at?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create limit orders",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('solana_limit_orders')
        .insert({
          user_id: user.id,
          ...orderData,
          slippage_tolerance: orderData.slippage_tolerance || 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Limit order created successfully",
      });

      // Trigger order matching
      await supabase.functions.invoke('process-solana-limit-orders', {
        body: { action: 'match_orders', poolId: orderData.pool_id }
      });

      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error creating Solana limit order:', error);
      toast({
        title: "Error",
        description: "Failed to create limit order",
        variant: "destructive",
      });
      return null;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('solana_limit_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order cancelled successfully",
      });

      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling Solana order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };

    loadData();

    const channel = supabase
      .channel('solana-limit-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solana_limit_orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    orderBook,
    loading,
    createLimitOrder,
    cancelOrder,
    fetchOrderBook,
    refetch: fetchOrders,
  };
};
