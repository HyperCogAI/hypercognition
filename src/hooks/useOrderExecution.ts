import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderParams {
  agent_id: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  time_in_force?: 'GTC' | 'IOC' | 'FOK' | 'DAY';
}

interface OrderResult {
  success: boolean;
  order: any;
  execution_price: number;
  fees: number;
  net_amount: number;
}

export const useOrderExecution = () => {
  const { toast } = useToast();
  const [isExecuting, setIsExecuting] = useState(false);

  const executeOrder = async (params: OrderParams): Promise<OrderResult | null> => {
    setIsExecuting(true);

    try {
      console.log('Executing order:', params);

      const { data, error } = await supabase.functions.invoke('process-order', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success) {
        toast({
          title: "Order Executed",
          description: `${params.side.toUpperCase()} ${params.amount} @ $${data.execution_price.toFixed(2)}`,
        });

        return data as OrderResult;
      }

      return null;
    } catch (error: any) {
      console.error('Order execution error:', error);
      
      let errorMessage = 'Failed to execute order';
      if (error.message.includes('Insufficient balance')) {
        errorMessage = 'Insufficient balance to complete this order';
      } else if (error.message.includes('Insufficient holdings')) {
        errorMessage = 'You don\'t have enough to sell';
      }

      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  const placeBuyOrder = async (agent_id: string, amount: number, price?: number) => {
    return executeOrder({
      agent_id,
      type: price ? 'limit' : 'market',
      side: 'buy',
      amount,
      price,
    });
  };

  const placeSellOrder = async (agent_id: string, amount: number, price?: number) => {
    return executeOrder({
      agent_id,
      type: price ? 'limit' : 'market',
      side: 'sell',
      amount,
      price,
    });
  };

  return {
    executeOrder,
    placeBuyOrder,
    placeSellOrder,
    isExecuting,
  };
};
