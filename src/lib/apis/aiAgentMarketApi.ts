import { supabase } from '@/integrations/supabase/client'

interface AIAgentMarketData {
  id: string
  symbol: string
  name: string
  description: string
  price: number
  change_24h: number
  change_percent_24h: number
  volume_24h: number
  market_cap: number
  high_24h: number
  low_24h: number
  category: string
  blockchain: string
  launch_date: string
  performance_score: number
  total_trades: number
  active_users: number
  avatar_url?: string
}

interface AIAgentPriceHistory {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

class AIAgentMarketAPI {
  async getTopAIAgents(limit: number = 100): Promise<AIAgentMarketData[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('market_cap', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(agent => ({
        id: agent.id,
        symbol: agent.symbol,
        name: agent.name,
        description: agent.description || '',
        price: agent.price,
        change_24h: agent.change_24h,
        change_percent_24h: agent.change_24h,
        volume_24h: agent.volume_24h,
        market_cap: agent.market_cap,
        high_24h: agent.price * 1.1,
        low_24h: agent.price * 0.9,
        category: agent.category || 'Trading',
        blockchain: agent.chain,
        launch_date: agent.created_at,
        performance_score: 85,
        total_trades: 0,
        active_users: 0,
        avatar_url: agent.avatar_url
      }))
    } catch (error) {
      console.error('Error fetching AI agents from database:', error)
      return []
    }
  }

  async getAIAgentById(id: string): Promise<AIAgentMarketData | null> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) throw error

      return {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        description: data.description || '',
        price: data.price,
        change_24h: data.change_24h,
        change_percent_24h: data.change_24h,
        volume_24h: data.volume_24h,
        market_cap: data.market_cap,
        high_24h: data.price * 1.1,
        low_24h: data.price * 0.9,
        category: data.category || 'Trading',
        blockchain: data.chain,
        launch_date: data.created_at,
        performance_score: 85,
        total_trades: 0,
        active_users: 0,
        avatar_url: data.avatar_url
      }
    } catch (error) {
      console.error('Error fetching AI agent from database:', error)
      return null
    }
  }

  async getAIAgentPriceHistory(id: string, days: number = 30): Promise<AIAgentPriceHistory[]> {
    try {
      const { data: agent } = await supabase
        .from('agents')
        .select('price, market_cap, volume_24h, created_at')
        .eq('id', id)
        .single()

      if (!agent) return []

      // Generate historical data based on current values (placeholder)
      const history: AIAgentPriceHistory[] = []
      const now = Date.now()
      
      for (let i = days; i >= 0; i--) {
        history.push({
          timestamp: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
          price: agent.price,
          volume: agent.volume_24h,
          market_cap: agent.market_cap
        })
      }
      
      return history
    } catch (error) {
      console.error('Error fetching price history from database:', error)
      return []
    }
  }

  async searchAIAgents(query: string): Promise<AIAgentMarketData[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
        .order('market_cap', { ascending: false })
        .limit(20)

      if (error) throw error

      return (data || []).map(agent => ({
        id: agent.id,
        symbol: agent.symbol,
        name: agent.name,
        description: agent.description || '',
        price: agent.price,
        change_24h: agent.change_24h,
        change_percent_24h: agent.change_24h,
        volume_24h: agent.volume_24h,
        market_cap: agent.market_cap,
        high_24h: agent.price * 1.1,
        low_24h: agent.price * 0.9,
        category: agent.category || 'Trading',
        blockchain: agent.chain,
        launch_date: agent.created_at,
        performance_score: 85,
        total_trades: 0,
        active_users: 0,
        avatar_url: agent.avatar_url
      }))
    } catch (error) {
      console.error('Error searching AI agents:', error)
      return []
    }
  }

  async getTrendingAIAgents(): Promise<AIAgentMarketData[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('change_24h', { ascending: false })
        .limit(10)

      if (error) throw error

      return (data || []).map(agent => ({
        id: agent.id,
        symbol: agent.symbol,
        name: agent.name,
        description: agent.description || '',
        price: agent.price,
        change_24h: agent.change_24h,
        change_percent_24h: agent.change_24h,
        volume_24h: agent.volume_24h,
        market_cap: agent.market_cap,
        high_24h: agent.price * 1.1,
        low_24h: agent.price * 0.9,
        category: agent.category || 'Trading',
        blockchain: agent.chain,
        launch_date: agent.created_at,
        performance_score: 85,
        total_trades: 0,
        active_users: 0,
        avatar_url: agent.avatar_url
      }))
    } catch (error) {
      console.error('Error fetching trending AI agents:', error)
      return []
    }
  }

  async getMarketStats(): Promise<{
    totalMarketCap: number
    totalVolume24h: number
    activeAgents: number
    avgChange24h: number
  }> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('market_cap, volume_24h, change_24h')
        .eq('status', 'active')

      if (error) throw error

      const agents = data || []
      
      return {
        totalMarketCap: agents.reduce((sum, agent) => sum + (agent.market_cap || 0), 0),
        totalVolume24h: agents.reduce((sum, agent) => sum + (agent.volume_24h || 0), 0),
        activeAgents: agents.length,
        avgChange24h: agents.length > 0 
          ? agents.reduce((sum, agent) => sum + (agent.change_24h || 0), 0) / agents.length 
          : 0
      }
    } catch (error) {
      console.error('Error fetching market stats from database:', error)
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        activeAgents: 0,
        avgChange24h: 0
      }
    }
  }
}

export const aiAgentMarketApi = new AIAgentMarketAPI()
export type { AIAgentMarketData, AIAgentPriceHistory }