import { useState, useEffect } from 'react'
import { aiAgentMarketApi, type AIAgentMarketData, type AIAgentPriceHistory } from '@/lib/apis/aiAgentMarketApi'

interface AnalyticsData {
  timestamp: string
  volume: number
  market_cap: number
  avg_price: number
}

interface Agent {
  id: string
  name: string
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
  avatar_url?: string
}

interface MarketStats {
  totalMarketCap: number
  totalVolume24h: number
  activeAgents: number
  avgChange24h: number
}

export const useAnalytics = () => {
  const [priceData, setPriceData] = useState<AnalyticsData[]>([])
  const [topAgents, setTopAgents] = useState<Agent[]>([])
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 0,
    totalVolume24h: 0,
    activeAgents: 0,
    avgChange24h: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real AI agent market data
      const [agents, marketStats, priceHistory] = await Promise.all([
        aiAgentMarketApi.getTopAIAgents(20),
        aiAgentMarketApi.getMarketStats(),
        aiAgentMarketApi.getAIAgentPriceHistory('virtual', 30)
      ])
      
      // Transform agent data to match our interface
      const transformedAgents = agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        symbol: agent.symbol,
        price: agent.price,
        change_24h: agent.change_percent_24h,
        volume_24h: agent.volume_24h,
        market_cap: agent.market_cap,
        avatar_url: agent.avatar_url
      }))
      
      // Transform price history for chart
      const chartData = priceHistory.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleDateString(),
        volume: item.volume,
        market_cap: item.market_cap,
        avg_price: item.price
      }))
      
      setPriceData(chartData)
      setTopAgents(transformedAgents)
      setMarketStats(marketStats)
      
    } catch (error) {
      console.error('Error fetching AI agent market data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  return {
    priceData,
    topAgents,
    marketStats,
    isLoading,
    formatCurrency,
    refetch: fetchAnalyticsData
  }
}