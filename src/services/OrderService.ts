import { supabase } from '@/integrations/supabase/client'

export interface Order {
  id: string
  user_id: string
  agent_id: string
  type: 'market' | 'limit' | 'stop_market' | 'stop_limit'
  side: 'buy' | 'sell'
  amount: number
  price?: number
  trigger_price?: number
  status: 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected'
  filled_amount: number
  average_fill_price?: number
  fees: number
  stop_loss_price?: number
  take_profit_price?: number
  time_in_force: string
  order_source?: string
  reduce_only?: boolean
  parent_order_id?: string
  trailing_stop_percent?: number
  trailing_stop_price?: number
  fill_or_kill?: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  order_id: string
  agent_id: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  total_amount: number
  fees: number
  pnl?: number
  exchange?: string
  executed_at: string
  created_at: string
}

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(params: {
    agentId: string
    orderType: 'market' | 'limit' | 'stop_market' | 'stop_limit'
    side: 'buy' | 'sell'
    amount: number
    price?: number
    stopPrice?: number
    stopLossPrice?: number
    takeProfitPrice?: number
    timeInForce?: 'GTC' | 'IOC' | 'FOK'
    exchange?: string
    notes?: string
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Fetch agent for price info
      const { data: agent } = await supabase
        .from('agents')
        .select('price')
        .eq('id', params.agentId)
        .single()

      if (!agent) {
        return { success: false, error: 'Agent not found' }
      }

      const executionPrice = params.orderType === 'market' ? agent.price : (params.price || 0)
      const fees = params.amount * executionPrice * 0.001 // 0.1% fee

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          agent_id: params.agentId,
          type: params.orderType,
          side: params.side,
          amount: params.amount,
          price: params.price,
          trigger_price: params.stopPrice,
          status: params.orderType === 'market' ? 'pending' : 'open',
          fees,
          stop_loss_price: params.stopLossPrice,
          take_profit_price: params.takeProfitPrice,
          time_in_force: params.timeInForce || 'GTC'
        } as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        return { success: false, error: error.message }
      }

      // For market orders, immediately execute
      if (params.orderType === 'market') {
        const executeResult = await this.executeOrder(order.id)
        if (!executeResult.success) {
          return { success: false, error: executeResult.error }
        }
      }

      return { success: true, order: order as any }
    } catch (error: any) {
      console.error('Error in createOrder:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Execute an order via edge function
   */
  async executeOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-order', {
        body: { orderId, action: 'execute' }
      })

      if (error) {
        console.error('Error executing order:', error)
        return { success: false, error: error.message }
      }

      if (data?.error) {
        return { success: false, error: data.error }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error in executeOrder:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('process-order', {
        body: { orderId, action: 'cancel' }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error in cancelOrder:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user's orders
   */
  async getOrders(userId: string, limit: number = 50): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return (data || []) as any as Order[]
  }

  /**
   * Get user's trades
   */
  async getTrades(userId: string, limit: number = 50): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades' as any)
      .select('*')
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching trades:', error)
      return []
    }

    return (data || []) as any as Trade[]
  }
}

export const orderService = new OrderService()