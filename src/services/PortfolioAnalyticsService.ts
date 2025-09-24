import { supabase } from '@/integrations/supabase/client'
import { DatabaseService } from './DatabaseService'

export interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalPnL: number
  pnlPercentage: number
  holdingsCount: number
  diversificationRatio: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  bestPerformer: {
    agent_id: string
    symbol: string
    pnl: number
    pnlPercentage: number
  } | null
  worstPerformer: {
    agent_id: string
    symbol: string
    pnl: number
    pnlPercentage: number
  } | null
}

export interface AssetAllocation {
  agent_id: string
  symbol: string
  name: string
  percentage: number
  value: number
  pnl: number
  pnlPercentage: number
}

export interface PerformanceHistory {
  date: string
  totalValue: number
  pnl: number
  pnlPercentage: number
}

export class PortfolioAnalyticsService {
  static async calculatePortfolioMetrics(userId: string): Promise<PortfolioMetrics> {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    if (!portfolio?.length) {
      return this.getEmptyMetrics()
    }

    // Get agent data separately to avoid join issues
    const agentIds = portfolio.map(p => p.agent_id)
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])

    let totalValue = 0
    let totalCost = 0
    let bestPerformer: any = null
    let worstPerformer: any = null
    let maxPnL = -Infinity
    let minPnL = Infinity

    const holdings = portfolio.map(holding => {
      const agent = agentMap.get(holding.agent_id)
      if (!agent) return null
      
      const currentValue = holding.amount * agent.price
      const cost = holding.amount * holding.purchase_price
      const pnl = currentValue - cost
      const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0

      totalValue += currentValue
      totalCost += cost

      if (pnl > maxPnL) {
        maxPnL = pnl
        bestPerformer = {
          agent_id: holding.agent_id,
          symbol: agent.symbol,
          pnl,
          pnlPercentage
        }
      }

      if (pnl < minPnL) {
        minPnL = pnl
        worstPerformer = {
          agent_id: holding.agent_id,
          symbol: agent.symbol,
          pnl,
          pnlPercentage
        }
      }

      return { ...holding, agent, currentValue, cost, pnl, pnlPercentage }
    }).filter(Boolean)

    const totalPnL = totalValue - totalCost
    const pnlPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

    // Calculate diversification ratio (1 / Herfindahl Index)
    const weights = holdings.map(h => h.currentValue / totalValue)
    const herfindahlIndex = weights.reduce((sum, weight) => sum + weight * weight, 0)
    const diversificationRatio = 1 / herfindahlIndex

    // Simple volatility calculation (would need historical data for accurate calculation)
    const dailyReturns = holdings.map(h => h.pnlPercentage / 100)
    const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized

    // Simple Sharpe ratio (assuming 3% risk-free rate)
    const riskFreeRate = 0.03
    const excessReturn = (pnlPercentage / 100) - riskFreeRate
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0

    // Max drawdown (simplified - would need historical portfolio values)
    const maxDrawdown = Math.min(0, Math.min(...holdings.map(h => h.pnlPercentage))) / 100

    return {
      totalValue,
      totalCost,
      totalPnL,
      pnlPercentage,
      holdingsCount: portfolio.length,
      diversificationRatio,
      volatility,
      sharpeRatio,
      maxDrawdown,
      bestPerformer,
      worstPerformer
    }
  }

  static async getAssetAllocation(userId: string): Promise<AssetAllocation[]> {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    if (!portfolio?.length) return []

    // Get agent data separately
    const agentIds = portfolio.map(p => p.agent_id)
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .in('id', agentIds)
    
    const agentMap = new Map(agents?.map(a => [a.id, a]) || [])

    let totalValue = 0
    const allocations = portfolio.map(holding => {
      const agent = agentMap.get(holding.agent_id)
      if (!agent) return null
      
      const currentValue = holding.amount * agent.price
      const cost = holding.amount * holding.purchase_price
      const pnl = currentValue - cost
      const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0

      totalValue += currentValue

      return {
        agent_id: holding.agent_id,
        symbol: agent.symbol,
        name: agent.name,
        value: currentValue,
        pnl,
        pnlPercentage,
        percentage: 0 // Will be calculated after we have total value
      }
    }).filter(Boolean)

    // Calculate percentages
    return allocations.map(allocation => ({
      ...allocation,
      percentage: totalValue > 0 ? (allocation.value / totalValue) * 100 : 0
    }))
  }

  static async getPerformanceHistory(userId: string, days: number = 30): Promise<PerformanceHistory[]> {
    // For now, we'll generate some historical data based on current portfolio
    // In a real implementation, you'd store daily portfolio snapshots
    const currentMetrics = await this.calculatePortfolioMetrics(userId)
    
    const history: PerformanceHistory[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      // Simulate historical performance (in real app, this would come from stored data)
      const dayOffset = (Math.random() - 0.5) * 0.05 // ±2.5% daily variation
      const cumulativeReturn = currentMetrics.pnlPercentage / 100
      const dailyReturn = cumulativeReturn * (1 + dayOffset * (i / days))
      
      const totalValue = currentMetrics.totalCost * (1 + dailyReturn)
      const pnl = totalValue - currentMetrics.totalCost
      const pnlPercentage = dailyReturn * 100

      history.push({
        date: date.toISOString().split('T')[0],
        totalValue,
        pnl,
        pnlPercentage
      })
    }

    return history
  }

  private static getEmptyMetrics(): PortfolioMetrics {
    return {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      pnlPercentage: 0,
      holdingsCount: 0,
      diversificationRatio: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      bestPerformer: null,
      worstPerformer: null
    }
  }
}