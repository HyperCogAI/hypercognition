import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTradingOperations, useOrderValidation, OrderData } from '@/hooks/useTradingOperations'
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
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Split into smaller, focused operations
  const { placeOrder, cancelOrder, getOrderHistory } = useTradingOperations(user?.id)
  const { validateOrderData } = useOrderValidation()

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const orderHistory = await getOrderHistory()
      setOrders(orderHistory as Order[])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  // Enhanced order placement with validation
  const createOrder = async (orderData: OrderData) => {
    const validation = validateOrderData(orderData)
    if (!validation.isValid) {
      toast({
        title: "Invalid Order",
        description: validation.errors.join(', '),
        variant: "destructive"
      })
      return null
    }

    try {
      const result = await placeOrder(orderData)
      if (result) {
        toast({
          title: "Order Placed",
          description: `${orderData.side} order for ${orderData.amount} placed successfully`,
        })
        await fetchOrders() // Refresh orders
      }
      return result
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Enhanced order cancellation
  const removeOrder = async (orderId: string) => {
    try {
      const result = await cancelOrder(orderId)
      if (result) {
        toast({
          title: "Order Cancelled",
          description: "Order cancelled successfully",
        })
        await fetchOrders() // Refresh orders
      }
      return result
    } catch (error) {
      console.error('Error cancelling order:', error)
      return null
    }
  }

  // Get orders by status
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status)
  }

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: getOrdersByStatus('pending').length,
    filled: getOrdersByStatus('filled').length,
    cancelled: getOrdersByStatus('cancelled').length,
    totalValue: orders.reduce((sum, order) => sum + (order.amount * (order.price || 0)), 0)
  }

  return {
    orders,
    isLoading,
    placeOrder: createOrder,
    cancelOrder: removeOrder,
    createOrder,
    removeOrder,
    fetchOrders,
    getOrdersByStatus,
    orderStats,
    validateOrderData
  }
}