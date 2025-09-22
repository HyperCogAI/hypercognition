import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface AdvancedOrder {
  id?: string
  user_id: string
  agent_id: string
  type: 'market' | 'limit' | 'stop_market' | 'stop_limit' | 'trailing_stop'
  side: 'buy' | 'sell'
  amount: number
  price?: number
  trigger_price?: number
  stop_loss_price?: number
  take_profit_price?: number
  trailing_stop_percent?: number
  time_in_force: 'GTC' | 'IOC' | 'FOK' | 'DAY'
  expires_at?: string
  fill_or_kill?: boolean
  reduce_only?: boolean
  order_source?: string
}

export interface OrderExecution {
  id: string
  order_id: string
  execution_type: 'partial' | 'full' | 'cancelled' | 'expired'
  executed_amount: number
  executed_price?: number
  fee_amount: number
  execution_time: string
  details: Record<string, any>
}

export function useAdvancedOrders() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch user's orders with executions
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['advanced-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  })

  // Create advanced order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: AdvancedOrder) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          status: 'pending',
          filled_amount: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-orders'] })
      toast({
        title: "Order Created",
        description: "Your advanced order has been placed successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Cancel order
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-orders'] })
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Modify order
  const modifyOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<AdvancedOrder> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .eq('user_id', user?.id)
        .eq('status', 'pending') // Only allow modification of pending orders
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-orders'] })
      toast({
        title: "Order Modified",
        description: "Order has been updated successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Modification Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const activeOrders = orders.filter(o => ['pending', 'partial'].includes(o.status))
    const filledOrders = orders.filter(o => o.status === 'filled')
    const cancelledOrders = orders.filter(o => o.status === 'cancelled')
    
    const totalVolume = filledOrders.reduce((sum, order) => {
      return sum + (order.filled_amount * (order.price || 0))
    }, 0)
    
    const avgFillPrice = filledOrders.length > 0 
      ? filledOrders.reduce((sum, order) => sum + (order.price || 0), 0) / filledOrders.length
      : 0

    const successRate = orders.length > 0 
      ? (filledOrders.length / (filledOrders.length + cancelledOrders.length)) * 100
      : 0

    return {
      activeOrders: activeOrders.length,
      filledOrders: filledOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalVolume,
      avgFillPrice,
      successRate
    }
  }, [orders])

  // Get orders by status
  const getOrdersByStatus = useCallback((status: string) => {
    return orders.filter(order => order.status === status)
  }, [orders])

  // Get orders by type
  const getOrdersByType = useCallback((type: string) => {
    return orders.filter(order => order.type === type)
  }, [orders])

  // Execute market order immediately (simulation)
  const executeMarketOrder = useCallback(async (orderData: AdvancedOrder) => {
    try {
      // Get current market price
      const { data: agent, error } = await supabase
        .from('agents')
        .select('price')
        .eq('id', orderData.agent_id)
        .single()

      if (error) throw error

      const executionPrice = agent.price
      const executionAmount = orderData.amount

      // Create the order as filled
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          price: executionPrice,
          status: 'filled',
          filled_amount: executionAmount
        })
        .select()
        .single()

      if (orderError) throw orderError

      queryClient.invalidateQueries({ queryKey: ['advanced-orders'] })
      
      toast({
        title: "Market Order Executed",
        description: `${orderData.side.toUpperCase()} ${executionAmount} at $${executionPrice.toFixed(4)}`,
      })

      return newOrder
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }, [queryClient, toast])

  return {
    orders,
    isLoading,
    createOrder: createOrderMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,
    modifyOrder: modifyOrderMutation.mutate,
    executeMarketOrder,
    getOrderStats,
    getOrdersByStatus,
    getOrdersByType,
    isCreating: createOrderMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    isModifying: modifyOrderMutation.isPending
  }
}