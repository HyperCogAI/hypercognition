import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export type OrderType = 'market' | 'limit' | 'stop_loss' | 'take_profit'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'pending' | 'filled' | 'cancelled' | 'expired'

export interface Order {
  id: string
  user_id: string
  agent_id: string
  type: OrderType
  side: OrderSide
  amount: number
  price?: number
  trigger_price?: number
  status: OrderStatus
  filled_amount: number
  created_at: string
  updated_at: string
  expires_at?: string
  fill_or_kill: boolean
  agent?: any
}

export const useAdvancedTrading = () => {
  const { user, isConnected } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`*, agent:agents(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders((data || []) as Order[])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Place order
  const placeOrder = async (orderData: {
    agent_id: string
    type: OrderType
    side: OrderSide
    amount: number
    price?: number
    trigger_price?: number
    expires_at?: string
    fill_or_kill?: boolean
  }) => {
    if (!user || !isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return false
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Order placed successfully",
        description: `${orderData.side.toUpperCase()} ${orderData.type} order for ${orderData.amount} tokens`,
      })

      // Refresh orders
      fetchOrders()
      return true
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: "Failed to place order",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user?.id)

      if (error) throw error

      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully",
      })

      fetchOrders()
      return true
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast({
        title: "Failed to cancel order",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  // Get order book (simulated for now)
  const getOrderBook = async (agentId: string) => {
    // In a real implementation, this would fetch from a proper order book
    // For now, we'll simulate order book data
    return {
      bids: [
        { price: 0.95, amount: 1000, total: 950 },
        { price: 0.94, amount: 1500, total: 1410 },
        { price: 0.93, amount: 2000, total: 1860 },
      ],
      asks: [
        { price: 1.05, amount: 800, total: 840 },
        { price: 1.06, amount: 1200, total: 1272 },
        { price: 1.07, amount: 1800, total: 1926 },
      ]
    }
  }

  useEffect(() => {
    if (isConnected && user) {
      fetchOrders()
    }
  }, [isConnected, user])

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Order update:', payload)
          fetchOrders() // Refresh orders on any change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    orders,
    isLoading,
    placeOrder,
    cancelOrder,
    getOrderBook,
    fetchOrders
  }
}