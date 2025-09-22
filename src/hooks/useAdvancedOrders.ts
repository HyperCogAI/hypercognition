import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type OrderRow = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderExecutionRow = Database['public']['Tables']['order_executions']['Row']

export interface AdvancedOrder extends OrderRow {}

export function useAdvancedOrders() {
  const [orders, setOrders] = useState<AdvancedOrder[]>([])
  const [executions, setExecutions] = useState<OrderExecutionRow[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch user's orders
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    }
  }

  // Fetch order executions
  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('order_executions')
        .select('*')
        .order('execution_time', { ascending: false })
        .limit(100)

      if (error) throw error
      setExecutions(data || [])
    } catch (error) {
      console.error('Error fetching executions:', error)
    }
  }

  // Create advanced order
  const createOrder = async (orderData: OrderInsert) => {
    try {
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

      toast({
        title: "Order Created",
        description: `${orderData.side?.toUpperCase()} order for ${orderData.amount} tokens created successfully`
      })

      await fetchOrders()
      return data
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      })
      throw error
    }
  }

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: "Order Cancelled",
        description: "Order cancelled successfully"
      })

      await fetchOrders()
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      })
    }
  }

  // Modify order
  const modifyOrder = async (orderId: string, updates: Partial<AdvancedOrder>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: "Order Modified",
        description: "Order updated successfully"
      })

      await fetchOrders()
    } catch (error) {
      console.error('Error modifying order:', error)
      toast({
        title: "Error",
        description: "Failed to modify order",
        variant: "destructive"
      })
    }
  }

  // Set up real-time subscriptions
  useEffect(() => {
    fetchOrders()
    fetchExecutions()

    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    // Subscribe to order executions
    const executionsChannel = supabase
      .channel('executions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_executions'
        },
        () => {
          fetchExecutions()
        }
      )
      .subscribe()

    setLoading(false)

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(executionsChannel)
    }
  }, [])

  return {
    orders,
    executions,
    loading,
    createOrder,
    cancelOrder,
    modifyOrder,
    refreshOrders: fetchOrders,
    refreshExecutions: fetchExecutions
  }
}