import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { alternativeMarketDataApi } from '@/lib/apis/alternativeMarketData'
import { RealTimeDataService } from '@/services/RealTimeDataService'

interface LiveMarketFeed {
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap?: number
  bid_price?: number
  ask_price?: number
  last_trade_time: string
  source: string
}

interface MarketFeedState {
  feeds: Record<string, LiveMarketFeed>
  isConnected: boolean
  lastUpdate: Date | null
  error: string | null
}

export const useLiveMarketFeed = (symbols: string[] = []) => {
  const [state, setState] = useState<MarketFeedState>({
    feeds: {},
    isConnected: false,
    lastUpdate: null,
    error: null
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  const updateFeeds = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      // Get live prices from alternative sources
      const livePrices = await alternativeMarketDataApi.getLivePrices(symbols)
      
      // Get real-time data from Supabase if available
      const marketTickers = await RealTimeDataService.getAllMarketTickers()
      
      const newFeeds: Record<string, LiveMarketFeed> = {}
      
      // Process external live data
      livePrices.forEach(priceData => {
        newFeeds[priceData.symbol] = {
          symbol: priceData.symbol,
          price: priceData.price,
          change_24h: priceData.change_24h,
          volume_24h: priceData.volume_24h,
          market_cap: priceData.market_cap,
          last_trade_time: priceData.timestamp,
          source: 'external'
        }
      })
      
      // Merge with Supabase market tickers (prioritize Supabase data)
      marketTickers.forEach(ticker => {
        if (ticker && typeof ticker === 'object' && 'symbol' in ticker) {
          newFeeds[ticker.symbol as string] = {
            symbol: ticker.symbol as string,
            price: (ticker.last_price as number) || 0,
            change_24h: (ticker.change_24h as number) || 0,
            volume_24h: (ticker.volume_24h as number) || 0,
            market_cap: undefined,
            bid_price: ticker.best_bid as number,
            ask_price: ticker.best_ask as number,
            last_trade_time: (ticker.updated_at as string) || new Date().toISOString(),
            source: 'supabase'
          }
        }
      })
      
      setState(prev => ({
        ...prev,
        feeds: newFeeds,
        isConnected: true,
        lastUpdate: new Date()
      }))
      
    } catch (error) {
      console.error('Failed to update market feeds:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch live market data',
        isConnected: false
      }))
    }
  }, [symbols])

  // Set up real-time subscriptions for Supabase data
  const setupRealtimeSubscriptions = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Subscribe to market data updates
    channelRef.current = supabase
      .channel('live-market-feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_tickers'
        },
        (payload) => {
          console.log('Real-time market update:', payload)
          
          if (payload.new && typeof payload.new === 'object') {
            const ticker = payload.new as any
            if ('symbol' in ticker) {
              setState(prev => ({
                ...prev,
                feeds: {
                  ...prev.feeds,
                  [ticker.symbol]: {
                    symbol: ticker.symbol,
                    price: ticker.last_price || 0,
                    change_24h: ticker.change_24h || 0,
                    volume_24h: ticker.volume_24h || 0,
                    bid_price: ticker.best_bid,
                    ask_price: ticker.best_ask,
                    last_trade_time: ticker.updated_at || new Date().toISOString(),
                    source: 'supabase-realtime'
                  }
                },
                lastUpdate: new Date(),
                isConnected: true
              }))
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data_feeds'
        },
        (payload) => {
          console.log('Market data feed update:', payload)
          updateFeeds() // Refresh all data when market data updates
        }
      )
      .subscribe((status) => {
        console.log('Market feed subscription status:', status)
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }))
      })
  }, [updateFeeds])

  useEffect(() => {
    if (symbols.length === 0) return

    // Initial data fetch
    updateFeeds()
    
    // Set up real-time subscriptions
    setupRealtimeSubscriptions()
    
    // Set up periodic refresh (every 30 seconds for live trading data)
    intervalRef.current = setInterval(updateFeeds, 30 * 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [symbols, updateFeeds, setupRealtimeSubscriptions])

  const getFeed = useCallback((symbol: string): LiveMarketFeed | null => {
    return state.feeds[symbol.toUpperCase()] || null
  }, [state.feeds])

  const getPrice = useCallback((symbol: string): number => {
    const feed = getFeed(symbol)
    return feed?.price || 0
  }, [getFeed])

  const getSpread = useCallback((symbol: string): number => {
    const feed = getFeed(symbol)
    if (feed?.bid_price && feed?.ask_price) {
      return feed.ask_price - feed.bid_price
    }
    return 0
  }, [getFeed])

  return {
    ...state,
    getFeed,
    getPrice,
    getSpread,
    refresh: updateFeeds,
    symbols: Object.keys(state.feeds)
  }
}