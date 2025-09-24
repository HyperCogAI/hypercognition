import { supabase } from '@/integrations/supabase/client'

export class DatabaseService {
  // Agent Services
  static async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('market_cap', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getAgent(id: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async updateAgentPrice(agentId: string, priceData: {
    price: number
    volume_24h: number
    change_24h: number
    market_cap: number
  }) {
    const { data, error } = await supabase
      .from('agents')
      .update(priceData)
      .eq('id', agentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Portfolio Services
  static async getUserPortfolio(userId: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  }

  static async addPortfolioHolding(userId: string, agentId: string, amount: number, purchasePrice: number) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        agent_id: agentId,
        amount,
        purchase_price: purchasePrice,
        purchase_date: new Date().toISOString()
      })
      .select(`
        *,
        agent:agents(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }

  static async updatePortfolioHolding(id: string, amount: number) {
    const { data, error } = await supabase
      .from('portfolios')
      .update({ amount, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        agent:agents(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }

  // Order Services
  static async createOrder(orderData: {
    user_id: string
    agent_id: string
    type: string
    side: string
    amount: number
    price?: number
    stop_loss_price?: number
    take_profit_price?: number
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select(`
        *,
        agent:agents(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserOrders(userId: string, status?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        agent:agents(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async updateOrderStatus(orderId: string, status: string, filledAmount?: number) {
    const updateData: any = { status, updated_at: new Date().toISOString() }
    if (filledAmount !== undefined) {
      updateData.filled_amount = filledAmount
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        agent:agents(*)
      `)
      .single()
    
    if (error) throw error
    return data
  }

  // Notification Services
  static async createNotification(userId: string, notification: {
    type: string
    category: string
    priority: string
    title: string
    message: string
    action_url?: string
    data?: any
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (unreadOnly) {
      query = query.eq('read', false)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}