import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

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
      
      // Fetch price history for chart
      const { data: priceHistory, error: priceError } = await supabase
        .from('price_history')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(200)
      
      if (priceError) throw priceError
      
      // Fetch top agents
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(10)
      
      if (agentsError) throw agentsError
      
      // Group price history by timestamp and aggregate
      const priceMap = new Map()
      priceHistory?.forEach(item => {
        const date = new Date(item.timestamp).toLocaleDateString()
        if (!priceMap.has(date)) {
          priceMap.set(date, {
            timestamp: date,
            totalVolume: 0,
            totalMarketCap: 0,
            count: 0
          })
        }
        const existing = priceMap.get(date)
        existing.totalVolume += Number(item.volume)
        existing.totalMarketCap += Number(item.market_cap)
        existing.count += 1
      })
      
      // Transform to chart data
      const chartData = Array.from(priceMap.values()).map(item => ({
        timestamp: item.timestamp,
        volume: item.totalVolume,
        market_cap: item.totalMarketCap,
        avg_price: item.totalMarketCap / item.totalVolume || 0
      }))
      
      // Calculate market stats
      const totalMarketCap = agents?.reduce((sum, agent) => sum + Number(agent.market_cap), 0) || 0
      const totalVolume = agents?.reduce((sum, agent) => sum + Number(agent.volume_24h), 0) || 0
      const avgChange = agents?.reduce((sum, agent) => sum + Number(agent.change_24h), 0) / (agents?.length || 1) || 0
      
      setPriceData(chartData)
      setTopAgents(agents || [])
      setMarketStats({
        totalMarketCap,
        totalVolume24h: totalVolume,
        activeAgents: agents?.length || 0,
        avgChange24h: avgChange
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
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