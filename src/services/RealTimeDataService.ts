import { supabase } from '@/integrations/supabase/client'
import { DatabaseService } from './DatabaseService'

export interface MarketTicker {
  agent_id: string
  symbol: string
  last_price: number
  change_24h: number
  change_percent_24h: number
  volume_24h: number
  high_24h: number
  low_24h: number
  best_bid: number
  best_ask: number
  updated_at: string
}

export interface OrderBookLevel {
  price: number
  size: number
  total: number
}

export interface OrderBookData {
  agent_id: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  last_updated: string
}

export interface RecentTrade {
  id: string
  agent_id: string
  price: number
  size: number
  side: 'buy' | 'sell'
  timestamp: string
}

export class RealTimeDataService {
  private static channels: Map<string, any> = new Map()

  static async subscribeToMarketData(agentIds: string[], callback: (data: any) => void) {
    const channelName = `market-data-${agentIds.join('-')}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_tickers',
          filter: `agent_id=in.(${agentIds.join(',')})`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data_feeds',
          filter: `agent_id=in.(${agentIds.join(',')})`
        },
        callback
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  static async subscribeToOrderBook(agentId: string, callback: (data: any) => void) {
    const channelName = `order-book-${agentId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_book',
          filter: `agent_id=eq.${agentId}`
        },
        callback
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  static async subscribeToTrades(agentId: string, callback: (data: any) => void) {
    const channelName = `trades-${agentId}`
    
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_trades',
          filter: `agent_id=eq.${agentId}`
        },
        callback
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  static async getMarketTicker(agentId: string): Promise<MarketTicker | null> {
    const { data, error } = await supabase
      .from('market_tickers')
      .select(`
        *,
        agent:agents!inner(symbol)
      `)
      .eq('agent_id', agentId)
      .single()

    if (error || !data) return null

    return {
      agent_id: data.agent_id,
      symbol: data.agent.symbol,
      last_price: data.last_price,
      change_24h: data.change_24h || 0,
      change_percent_24h: data.change_percent_24h || 0,
      volume_24h: data.volume_24h || 0,
      high_24h: data.high_24h || data.last_price,
      low_24h: data.low_24h || data.last_price,
      best_bid: data.best_bid || data.last_price * 0.999,
      best_ask: data.best_ask || data.last_price * 1.001,
      updated_at: data.updated_at
    }
  }

  static async getAllMarketTickers(): Promise<MarketTicker[]> {
    const { data, error } = await supabase
      .from('market_tickers')
      .select(`
        *,
        agent:agents!inner(symbol)
      `)
      .order('volume_24h', { ascending: false })

    if (error) return []

    return (data || []).map(item => ({
      agent_id: item.agent_id,
      symbol: item.agent.symbol,
      last_price: item.last_price,
      change_24h: item.change_24h || 0,
      change_percent_24h: item.change_percent_24h || 0,
      volume_24h: item.volume_24h || 0,
      high_24h: item.high_24h || item.last_price,
      low_24h: item.low_24h || item.last_price,
      best_bid: item.best_bid || item.last_price * 0.999,
      best_ask: item.best_ask || item.last_price * 1.001,
      updated_at: item.updated_at
    }))
  }

  static async getOrderBook(agentId: string, levels: number = 10): Promise<OrderBookData | null> {
    const { data, error } = await supabase
      .from('order_book')
      .select('*')
      .eq('agent_id', agentId)
      .order('price', { ascending: false })
      .limit(levels * 2) // Get enough for both sides

    if (error || !data) return null

    const bids = data
      .filter(level => level.side === 'bid')
      .slice(0, levels)
      .map(level => ({
        price: level.price,
        size: level.size,
        total: level.total
      }))

    const asks = data
      .filter(level => level.side === 'ask')
      .slice(0, levels)
      .map(level => ({
        price: level.price,
        size: level.size,
        total: level.total
      }))

    return {
      agent_id: agentId,
      bids,
      asks,
      last_updated: new Date().toISOString()
    }
  }

  static async getRecentTrades(agentId: string, limit: number = 50): Promise<RecentTrade[]> {
    const { data, error } = await supabase
      .from('market_trades')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) return []

    return (data || []).map(trade => ({
      id: trade.id,
      agent_id: trade.agent_id,
      price: trade.price,
      size: trade.size,
      side: trade.side as 'buy' | 'sell',
      timestamp: trade.timestamp
    }))
  }

  static async updateMarketTicker(agentId: string, tickerData: Partial<MarketTicker>) {
    const { data, error } = await supabase
      .from('market_tickers')
      .upsert({
        agent_id: agentId,
        last_price: tickerData.last_price || 0,
        change_24h: tickerData.change_24h,
        change_percent_24h: tickerData.change_percent_24h,
        volume_24h: tickerData.volume_24h,
        high_24h: tickerData.high_24h,
        low_24h: tickerData.low_24h
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async insertMarketData(agentId: string, marketData: {
    price: number
    volume_24h?: number
    high_24h?: number
    low_24h?: number
    change_24h?: number
    change_percent_24h?: number
  }) {
    const { data, error } = await supabase
      .from('market_data_feeds')
      .insert({
        agent_id: agentId,
        ...marketData,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async insertTrade(agentId: string, tradeData: {
    price: number
    size: number
    side: 'buy' | 'sell'
    trade_id?: string
  }) {
    const { data, error } = await supabase
      .from('market_trades')
      .insert({
        agent_id: agentId,
        ...tradeData,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static unsubscribeAll() {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }

  static unsubscribe(channelName: string) {
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).unsubscribe()
      this.channels.delete(channelName)
    }
  }
}