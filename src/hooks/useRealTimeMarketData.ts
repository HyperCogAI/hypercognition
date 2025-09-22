import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type MarketDataFeed = Database['public']['Tables']['market_data_feeds']['Row']
type MarketTicker = Database['public']['Tables']['market_tickers']['Row']
type OrderBookEntry = Database['public']['Tables']['order_book']['Row']
type MarketTrade = Database['public']['Tables']['market_trades']['Row']

interface UseRealTimeMarketDataProps {
  agentIds?: string[]
  enableOrderBook?: boolean
  enableTrades?: boolean
  maxOrderBookLevels?: number
}

interface MarketDataState {
  tickers: Record<string, MarketTicker>
  orderBooks: Record<string, { bids: OrderBookEntry[], asks: OrderBookEntry[] }>
  recentTrades: Record<string, MarketTrade[]>
  isConnected: boolean
  lastUpdate: Date | null
}

export function useRealTimeMarketData({
  agentIds = [],
  enableOrderBook = true,
  enableTrades = true,
  maxOrderBookLevels = 20
}: UseRealTimeMarketDataProps = {}) {
  const [marketData, setMarketData] = useState<MarketDataState>({
    tickers: {},
    orderBooks: {},
    recentTrades: {},
    isConnected: false,
    lastUpdate: null
  })

  const channelsRef = useRef<any[]>([])

  // Update ticker data
  const updateTicker = useCallback((agentId: string, ticker: MarketTicker) => {
    setMarketData(prev => ({
      ...prev,
      tickers: {
        ...prev.tickers,
        [agentId]: ticker
      },
      lastUpdate: new Date()
    }))
  }, [])

  // Update order book data
  const updateOrderBook = useCallback((agentId: string, entry: OrderBookEntry) => {
    setMarketData(prev => {
      const currentOrderBook = prev.orderBooks[agentId] || { bids: [], asks: [] }
      
      // Update or add the order book entry
      const side = entry.side as 'bid' | 'ask'
      const sideKey = side === 'bid' ? 'bids' : 'asks'
      
      let updatedSide = currentOrderBook[sideKey].filter(e => e.price !== entry.price)
      
      // Only add if size > 0 (remove if size is 0)
      if (entry.size > 0) {
        updatedSide.push(entry)
      }
      
      // Sort and limit levels
      if (side === 'bid') {
        updatedSide.sort((a, b) => b.price - a.price) // Highest first for bids
      } else {
        updatedSide.sort((a, b) => a.price - b.price) // Lowest first for asks
      }
      
      updatedSide = updatedSide.slice(0, maxOrderBookLevels)

      return {
        ...prev,
        orderBooks: {
          ...prev.orderBooks,
          [agentId]: {
            ...currentOrderBook,
            [sideKey]: updatedSide
          }
        },
        lastUpdate: new Date()
      }
    })
  }, [maxOrderBookLevels])

  // Update recent trades
  const updateTrades = useCallback((agentId: string, trade: MarketTrade) => {
    setMarketData(prev => {
      const currentTrades = prev.recentTrades[agentId] || []
      const updatedTrades = [trade, ...currentTrades].slice(0, 100) // Keep last 100 trades

      return {
        ...prev,
        recentTrades: {
          ...prev.recentTrades,
          [agentId]: updatedTrades
        },
        lastUpdate: new Date()
      }
    })
  }, [])

  // Initialize real-time subscriptions
  useEffect(() => {
    // Clear existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel)
    })
    channelsRef.current = []

    if (agentIds.length === 0) return

    setMarketData(prev => ({ ...prev, isConnected: false }))

    // Subscribe to market tickers
    const tickerChannel = supabase
      .channel('market_tickers_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_tickers',
          filter: agentIds.length > 0 ? `agent_id=in.(${agentIds.join(',')})` : undefined
        },
        (payload) => {
          const ticker = payload.new as MarketTicker
          updateTicker(ticker.agent_id, ticker)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_tickers',
          filter: agentIds.length > 0 ? `agent_id=in.(${agentIds.join(',')})` : undefined
        },
        (payload) => {
          const ticker = payload.new as MarketTicker
          updateTicker(ticker.agent_id, ticker)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setMarketData(prev => ({ ...prev, isConnected: true }))
        }
      })

    channelsRef.current.push(tickerChannel)

    // Subscribe to order book updates
    if (enableOrderBook) {
      const orderBookChannel = supabase
        .channel('order_book_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_book',
            filter: agentIds.length > 0 ? `agent_id=in.(${agentIds.join(',')})` : undefined
          },
          (payload) => {
            const entry = payload.new as OrderBookEntry
            if (entry) {
              updateOrderBook(entry.agent_id, entry)
            }
          }
        )
        .subscribe()

      channelsRef.current.push(orderBookChannel)
    }

    // Subscribe to market trades
    if (enableTrades) {
      const tradesChannel = supabase
        .channel('market_trades_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'market_trades',
            filter: agentIds.length > 0 ? `agent_id=in.(${agentIds.join(',')})` : undefined
          },
          (payload) => {
            const trade = payload.new as MarketTrade
            updateTrades(trade.agent_id, trade)
          }
        )
        .subscribe()

      channelsRef.current.push(tradesChannel)
    }

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      channelsRef.current = []
    }
  }, [agentIds, enableOrderBook, enableTrades, updateTicker, updateOrderBook, updateTrades])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (agentIds.length === 0) return

      try {
        // Load initial tickers
        const { data: tickers } = await supabase
          .from('market_tickers')
          .select('*')
          .in('agent_id', agentIds)

        if (tickers) {
          const tickersMap = tickers.reduce((acc, ticker) => {
            acc[ticker.agent_id] = ticker
            return acc
          }, {} as Record<string, MarketTicker>)

          setMarketData(prev => ({
            ...prev,
            tickers: tickersMap
          }))
        }

        // Load initial order book data
        if (enableOrderBook) {
          const { data: orderBookData } = await supabase
            .from('order_book')
            .select('*')
            .in('agent_id', agentIds)
            .order('price', { ascending: false })
            .limit(maxOrderBookLevels * 2)

          if (orderBookData) {
            const orderBooksMap = orderBookData.reduce((acc, entry) => {
              const agentId = entry.agent_id
              if (!acc[agentId]) {
                acc[agentId] = { bids: [], asks: [] }
              }
              
              if (entry.side === 'bid') {
                acc[agentId].bids.push(entry)
              } else {
                acc[agentId].asks.push(entry)
              }
              
              return acc
            }, {} as Record<string, { bids: OrderBookEntry[], asks: OrderBookEntry[] }>)

            // Sort and limit each side
            Object.keys(orderBooksMap).forEach(agentId => {
              orderBooksMap[agentId].bids.sort((a, b) => b.price - a.price)
              orderBooksMap[agentId].asks.sort((a, b) => a.price - b.price)
              orderBooksMap[agentId].bids = orderBooksMap[agentId].bids.slice(0, maxOrderBookLevels)
              orderBooksMap[agentId].asks = orderBooksMap[agentId].asks.slice(0, maxOrderBookLevels)
            })

            setMarketData(prev => ({
              ...prev,
              orderBooks: orderBooksMap
            }))
          }
        }

        // Load recent trades
        if (enableTrades) {
          const { data: trades } = await supabase
            .from('market_trades')
            .select('*')
            .in('agent_id', agentIds)
            .order('timestamp', { ascending: false })
            .limit(100)

          if (trades) {
            const tradesMap = trades.reduce((acc, trade) => {
              const agentId = trade.agent_id
              if (!acc[agentId]) {
                acc[agentId] = []
              }
              acc[agentId].push(trade)
              return acc
            }, {} as Record<string, MarketTrade[]>)

            setMarketData(prev => ({
              ...prev,
              recentTrades: tradesMap
            }))
          }
        }
      } catch (error) {
        console.error('Error loading initial market data:', error)
      }
    }

    loadInitialData()
  }, [agentIds, enableOrderBook, enableTrades, maxOrderBookLevels])

  const getTickerForAgent = useCallback((agentId: string) => {
    return marketData.tickers[agentId] || null
  }, [marketData.tickers])

  const getOrderBookForAgent = useCallback((agentId: string) => {
    return marketData.orderBooks[agentId] || { bids: [], asks: [] }
  }, [marketData.orderBooks])

  const getTradesForAgent = useCallback((agentId: string) => {
    return marketData.recentTrades[agentId] || []
  }, [marketData.recentTrades])

  return {
    ...marketData,
    getTickerForAgent,
    getOrderBookForAgent,
    getTradesForAgent
  }
}