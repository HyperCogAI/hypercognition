import { supabase } from '@/integrations/supabase/client'
import { coinGeckoApi } from '@/lib/apis/coinGeckoApi'
import { jupiterApi } from '@/lib/apis/jupiterApi'
import { alternativeMarketDataApi } from '@/lib/apis/alternativeMarketData'
import { RealTimeDataService } from './RealTimeDataService'

interface UnifiedMarketData {
  symbol: string
  name: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap?: number
  bid_price?: number
  ask_price?: number
  spread?: number
  last_updated: string
  source: 'coingecko' | 'jupiter' | 'supabase' | 'coincap' | 'demo'
  confidence: 'high' | 'medium' | 'low'
}

interface MarketDataAggregation {
  data: UnifiedMarketData[]
  sources_used: string[]
  last_updated: string
  total_symbols: number
  live_symbols: number
}

export class EnhancedMarketDataService {
  private static cache = new Map<string, { data: any, expires: number }>()
  private static readonly CACHE_TTL = 2 * 60 * 1000 // 2 minutes

  private static setCache(key: string, data: any, ttl = this.CACHE_TTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    })
  }

  private static getCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data as T
    }
    if (cached) {
      this.cache.delete(key)
    }
    return null
  }

  // Get comprehensive market data from all sources
  static async getAggregatedMarketData(): Promise<MarketDataAggregation> {
    const cacheKey = 'aggregated_market_data'
    const cached = this.getCache<MarketDataAggregation>(cacheKey)
    if (cached) return cached

    const sourcesUsed: string[] = []
    const allData: UnifiedMarketData[] = []

    try {
      // 1. Get Supabase real-time data (highest priority)
      try {
        const supabaseTickers = await RealTimeDataService.getAllMarketTickers()
        supabaseTickers.forEach(ticker => {
          allData.push({
            symbol: ticker.symbol,
            name: ticker.symbol, // We might not have full names from tickers
            price: ticker.last_price,
            change_24h: ticker.change_percent_24h,
            volume_24h: ticker.volume_24h,
            market_cap: undefined,
            bid_price: ticker.best_bid,
            ask_price: ticker.best_ask,
            spread: ticker.best_ask - ticker.best_bid,
            last_updated: ticker.updated_at,
            source: 'supabase',
            confidence: 'high'
          })
        })
        if (supabaseTickers.length > 0) {
          sourcesUsed.push('Supabase Real-time')
        }
      } catch (error) {
        console.warn('Supabase market data unavailable:', error)
      }

      // 2. Get CoinGecko data (high quality)
      try {
        const coinGeckoData = await coinGeckoApi.getTopCryptos(100)
        coinGeckoData.forEach(coin => {
          // Only add if not already in Supabase data
          const existingIndex = allData.findIndex(d => d.symbol === coin.symbol.toUpperCase())
          const coinData: UnifiedMarketData = {
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change_24h: coin.price_change_percentage_24h,
            volume_24h: coin.total_volume,
            market_cap: coin.market_cap,
            last_updated: coin.last_updated,
            source: 'coingecko',
            confidence: 'high'
          }

          if (existingIndex >= 0) {
            // Merge with existing data, prioritizing Supabase for price
            allData[existingIndex] = {
              ...coinData,
              price: allData[existingIndex].price, // Keep Supabase price
              bid_price: allData[existingIndex].bid_price,
              ask_price: allData[existingIndex].ask_price,
              spread: allData[existingIndex].spread,
              name: coinData.name, // Use CoinGecko name
              market_cap: coinData.market_cap, // Use CoinGecko market cap
              confidence: 'high'
            }
          } else {
            allData.push(coinData)
          }
        })
        sourcesUsed.push('CoinGecko')
      } catch (error) {
        console.warn('CoinGecko data unavailable:', error)
      }

      // 3. Get Jupiter/Solana data
      try {
        const jupiterData = await jupiterApi.getPopularTokensWithPrices(50)
        jupiterData.forEach(token => {
          const existingIndex = allData.findIndex(d => d.symbol === token.symbol.toUpperCase())
          const tokenData: UnifiedMarketData = {
            symbol: token.symbol.toUpperCase(),
            name: token.name,
            price: token.price,
            change_24h: token.change_24h,
            volume_24h: token.volume_24h,
            market_cap: token.market_cap,
            last_updated: token.updated_at,
            source: 'jupiter',
            confidence: 'medium'
          }

          if (existingIndex >= 0) {
            // Update if Jupiter has more recent data or if existing data is low confidence
            if (allData[existingIndex].confidence === 'low' || !allData[existingIndex].price) {
              allData[existingIndex] = { ...allData[existingIndex], ...tokenData, confidence: 'medium' }
            }
          } else {
            allData.push(tokenData)
          }
        })
        sourcesUsed.push('Jupiter')
      } catch (error) {
        console.warn('Jupiter data unavailable:', error)
      }

      // 4. Fallback to alternative sources if needed
      if (allData.length < 10) {
        try {
          const alternativeData = await alternativeMarketDataApi.getAggregatedMarketData()
          alternativeData.crypto.forEach(coin => {
            const existingIndex = allData.findIndex(d => d.symbol === coin.symbol.toUpperCase())
            if (existingIndex === -1) {
              allData.push({
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                price: coin.current_price,
                change_24h: coin.price_change_percentage_24h,
                volume_24h: coin.total_volume,
                market_cap: coin.market_cap,
                last_updated: new Date().toISOString(),
                source: 'coincap',
                confidence: 'medium'
              })
            }
          })
          sourcesUsed.push(...alternativeData.sources)
        } catch (error) {
          console.warn('Alternative data sources unavailable:', error)
        }
      }

    } catch (error) {
      console.error('Failed to aggregate market data:', error)
    }

    // Sort by market cap (if available) and confidence
    allData.sort((a, b) => {
      // First sort by confidence
      const confidenceOrder = { high: 3, medium: 2, low: 1 }
      const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
      if (confDiff !== 0) return confDiff
      
      // Then by market cap
      const aMarketCap = a.market_cap || 0
      const bMarketCap = b.market_cap || 0
      return bMarketCap - aMarketCap
    })

    const result: MarketDataAggregation = {
      data: allData,
      sources_used: sourcesUsed,
      last_updated: new Date().toISOString(),
      total_symbols: allData.length,
      live_symbols: allData.filter(d => d.source === 'supabase' && d.bid_price && d.ask_price).length
    }

    this.setCache(cacheKey, result, 1 * 60 * 1000) // Cache for 1 minute
    return result
  }

  // Get specific token data with all available information
  static async getTokenData(symbol: string): Promise<UnifiedMarketData | null> {
    symbol = symbol.toUpperCase()
    
    // Try to get from real-time feed first
    try {
      const supabaseTicker = await RealTimeDataService.getMarketTicker(symbol)
      if (supabaseTicker) {
        return {
          symbol: supabaseTicker.symbol,
          name: supabaseTicker.symbol,
          price: supabaseTicker.last_price,
          change_24h: supabaseTicker.change_percent_24h,
          volume_24h: supabaseTicker.volume_24h,
          bid_price: supabaseTicker.best_bid,
          ask_price: supabaseTicker.best_ask,
          spread: supabaseTicker.best_ask - supabaseTicker.best_bid,
          last_updated: supabaseTicker.updated_at,
          source: 'supabase',
          confidence: 'high'
        }
      }
    } catch (error) {
      console.warn('Real-time data unavailable for', symbol)
    }

    // Fallback to aggregated data
    const aggregatedData = await this.getAggregatedMarketData()
    return aggregatedData.data.find(d => d.symbol === symbol) || null
  }

  // Get live order book data
  static async getOrderBookData(symbol: string, levels: number = 10) {
    try {
      // Try to get from agents table first (for AI agents)
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .single()

      if (agent) {
        return await RealTimeDataService.getOrderBook(agent.id, levels)
      }
    } catch (error) {
      console.warn('Order book data unavailable for', symbol)
    }
    
    return null
  }

  // Get recent trades
  static async getRecentTrades(symbol: string, limit: number = 50) {
    try {
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .single()

      if (agent) {
        return await RealTimeDataService.getRecentTrades(agent.id, limit)
      }
    } catch (error) {
      console.warn('Recent trades data unavailable for', symbol)
    }
    
    return []
  }

  // Subscribe to real-time updates for specific symbols
  static subscribeToMarketUpdates(symbols: string[], callback: (data: UnifiedMarketData) => void) {
    // Convert symbols to agent IDs if needed
    return RealTimeDataService.subscribeToMarketData(symbols, (payload) => {
      if (payload.new) {
        const ticker = payload.new
        callback({
          symbol: ticker.symbol || ticker.agent_symbol,
          name: ticker.name || ticker.symbol,
          price: ticker.last_price || ticker.price,
          change_24h: ticker.change_percent_24h || ticker.change_24h,
          volume_24h: ticker.volume_24h || 0,
          market_cap: ticker.market_cap,
          bid_price: ticker.best_bid || ticker.bid_price,
          ask_price: ticker.best_ask || ticker.ask_price,
          last_updated: ticker.updated_at || ticker.timestamp,
          source: 'supabase',
          confidence: 'high'
        })
      }
    })
  }

  // Clean up resources
  static cleanup() {
    this.cache.clear()
    RealTimeDataService.unsubscribeAll()
  }
}

export type { UnifiedMarketData, MarketDataAggregation }