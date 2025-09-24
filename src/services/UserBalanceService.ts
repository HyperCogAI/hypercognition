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
    // Calculate balance from portfolio and orders
    const portfolio = await DatabaseService.getUserPortfolio(userId)
    const orders = await DatabaseService.getUserOrders(userId, 'pending')
    
    // Calculate total portfolio value
    const portfolioValue = portfolio.reduce((total, holding) => {
      return total + (holding.amount * holding.agent.price)
    }, 0)
    
    // Calculate pending orders value
    const pendingValue = orders.reduce((total, order) => {
      return total + (order.amount * (order.price || 0))
    }, 0)
    
    // For demo, assume user starts with $10,000 and can add more
    const initialBalance = 10000
    const totalSpent = portfolio.reduce((total, holding) => {
      return total + (holding.amount * holding.purchase_price)
    }, 0)
    
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
      message: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} ${order.agent.symbol} at $${price}`,
      action_url: `/portfolio`,
      data: {
        orderId: order.id,
        agentId,
        amount,
        price,
        totalValue
      }
    })
    
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
      agent: {
        id: order.agent.id,
        name: order.agent.name,
        symbol: order.agent.symbol
      }
    }
  }

  static async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    const orders = await DatabaseService.getUserOrders(userId)
    
    return orders.slice(0, limit).map(order => ({
      id: order.id,
      user_id: order.user_id,
      agent_id: order.agent_id,
      type: order.side as 'buy' | 'sell',
      amount: order.amount,
      price: order.price || 0,
      total_value: order.amount * (order.price || 0),
      fee: 0, // Would calculate from order executions
      status: order.status === 'filled' ? 'completed' : order.status as any,
      timestamp: order.created_at,
      agent: {
        id: order.agent.id,
        name: order.agent.name,
        symbol: order.agent.symbol
      }
    }))
  }

  static async getTransactionHistory(
    userId: string,
    agentId?: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Transaction[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        agent:agents(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (agentId) query = query.eq('agent_id', agentId)
    if (type) query = query.eq('side', type)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)
    
    const { data, error } = await query
    if (error) throw error
    
    return (data || []).map(order => ({
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
      agent: {
        id: order.agent.id,
        name: order.agent.name,
        symbol: order.agent.symbol
      }
    }))
  }

  static async calculatePnL(userId: string, agentId?: string): Promise<{
    realized_pnl: number
    unrealized_pnl: number
    total_pnl: number
  }> {
    const portfolio = agentId 
      ? (await DatabaseService.getUserPortfolio(userId)).filter(h => h.agent_id === agentId)
      : await DatabaseService.getUserPortfolio(userId)
    
    let realizedPnL = 0 // Would come from closed positions
    let unrealizedPnL = 0
    
    portfolio.forEach(holding => {
      const currentValue = holding.amount * holding.agent.price
      const cost = holding.amount * holding.purchase_price
      unrealizedPnL += currentValue - cost
    })
    
    return {
      realized_pnl: realizedPnL,
      unrealized_pnl: unrealizedPnL,
      total_pnl: realizedPnL + unrealizedPnL
    }
  }
}