import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface PortfolioMetrics {
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPercentage: number
  dailyChange: number
  dailyChangePercentage: number
  diversificationScore: number
  riskScore: number
  sharpeRatio: number
  volatility: number
  maxDrawdown: number
}

interface AssetAllocation {
  agent_id: string
  agent_name: string
  agent_symbol: string
  allocation_percentage: number
  current_value: number
  target_allocation?: number
  rebalance_action?: 'buy' | 'sell' | 'hold'
  rebalance_amount?: number
}

interface PerformanceData {
  date: string
  portfolio_value: number
  daily_return: number
  cumulative_return: number
}

interface RiskMetrics {
  var_95: number
  var_99: number
  beta: number
  alpha: number
  correlation_matrix: Record<string, Record<string, number>>
}

export function usePortfolioAnalytics() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')

  // Fetch portfolio holdings with current market data
  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['portfolio-holdings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('user_holdings')
        .select(`
          *,
          agents (
            id,
            name,
            symbol,
            price,
            change_24h,
            market_cap,
            volume_24h
          )
        `)
        .eq('user_id', user.id)
        .gt('total_amount', 0)

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Fetch historical portfolio performance
  const { data: performanceHistory, isLoading: performanceLoading } = useQuery({
    queryKey: ['portfolio-performance', user?.id, timeframe],
    queryFn: async () => {
      if (!user?.id || !holdings?.length) return []

      // Get price history for all holdings
      const agentIds = holdings.map(h => h.agent_id)
      const daysBack = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365

      const { data: priceHistory, error } = await supabase
        .from('price_history')
        .select('*')
        .in('agent_id', agentIds)
        .gte('timestamp', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true })

      if (error) throw error

      // Calculate portfolio value over time
      const performanceData: PerformanceData[] = []
      const groupedHistory = priceHistory?.reduce((acc, item) => {
        const date = new Date(item.timestamp).toISOString().split('T')[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(item)
        return acc
      }, {} as Record<string, any[]>) || {}

      Object.entries(groupedHistory)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, dayPrices]) => {
          let totalValue = 0
          
          holdings.forEach(holding => {
            const agentPrice = dayPrices.find(p => p.agent_id === holding.agent_id)
            if (agentPrice) {
              totalValue += holding.total_amount * agentPrice.price
            }
          })

          const previousValue = performanceData[performanceData.length - 1]?.portfolio_value || totalValue
          const dailyReturn = previousValue > 0 ? ((totalValue - previousValue) / previousValue) * 100 : 0
          const firstValue = performanceData[0]?.portfolio_value || totalValue
          const cumulativeReturn = firstValue > 0 ? ((totalValue - firstValue) / firstValue) * 100 : 0

          performanceData.push({
            date,
            portfolio_value: totalValue,
            daily_return: dailyReturn,
            cumulative_return: cumulativeReturn
          })
        })

      return performanceData
    },
    enabled: !!user?.id && !!holdings?.length
  })

  // Calculate portfolio metrics
  const portfolioMetrics = useCallback((): PortfolioMetrics | null => {
    if (!holdings?.length || !performanceHistory?.length) return null

    const totalValue = holdings.reduce((sum, h) => sum + (h.total_amount * (h.agents?.price || 0)), 0)
    const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0)
    const totalPnL = totalValue - totalInvested
    const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    const latestPerformance = performanceHistory[performanceHistory.length - 1]
    const previousPerformance = performanceHistory[performanceHistory.length - 2]
    
    const dailyChange = latestPerformance && previousPerformance 
      ? latestPerformance.portfolio_value - previousPerformance.portfolio_value 
      : 0
    const dailyChangePercentage = previousPerformance?.portfolio_value 
      ? (dailyChange / previousPerformance.portfolio_value) * 100 
      : 0

    // Calculate diversification score (0-100, higher is better)
    const diversificationScore = Math.min(100, holdings.length * 10)

    // Calculate risk score based on volatility and concentration
    const returns = performanceHistory.map(p => p.daily_return).filter(r => !isNaN(r))
    const volatility = returns.length > 1 ? Math.sqrt(returns.reduce((sum, r) => {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length
      return sum + Math.pow(r - mean, 2)
    }, 0) / (returns.length - 1)) : 0

    const riskScore = Math.min(100, volatility * 10)

    // Simple Sharpe ratio calculation (assuming 0% risk-free rate)
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
    const sharpeRatio = volatility > 0 ? meanReturn / volatility : 0

    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = performanceHistory[0]?.portfolio_value || 0
    
    performanceHistory.forEach(p => {
      if (p.portfolio_value > peak) peak = p.portfolio_value
      const drawdown = peak > 0 ? ((peak - p.portfolio_value) / peak) * 100 : 0
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    return {
      totalValue,
      totalInvested,
      totalPnL,
      totalPnLPercentage,
      dailyChange,
      dailyChangePercentage,
      diversificationScore,
      riskScore,
      sharpeRatio,
      volatility,
      maxDrawdown
    }
  }, [holdings, performanceHistory])

  // Calculate asset allocation
  const assetAllocation = useCallback((): AssetAllocation[] => {
    if (!holdings?.length) return []

    const totalValue = holdings.reduce((sum, h) => sum + (h.total_amount * (h.agents?.price || 0)), 0)
    
    return holdings.map(holding => {
      const currentValue = holding.total_amount * (holding.agents?.price || 0)
      const allocationPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0
      
      // Simple target allocation: equal weights or market cap weighted
      const targetAllocation = 100 / holdings.length // Equal weight for now
      const deviation = Math.abs(allocationPercentage - targetAllocation)
      
      let rebalanceAction: 'buy' | 'sell' | 'hold' = 'hold'
      let rebalanceAmount = 0
      
      if (deviation > 5) { // 5% threshold
        if (allocationPercentage > targetAllocation) {
          rebalanceAction = 'sell'
          rebalanceAmount = (currentValue - (totalValue * targetAllocation / 100))
        } else {
          rebalanceAction = 'buy'
          rebalanceAmount = ((totalValue * targetAllocation / 100) - currentValue)
        }
      }

      return {
        agent_id: holding.agent_id,
        agent_name: holding.agents?.name || 'Unknown',
        agent_symbol: holding.agents?.symbol || 'N/A',
        allocation_percentage: allocationPercentage,
        current_value: currentValue,
        target_allocation: targetAllocation,
        rebalance_action: rebalanceAction,
        rebalance_amount: Math.abs(rebalanceAmount)
      }
    })
  }, [holdings])

  const generateRebalanceRecommendations = useCallback(() => {
    const allocation = assetAllocation()
    return allocation.filter(a => a.rebalance_action !== 'hold')
  }, [assetAllocation])

  const exportPortfolioData = useCallback(() => {
    const metrics = portfolioMetrics()
    const allocation = assetAllocation()
    
    const exportData = {
      metrics,
      allocation,
      performance_history: performanceHistory,
      generated_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [portfolioMetrics, assetAllocation, performanceHistory])

  return {
    holdings,
    performanceHistory,
    portfolioMetrics: portfolioMetrics(),
    assetAllocation: assetAllocation(),
    rebalanceRecommendations: generateRebalanceRecommendations(),
    isLoading: holdingsLoading || performanceLoading,
    timeframe,
    setTimeframe,
    exportPortfolioData
  }
}