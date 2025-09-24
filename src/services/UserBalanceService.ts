import { supabase } from '@/integrations/supabase/client'
import { DatabaseService } from './DatabaseService'

export interface UserBalance {
  total_balance: number
  available_balance: number
  pending_balance: number
  currency: string
  last_updated: string
}

export interface Transaction {
  id: string
  user_id: string
  agent_id: string
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal'
  amount: number
  price: number
  total_value: number
  fee: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp: string
  agent?: {
    id: string
    name: string
    symbol: string
  }
}

export class UserBalanceService {
  // Create transactions table if needed
  static async createTransactionTable() {
    // Table creation would be handled via migrations
    // This is a placeholder for now
  }

  static async getUserBalance(userId: string): Promise<UserBalance> {
    // Get portfolio data without joins to avoid relation errors
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
    
    if (portfolioError) throw portfolioError

    // Get agent data separately
    const agentIds = portfolio?.map(p => p.agent_id) || []
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])
    
    // Calculate total portfolio value
    const portfolioValue = portfolio?.reduce((total, holding) => {
      const agent = agentMap.get(holding.agent_id)
      return total + (holding.amount * (agent?.price || 0))
    }, 0) || 0
    
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
    
    // Calculate pending orders value
    const pendingValue = orders?.reduce((total, order) => {
      return total + (order.amount * (order.price || 0))
    }, 0) || 0
    
    // For demo, assume user starts with $10,000 and can add more
    const initialBalance = 10000
    const totalSpent = portfolio?.reduce((total, holding) => {
      return total + (holding.amount * holding.purchase_price)
    }, 0) || 0
    
    const availableBalance = Math.max(0, initialBalance - totalSpent - pendingValue)
    
    return {
      total_balance: portfolioValue + availableBalance,
      available_balance: availableBalance,
      pending_balance: pendingValue,
      currency: 'USD',
      last_updated: new Date().toISOString()
    }
  }

  static async recordTransaction(
    userId: string,
    agentId: string,
    type: 'buy' | 'sell' | 'deposit' | 'withdrawal',
    amount: number,
    price: number,
    fee: number = 0
  ): Promise<Transaction> {
    const totalValue = amount * price
    
    // Insert into a transactions log (we'll use orders table for now)
    const transactionData = {
      user_id: userId,
      agent_id: agentId,
      type: type === 'buy' ? 'market' : 'market',
      side: type === 'buy' ? 'buy' : 'sell',
      amount,
      price,
      status: 'filled' as const,
      filled_amount: amount
    }
    
    const order = await DatabaseService.createOrder(transactionData)
    
    // Create notification for transaction
    await DatabaseService.createNotification(userId, {
      type: 'transaction',
      category: 'trading',
      priority: 'normal',
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Order Executed`,
      message: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} tokens at $${price}`,
      action_url: `/portfolio`,
      data: {
        orderId: order.id,
        agentId,
        amount,
        price,
        totalValue
      }
    })
    
    // Get agent data for proper symbol/name
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
    
    return {
      id: order.id,
      user_id: userId,
      agent_id: agentId,
      type,
      amount,
      price,
      total_value: totalValue,
      fee,
      status: 'completed',
      timestamp: order.created_at,
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        symbol: agent.symbol
      } : {
        id: agentId,
        name: 'Unknown',
        symbol: 'UNK'
      }
    }
  }

  static async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    // Get agent data for all orders
    const agentIds = orders?.map(o => o.agent_id) || []
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])
    
    return (orders || []).map(order => {
      const agent = agentMap.get(order.agent_id)
      return {
        id: order.id,
        user_id: order.user_id,
        agent_id: order.agent_id,
        type: order.side as 'buy' | 'sell',
        amount: order.amount,
        price: order.price || 0,
        total_value: order.amount * (order.price || 0),
        fee: 0,
        status: order.status === 'filled' ? 'completed' : order.status as any,
        timestamp: order.created_at,
        agent: agent ? {
          id: agent.id,
          name: agent.name,
          symbol: agent.symbol
        } : {
          id: order.agent_id,
          name: 'Unknown',
          symbol: 'UNK'
        }
      }
    })
  }

  static async getTransactionHistory(
    userId: string,
    agentId?: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Transaction[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    let query = orders || []
    if (agentId) query = query.filter(o => o.agent_id === agentId)
    if (type) query = query.filter(o => o.side === type)
    if (startDate) query = query.filter(o => o.created_at >= startDate)
    if (endDate) query = query.filter(o => o.created_at <= endDate)
    
    // Get agent data
    const agentIds = query.map(o => o.agent_id)
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])
    
    return query.map(order => {
      const agent = agentMap.get(order.agent_id)
      return {
        id: order.id,
        user_id: order.user_id,
        agent_id: order.agent_id,
        type: order.side as 'buy' | 'sell',
        amount: order.amount,
        price: order.price || 0,
        total_value: order.amount * (order.price || 0),
        fee: 0,
        status: order.status === 'filled' ? 'completed' : order.status as any,
        timestamp: order.created_at,
        agent: agent ? {
          id: agent.id,
          name: agent.name,
          symbol: agent.symbol
        } : {
          id: order.agent_id,
          name: 'Unknown',
          symbol: 'UNK'
        }
      }
    })
  }

  static async calculatePnL(userId: string, agentId?: string): Promise<{
    realized_pnl: number
    unrealized_pnl: number
    total_pnl: number
  }> {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    
    let filteredPortfolio = portfolio || []
    if (agentId) {
      filteredPortfolio = filteredPortfolio.filter(h => h.agent_id === agentId)
    }
    
    // Get agent data
    const agentIds = filteredPortfolio.map(p => p.agent_id)
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])
    
    let realizedPnL = 0 // Would come from closed positions
    let unrealizedPnL = 0
    
    filteredPortfolio.forEach(holding => {
      const agent = agentMap.get(holding.agent_id)
      if (agent) {
        const currentValue = holding.amount * agent.price
        const cost = holding.amount * holding.purchase_price
        unrealizedPnL += currentValue - cost
      }
    })
    
    return {
      realized_pnl: realizedPnL,
      unrealized_pnl: unrealizedPnL,
      total_pnl: realizedPnL + unrealizedPnL
    }
  }
}