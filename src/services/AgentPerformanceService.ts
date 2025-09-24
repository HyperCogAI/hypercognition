import { supabase } from '@/integrations/supabase/client'
import { DatabaseService } from './DatabaseService'

export interface AgentPerformance {
  agent_id: string
  symbol: string
  name: string
  current_price: number
  price_change_24h: number
  price_change_7d: number
  price_change_30d: number
  volume_24h: number
  market_cap: number
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  trading_volume: number
  holder_count: number
  liquidity_score: number
  sentiment_score: number
  technical_rating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  last_updated: string
}

export interface PriceHistory {
  timestamp: string
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

export interface AgentMetrics {
  total_holders: number
  total_volume_24h: number
  average_holding_size: number
  largest_holder_percentage: number
  price_volatility: number
  liquidity_depth: number
  social_mentions: number
  developer_activity: number
}

export class AgentPerformanceService {
  static async getAgentPerformance(agentId: string): Promise<AgentPerformance> {
    const agent = await DatabaseService.getAgent(agentId)
    if (!agent) throw new Error('Agent not found')
    
    // Get historical performance data
    const priceHistory = await this.getPriceHistory(agentId, 30)
    const metrics = await this.calculateAgentMetrics(agentId)
    
    // Calculate performance metrics
    const prices = priceHistory.map(p => p.price)
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    
    // Price changes
    const price_change_24h = priceHistory.length >= 2 
      ? ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100
      : agent.change_24h || 0
    
    const price_change_7d = priceHistory.length >= 7
      ? ((prices[prices.length - 1] - prices[prices.length - 7]) / prices[prices.length - 7]) * 100
      : 0
    
    const price_change_30d = priceHistory.length >= 30
      ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100
      : 0
    
    // Volatility (standard deviation of returns)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized
    
    // Sharpe Ratio (assuming 3% risk-free rate)
    const riskFreeRate = 0.03
    const excessReturn = (price_change_30d / 100) * 12 - riskFreeRate // Annualized
    const sharpe_ratio = volatility > 0 ? excessReturn / volatility : 0
    
    // Max Drawdown
    let maxDrawdown = 0
    let peak = prices[0]
    for (const price of prices) {
      if (price > peak) peak = price
      const drawdown = (peak - price) / peak
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    }
    
    // Technical Rating
    const technical_rating = this.calculateTechnicalRating(price_change_24h, volatility, sharpe_ratio)
    
    // Liquidity Score (based on volume and market cap)
    const liquidity_score = Math.min(100, (agent.volume_24h / agent.market_cap) * 1000)
    
    return {
      agent_id: agentId,
      symbol: agent.symbol,
      name: agent.name,
      current_price: agent.price,
      price_change_24h,
      price_change_7d,
      price_change_30d,
      volume_24h: agent.volume_24h,
      market_cap: agent.market_cap,
      volatility: volatility * 100, // Convert to percentage
      sharpe_ratio,
      max_drawdown: maxDrawdown * 100, // Convert to percentage
      trading_volume: agent.volume_24h,
      holder_count: metrics.total_holders,
      liquidity_score,
      sentiment_score: await this.calculateSentimentScore(agentId),
      technical_rating,
      last_updated: new Date().toISOString()
    }
  }

  static async getPriceHistory(agentId: string, days: number = 30): Promise<PriceHistory[]> {
    // Check if we have market data feeds
    const { data: marketData } = await supabase
      .from('market_data_feeds')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: true })
      .limit(days * 24) // Hourly data
    
    if (marketData && marketData.length > 0) {
      return marketData.map(data => ({
        timestamp: data.timestamp,
        price: data.price,
        volume: data.volume_24h || 0,
        high: data.high_24h || data.price,
        low: data.low_24h || data.price,
        open: data.open_24h || data.price,
        close: data.price
      }))
    }
    
    // Generate synthetic price history based on current price
    const agent = await DatabaseService.getAgent(agentId)
    const currentPrice = agent.price
    const history: PriceHistory[] = []
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate realistic price movement
      const randomWalk = (Math.random() - 0.5) * 0.1 // ±5% daily volatility
      const trendFactor = Math.sin((days - i) / days * Math.PI) * 0.05 // Sine wave trend
      const priceChange = randomWalk + trendFactor
      
      const price = currentPrice * (1 + priceChange * (i / days))
      const volume = agent.volume_24h * (0.8 + Math.random() * 0.4) // ±20% volume variation
      
      history.push({
        timestamp: date.toISOString(),
        price,
        volume,
        high: price * (1 + Math.random() * 0.03), // Up to 3% higher
        low: price * (1 - Math.random() * 0.03), // Up to 3% lower
        open: price,
        close: price
      })
    }
    
    return history
  }

  static async calculateAgentMetrics(agentId: string): Promise<AgentMetrics> {
    // Get holder data from portfolios
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('amount, user_id')
      .eq('agent_id', agentId)
      .gt('amount', 0)
    
    const total_holders = portfolios?.length || 0
    const holdings = portfolios?.map(p => p.amount) || []
    
    const total_supply = holdings.reduce((sum, amount) => sum + amount, 0)
    const average_holding_size = total_supply / Math.max(total_holders, 1)
    
    const largest_holding = Math.max(...holdings, 0)
    const largest_holder_percentage = total_supply > 0 ? (largest_holding / total_supply) * 100 : 0
    
    // Get trading volume from orders
    const { data: orders } = await supabase
      .from('orders')
      .select('amount, price, created_at')
      .eq('agent_id', agentId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    const total_volume_24h = orders?.reduce((sum, order) => 
      sum + (order.amount * (order.price || 0)), 0) || 0
    
    // Calculate volatility from recent price changes
    const agent = await DatabaseService.getAgent(agentId)
    const price_volatility = Math.abs(agent.change_24h || 0)
    
    return {
      total_holders,
      total_volume_24h,
      average_holding_size,
      largest_holder_percentage,
      price_volatility,
      liquidity_depth: agent.volume_24h / Math.max(agent.price, 1), // Volume to price ratio
      social_mentions: Math.floor(Math.random() * 1000), // Would integrate with social APIs
      developer_activity: Math.floor(Math.random() * 100) // Would integrate with GitHub/dev metrics
    }
  }

  private static calculateTechnicalRating(
    priceChange24h: number,
    volatility: number,
    sharpeRatio: number
  ): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
    let score = 0
    
    // Price momentum
    if (priceChange24h > 5) score += 2
    else if (priceChange24h > 2) score += 1
    else if (priceChange24h < -5) score -= 2
    else if (priceChange24h < -2) score -= 1
    
    // Volatility (lower is better)
    if (volatility < 0.2) score += 1
    else if (volatility > 0.5) score -= 1
    
    // Sharpe ratio
    if (sharpeRatio > 1) score += 2
    else if (sharpeRatio > 0.5) score += 1
    else if (sharpeRatio < -0.5) score -= 1
    else if (sharpeRatio < -1) score -= 2
    
    if (score >= 3) return 'Strong Buy'
    if (score >= 1) return 'Buy'
    if (score <= -3) return 'Strong Sell'
    if (score <= -1) return 'Sell'
    return 'Hold'
  }

  private static async calculateSentimentScore(agentId: string): Promise<number> {
    // Get recent comments and ratings
    const { data: ratings } = await supabase
      .from('agent_ratings')
      .select('rating')
      .eq('agent_id', agentId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    if (!ratings || ratings.length === 0) return 50 // Neutral
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    
    // Convert 1-5 rating to 0-100 sentiment score
    return (avgRating - 1) * 25
  }

  static async getTopPerformers(limit: number = 10): Promise<AgentPerformance[]> {
    const agents = await DatabaseService.getAgents()
    
    const performances = await Promise.all(
      agents.slice(0, limit).map(agent => this.getAgentPerformance(agent.id))
    )
    
    return performances.sort((a, b) => b.price_change_24h - a.price_change_24h)
  }

  static async getPerformanceComparison(agentIds: string[]): Promise<AgentPerformance[]> {
    return Promise.all(agentIds.map(id => this.getAgentPerformance(id)))
  }
}