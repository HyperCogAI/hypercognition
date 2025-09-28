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
  private baseUrl = 'https://api.virtuals.io/api/v1' // Virtuals Protocol API
  private fallbackUrl = 'https://api.ai16z.com/v1' // AI16Z API as fallback
  
  private async fetchWithFallback<T>(endpoint: string): Promise<T> {
    try {
      // Try Virtuals Protocol first
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.warn('Virtuals API failed, trying fallback:', error)
    }

    try {
      // Try AI16Z as fallback
      const response = await fetch(`${this.fallbackUrl}${endpoint}`)
      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.warn('AI16Z API failed, using mock data:', error)
    }

    // Return mock data if both APIs fail
    return this.getMockData(endpoint) as T
  }

  private getMockData(endpoint: string): any {
    if (endpoint.includes('/agents')) {
      return this.generateMockAgents()
    }
    if (endpoint.includes('/price-history')) {
      return this.generateMockPriceHistory()
    }
    return {}
  }

  private generateMockAgents(): AIAgentMarketData[] {
    const agentNames = [
      'VIRTUAL', 'AI16Z', 'GOAT', 'ZEREBRO', 'AIXBT', 'LUNA', 'FARTCOIN',
      'MOODENG', 'PNUT', 'ACT', 'GNON', 'CENTS', 'OPUS', 'GRIFFAIN',
      'ELIZA', 'MEME', 'PIPPIN', 'FOREST', 'RIF', 'URO'
    ]

    return agentNames.map((name, index) => ({
      id: `agent_${name.toLowerCase()}`,
      symbol: name,
      name: `${name} AI Agent`,
      description: `Advanced AI trading agent specializing in ${name.toLowerCase()} strategies`,
      price: Math.random() * 100 + 0.1,
      change_24h: (Math.random() - 0.5) * 10,
      change_percent_24h: (Math.random() - 0.5) * 20,
      volume_24h: Math.random() * 10000000,
      market_cap: Math.random() * 1000000000,
      high_24h: Math.random() * 120 + 80,
      low_24h: Math.random() * 80 + 20,
      category: ['DeFi', 'Trading', 'NFT', 'GameFi', 'Social'][index % 5],
      blockchain: ['Ethereum', 'Solana', 'Base', 'Arbitrum'][index % 4],
      launch_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      performance_score: Math.random() * 100,
      total_trades: Math.floor(Math.random() * 10000),
      active_users: Math.floor(Math.random() * 5000),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
    }))
  }

  private generateMockPriceHistory(): AIAgentPriceHistory[] {
    const history: AIAgentPriceHistory[] = []
    const now = Date.now()
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now - i * 24 * 60 * 60 * 1000).toISOString()
      history.push({
        timestamp,
        price: Math.random() * 50 + 10,
        volume: Math.random() * 1000000,
        market_cap: Math.random() * 100000000
      })
    }
    
    return history
  }

  async getTopAIAgents(limit: number = 100): Promise<AIAgentMarketData[]> {
    try {
      const data = await this.fetchWithFallback<AIAgentMarketData[]>('/agents/top')
      return data.slice(0, limit)
    } catch (error) {
      console.error('Error fetching AI agents:', error)
      return this.generateMockAgents().slice(0, limit)
    }
  }

  async getAIAgentById(id: string): Promise<AIAgentMarketData | null> {
    try {
      return await this.fetchWithFallback<AIAgentMarketData>(`/agents/${id}`)
    } catch (error) {
      console.error('Error fetching AI agent:', error)
      const mockAgents = this.generateMockAgents()
      return mockAgents.find(agent => agent.id === id) || null
    }
  }

  async getAIAgentPriceHistory(id: string, days: number = 30): Promise<AIAgentPriceHistory[]> {
    try {
      return await this.fetchWithFallback<AIAgentPriceHistory[]>(`/agents/${id}/price-history?days=${days}`)
    } catch (error) {
      console.error('Error fetching price history:', error)
      return this.generateMockPriceHistory()
    }
  }

  async searchAIAgents(query: string): Promise<AIAgentMarketData[]> {
    try {
      return await this.fetchWithFallback<AIAgentMarketData[]>(`/agents/search?q=${encodeURIComponent(query)}`)
    } catch (error) {
      console.error('Error searching AI agents:', error)
      const mockAgents = this.generateMockAgents()
      return mockAgents.filter(agent => 
        agent.name.toLowerCase().includes(query.toLowerCase()) ||
        agent.symbol.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  async getTrendingAIAgents(): Promise<AIAgentMarketData[]> {
    try {
      return await this.fetchWithFallback<AIAgentMarketData[]>('/agents/trending')
    } catch (error) {
      console.error('Error fetching trending AI agents:', error)
      return this.generateMockAgents().slice(0, 10)
    }
  }

  async getMarketStats(): Promise<{
    totalMarketCap: number
    totalVolume24h: number
    activeAgents: number
    avgChange24h: number
  }> {
    try {
      const agents = await this.getTopAIAgents(100)
      
      return {
        totalMarketCap: agents.reduce((sum, agent) => sum + agent.market_cap, 0),
        totalVolume24h: agents.reduce((sum, agent) => sum + agent.volume_24h, 0),
        activeAgents: agents.length,
        avgChange24h: agents.reduce((sum, agent) => sum + agent.change_percent_24h, 0) / agents.length
      }
    } catch (error) {
      console.error('Error fetching market stats:', error)
      return {
        totalMarketCap: 5000000000,
        totalVolume24h: 250000000,
        activeAgents: 50,
        avgChange24h: 5.2
      }
    }
  }
}

export const aiAgentMarketApi = new AIAgentMarketAPI()
export type { AIAgentMarketData, AIAgentPriceHistory }